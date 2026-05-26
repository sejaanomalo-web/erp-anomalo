import { NextResponse, type NextRequest } from "next/server";
import { createClient as createBrowserStyleClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit/logger";

export const dynamic = "force-dynamic";

/**
 * Hard-delete de usuário. Permissão: admin da mesma empresa.
 * Não permite auto-exclusão (admin não pode se excluir).
 * Recusa se houver vendas, lançamentos ou produções vinculadas — usuário
 * precisa primeiro reatribuir ou excluir esses registros.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
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
  if (!profile?.empresa_id) {
    return NextResponse.json(
      { message: "Perfil sem empresa." },
      { status: 400 },
    );
  }
  if (profile.papel !== "admin") {
    return NextResponse.json(
      { message: "Apenas admin pode excluir usuários." },
      { status: 403 },
    );
  }
  if (profile.id === id) {
    return NextResponse.json(
      { message: "Você não pode excluir o próprio usuário." },
      { status: 400 },
    );
  }

  const { data: alvo } = await supabase
    .from("profiles")
    .select("id, empresa_id, nome, email, papel")
    .eq("id", id)
    .maybeSingle();
  if (!alvo) {
    return NextResponse.json(
      { message: "Usuário não encontrado." },
      { status: 404 },
    );
  }
  if (alvo.empresa_id !== profile.empresa_id) {
    return NextResponse.json(
      { message: "Sem permissão para excluir usuário de outra empresa." },
      { status: 403 },
    );
  }

  // Verifica vínculos críticos antes de tentar deletar
  const [vendasRes, lancVendComRes, lancRespRes, prodRes, intRes] =
    await Promise.all([
      supabase
        .from("vendas")
        .select("id", { count: "exact", head: true })
        .eq("vendedor_id", id),
      supabase
        .from("lancamentos_financeiros")
        .select("id", { count: "exact", head: true })
        .eq("vendedor_comissao_id", id),
      supabase
        .from("lancamentos_financeiros")
        .select("id", { count: "exact", head: true })
        .eq("responsavel_id", id),
      supabase
        .from("producoes")
        .select("id", { count: "exact", head: true })
        .eq("responsavel_id", id),
      supabase
        .from("interacoes")
        .select("id", { count: "exact", head: true })
        .eq("usuario_id", id),
    ]);

  const vinculos: string[] = [];
  if ((vendasRes.count ?? 0) > 0)
    vinculos.push(`${vendasRes.count} venda(s) como vendedor`);
  if ((lancVendComRes.count ?? 0) > 0)
    vinculos.push(`${lancVendComRes.count} lançamento(s) de comissão`);
  if ((lancRespRes.count ?? 0) > 0)
    vinculos.push(
      `${lancRespRes.count} lançamento(s) financeiro(s) como responsável`,
    );
  if ((prodRes.count ?? 0) > 0)
    vinculos.push(`${prodRes.count} produção(ões) como responsável`);
  if ((intRes.count ?? 0) > 0)
    vinculos.push(`${intRes.count} interação(ões) registradas`);

  if (vinculos.length > 0) {
    return NextResponse.json(
      {
        message: `Não dá para excluir. Este usuário tem ${vinculos.join(
          ", ",
        )}. Desative em vez de excluir, ou reatribua/exclua esses registros primeiro.`,
        vinculos,
      },
      { status: 409 },
    );
  }

  const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceUrl || !serviceKey) {
    return NextResponse.json(
      {
        message:
          "Exclusão indisponível: SUPABASE_SERVICE_ROLE_KEY não está configurada na Vercel.",
      },
      { status: 500 },
    );
  }

  const admin = createBrowserStyleClient(serviceUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1) Deleta profile
  const { error: profErr } = await admin
    .from("profiles")
    .delete()
    .eq("id", id);
  if (profErr) {
    return NextResponse.json(
      { message: `Falha ao remover perfil: ${profErr.message}` },
      { status: 500 },
    );
  }

  // 2) Deleta o usuário de auth.users (libera o e-mail para reuso)
  const { error: authErr } = await admin.auth.admin.deleteUser(id);
  if (authErr) {
    // Profile já foi removido; alerta no audit mas não falha o request
    await logAudit({
      modulo: "vendedores",
      acao: "delete_partial",
      entidade: "profiles",
      entidadeId: id,
      dadosAntes: JSON.parse(JSON.stringify(alvo)),
      dadosDepois: { erro_auth: authErr.message },
    });
    return NextResponse.json(
      {
        message: `Perfil removido, mas conta de auth ficou: ${authErr.message}`,
      },
      { status: 207 },
    );
  }

  await logAudit({
    modulo: "vendedores",
    acao: "delete",
    entidade: "profiles",
    entidadeId: id,
    dadosAntes: JSON.parse(JSON.stringify(alvo)),
  });

  return NextResponse.json({ ok: true });
}
