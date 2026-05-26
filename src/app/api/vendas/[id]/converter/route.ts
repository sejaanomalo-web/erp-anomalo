import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit/logger";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
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

  const { data: venda } = await supabase
    .from("vendas")
    .select(
      "id, numero, empresa_id, tipo, status, data_venda, data_prevista_entrega, data_prevista_producao",
    )
    .eq("id", id)
    .maybeSingle();

  if (!venda) {
    return NextResponse.json(
      { message: "Venda não encontrada." },
      { status: 404 },
    );
  }
  if (venda.tipo !== "orcamento") {
    return NextResponse.json(
      { message: "Esta venda já está fechada." },
      { status: 409 },
    );
  }

  const { error: updateErr } = await supabase
    .from("vendas")
    .update({
      tipo: "venda",
      status: "aguardando_producao",
    })
    .eq("id", id);

  if (updateErr) {
    return NextResponse.json({ message: updateErr.message }, { status: 500 });
  }

  // Cria produções para cada venda_item
  const { data: itens } = await supabase
    .from("venda_itens")
    .select("id")
    .eq("venda_id", id);

  const producoesPayload = ((itens ?? []) as { id: string }[]).map((it) => ({
    venda_id: id,
    venda_item_id: it.id,
    status: "aguardando_inicio",
    data_inicio_prevista: venda.data_prevista_producao ?? venda.data_venda,
    data_fim_prevista: venda.data_prevista_entrega,
  }));
  if (producoesPayload.length > 0) {
    await supabase.from("producoes").insert(producoesPayload);
  }

  await logAudit({
    modulo: "vendas",
    acao: "converter_orcamento",
    entidade: "vendas",
    entidadeId: id,
    dadosAntes: { tipo: "orcamento" },
    dadosDepois: { tipo: "venda" },
  });

  return NextResponse.json({ ok: true });
}
