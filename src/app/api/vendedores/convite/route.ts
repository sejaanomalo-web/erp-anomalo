import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient as createBrowserStyleClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit/logger";
import { resolveAppUrl } from "@/lib/url";

export const dynamic = "force-dynamic";

const schema = z.object({
  nome: z.string().min(2, "Nome obrigatório."),
  email: z.string().email("E-mail inválido."),
  telefone: z.string().nullable().optional(),
  papel: z.enum(["admin", "gestor", "vendedor", "financeiro", "producao"]),
});

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
      { message: "Apenas admin ou gestor podem convidar vendedores." },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => null);
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
  const appUrl = resolveAppUrl(request);

  if (!serviceUrl || !serviceKey) {
    return NextResponse.json(
      {
        message:
          "Convite indisponível: SUPABASE_SERVICE_ROLE_KEY não está configurada na Vercel.",
      },
      { status: 500 },
    );
  }

  const admin = createBrowserStyleClient(serviceUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: invite, error: inviteErr } =
    await admin.auth.admin.inviteUserByEmail(input.email, {
      data: {
        nome: input.nome,
        papel: input.papel,
        empresa_id: profile.empresa_id,
      },
      redirectTo: `${appUrl}/login`,
    });

  if (inviteErr || !invite?.user) {
    return NextResponse.json(
      { message: inviteErr?.message ?? "Falha ao gerar convite." },
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
    })
    .eq("id", invite.user.id);

  // Gera magic link para acesso imediato.
  const { data: magicLink } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: input.email,
    options: { redirectTo: `${appUrl}/login` },
  });

  await logAudit({
    modulo: "vendedores",
    acao: "invite",
    entidade: "profiles",
    entidadeId: invite.user.id,
    dadosDepois: {
      email: input.email,
      papel: input.papel,
      empresa_id: profile.empresa_id,
    },
  });

  return NextResponse.json({
    usuario_id: invite.user.id,
    link: magicLink?.properties?.action_link ?? null,
    senha_temporaria: null,
  });
}
