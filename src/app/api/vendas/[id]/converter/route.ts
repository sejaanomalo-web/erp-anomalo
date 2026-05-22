import { NextResponse, type NextRequest } from "next/server";
import { addDays } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit/logger";
import { COMISSAO_DEFAULT_PERCENT } from "@/lib/constants";

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
      "id, numero, empresa_id, vendedor_id, tipo, status, valor_total, data_venda, data_prevista_entrega, data_prevista_producao, forma_pagamento",
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

  const valorTotal = Number(venda.valor_total);
  const comissaoValor = (valorTotal * COMISSAO_DEFAULT_PERCENT) / 100;

  const { error: updateErr } = await supabase
    .from("vendas")
    .update({
      tipo: "venda",
      status: "aguardando_producao",
      comissao_percentual: COMISSAO_DEFAULT_PERCENT,
      comissao_valor: comissaoValor,
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

  // Lançamento de comissão
  await supabase.from("lancamentos_financeiros").insert({
    empresa_id: profile.empresa_id,
    tipo: "saida",
    descricao: `Comissão venda #${venda.numero}`,
    valor: comissaoValor,
    data_competencia: venda.data_venda,
    data_vencimento: addDays(new Date(venda.data_venda), 30)
      .toISOString()
      .slice(0, 10),
    status: "pendente",
    forma_pagamento: venda.forma_pagamento,
    venda_id: id,
    vendedor_comissao_id: venda.vendedor_id,
    responsavel_id: profile.id,
  });

  await logAudit({
    modulo: "vendas",
    acao: "converter_orcamento",
    entidade: "vendas",
    entidadeId: id,
    dadosAntes: { tipo: "orcamento" },
    dadosDepois: { tipo: "venda", comissao_valor: comissaoValor },
  });

  return NextResponse.json({ ok: true });
}
