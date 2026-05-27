import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient as createBrowserStyleClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit/logger";

export const dynamic = "force-dynamic";

const schema = z.object({
  nome: z.string().min(2, "Nome obrigatório."),
  email: z.string().email("E-mail inválido."),
  telefone: z.string().nullable().optional(),
  papel: z.enum(["admin", "gestor", "vendedor", "financeiro", "producao"]),
});

/**
 * Gera senha temporária forte. 14 caracteres com pelo menos
 * 1 maiúscula, 1 minúscula, 1 número e 1 símbolo simples.
 */
function gerarSenhaTemporaria(): string {
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const upper = "ABCDEFGHJKMNPQRSTUVWXYZ";
  const digits = "23456789";
  const symbols = "!@#$%&*";
  const all = lower + upper + digits + symbols;

  const pick = (set: string) =>
    set[Math.floor(Math.random() * set.length)] ?? "x";

  const base = [
    pick(lower),
    pick(upper),
    pick(digits),
    pick(symbols),
  ];
  for (let i = 0; i < 10; i++) base.push(pick(all));
  // Fisher-Yates
  for (let i = base.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [base[i], base[j]] = [base[j], base[i]];
  }
  return base.join("");
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, empresa_id, papel")
    .eq("id", user.id)
    .maybeSingle();

  if (
    !profile?.empresa_id ||
    !["admin", "gestor"].includes(profile.papel as string)
  ) {
    return NextResponse.json(
      { message: "Apenas admin ou gestor podem cadastrar vendedores." },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Corpo da requisição inválido (JSON malformado)." },
      { status: 400 },
    );
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 422 },
    );
  }
  const input = parsed.data;

  const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceUrl || !serviceKey) {
    return NextResponse.json(
      {
        message:
          "Cadastro indisponível: SUPABASE_SERVICE_ROLE_KEY não está configurada na Vercel.",
      },
      { status: 500 },
    );
  }

  const admin = createBrowserStyleClient(serviceUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Cria usuário DIRETAMENTE com email_confirm + senha temporária.
  // Sem dependência de Resend / SMTP. Você compartilha a senha
  // manualmente (WhatsApp / verbal / SMS) com o vendedor.
  const senhaTemporaria = gerarSenhaTemporaria();

  const { data: created, error: createErr } =
    await admin.auth.admin.createUser({
      email: input.email,
      password: senhaTemporaria,
      email_confirm: true,
      user_metadata: {
        nome: input.nome,
        papel: input.papel,
        empresa_id: profile.empresa_id,
      },
    });

  if (createErr || !created?.user) {
    // Se já existir, tenta resetar a senha do usuário existente.
    if (createErr?.message?.toLowerCase().includes("already")) {
      // Buscar usuário pelo email via Auth Admin API (listUsers paginated)
      const { data: list } = await admin.auth.admin.listUsers({
        page: 1,
        perPage: 200,
      });
      const existente = list?.users.find(
        (u) => u.email?.toLowerCase() === input.email.toLowerCase(),
      );
      if (existente) {
        const { error: updErr } = await admin.auth.admin.updateUserById(
          existente.id,
          { password: senhaTemporaria, email_confirm: true },
        );
        if (updErr) {
          return NextResponse.json(
            {
              message: `Usuário já existe e a senha não pôde ser redefinida: ${updErr.message}`,
            },
            { status: 500 },
          );
        }
        await admin
          .from("profiles")
          .update({
            nome: input.nome,
            papel: input.papel,
            telefone: input.telefone ?? null,
            empresa_id: profile.empresa_id,
            ativo: true,
          })
          .eq("id", existente.id);

        await logAudit({
          modulo: "vendedores",
          acao: "reset_password",
          entidade: "profiles",
          entidadeId: existente.id,
          dadosDepois: {
            email: input.email,
            papel: input.papel,
            empresa_id: profile.empresa_id,
          },
        });

        return NextResponse.json({
          usuario_id: existente.id,
          email: input.email,
          senha_temporaria: senhaTemporaria,
          ja_existia: true,
        });
      }
    }
    return NextResponse.json(
      { message: createErr?.message ?? "Falha ao cadastrar usuário." },
      { status: 500 },
    );
  }

  // Garante que o profile tem empresa_id, papel e telefone corretos.
  await admin
    .from("profiles")
    .update({
      nome: input.nome,
      papel: input.papel,
      telefone: input.telefone ?? null,
      empresa_id: profile.empresa_id,
      ativo: true,
    })
    .eq("id", created.user.id);

  await logAudit({
    modulo: "vendedores",
    acao: "create",
    entidade: "profiles",
    entidadeId: created.user.id,
    dadosDepois: {
      email: input.email,
      papel: input.papel,
      empresa_id: profile.empresa_id,
    },
  });

  return NextResponse.json({
    usuario_id: created.user.id,
    email: input.email,
    senha_temporaria: senhaTemporaria,
    ja_existia: false,
  });
}
