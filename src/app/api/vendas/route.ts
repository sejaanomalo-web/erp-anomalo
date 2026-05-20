import { NextResponse, type NextRequest } from "next/server";
import { addDays } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { criarVendaSchema } from "@/lib/validation/vendas";
import { logAudit } from "@/lib/audit/logger";
import { COMISSAO_DEFAULT_PERCENT } from "@/lib/constants";

export const dynamic = "force-dynamic";

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

  if (!profile?.empresa_id) {
    return NextResponse.json(
      { message: "Perfil sem empresa vinculada." },
      { status: 400 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = criarVendaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: parsed.error.issues[0]?.message ?? "Dados inválidos.",
      },
      { status: 422 },
    );
  }
  const input = parsed.data;

  // Calcula valores derivados
  const valorItens = input.itens.reduce(
    (acc, i) => acc + i.quantidade * i.valor_unitario,
    0,
  );
  const valorTotal = Math.max(0, valorItens - input.desconto);
  const comissaoPercentual = COMISSAO_DEFAULT_PERCENT;
  const comissaoValor = (valorTotal * comissaoPercentual) / 100;

  // 1. Insert venda
  const { data: venda, error: vendaError } = await supabase
    .from("vendas")
    .insert({
      empresa_id: profile.empresa_id,
      cliente_id: input.cliente_id,
      vendedor_id: profile.id,
      valor_total: valorTotal,
      desconto: input.desconto,
      forma_pagamento: input.forma_pagamento ?? null,
      parcelas: input.parcelas,
      comissao_percentual: comissaoPercentual,
      comissao_valor: comissaoValor,
      data_venda: input.data_venda,
      data_prevista_producao: input.data_prevista_producao ?? null,
      data_prevista_entrega: input.data_prevista_entrega,
      observacoes: input.observacoes ?? null,
    })
    .select("id, numero")
    .single();

  if (vendaError || !venda) {
    return NextResponse.json(
      { message: vendaError?.message ?? "Falha ao registrar venda." },
      { status: 500 },
    );
  }

  // 2. Insert itens
  const itensPayload = input.itens.map((item) => ({
    venda_id: venda.id,
    produto_variante_id: item.produto_variante_id,
    quantidade: item.quantidade,
    valor_unitario: item.valor_unitario,
    customizacoes: item.customizacoes
      ? { texto: item.customizacoes }
      : null,
  }));

  const { data: itensCriados, error: itensError } = await supabase
    .from("venda_itens")
    .insert(itensPayload)
    .select("id");

  if (itensError) {
    // rollback simples: remove a venda criada
    await supabase.from("vendas").delete().eq("id", venda.id);
    return NextResponse.json(
      { message: `Falha ao registrar itens: ${itensError.message}` },
      { status: 500 },
    );
  }

  // 3. Cria registros de produção (um por item)
  const producoesPayload = (itensCriados ?? []).map((it) => ({
    venda_id: venda.id,
    venda_item_id: it.id,
    status: "aguardando_inicio",
    data_inicio_prevista: input.data_prevista_producao ?? input.data_venda,
    data_fim_prevista: input.data_prevista_entrega,
  }));
  if (producoesPayload.length > 0) {
    await supabase.from("producoes").insert(producoesPayload);
  }

  // 4. Lançamento de comissão a pagar (com vencimento default 30d após venda)
  await supabase.from("lancamentos_financeiros").insert({
    empresa_id: profile.empresa_id,
    tipo: "saida",
    descricao: `Comissão venda #${venda.numero}`,
    valor: comissaoValor,
    data_competencia: input.data_venda,
    data_vencimento: addDays(new Date(input.data_venda), 30)
      .toISOString()
      .slice(0, 10),
    status: "pendente",
    venda_id: venda.id,
    vendedor_comissao_id: profile.id,
    responsavel_id: profile.id,
  });

  // 5. Audit
  await logAudit({
    modulo: "vendas",
    acao: "create",
    entidade: "vendas",
    entidadeId: venda.id,
    dadosDepois: { numero: venda.numero, valor_total: valorTotal },
  });

  return NextResponse.json({ id: venda.id, numero: venda.numero });
}
