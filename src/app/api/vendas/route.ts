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
      { message: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 422 },
    );
  }
  const input = parsed.data;

  // 0. Resolve cliente — se vier inline, cria/encontra primeiro.
  let clienteId = input.cliente_id ?? null;
  let clienteCriadoNovo = false;

  if (!clienteId && input.cliente_inline) {
    // Tenta achar cliente por telefone (chave natural) antes de criar duplicado.
    const telefoneLimpo = input.cliente_inline.telefone.replace(/\D/g, "");
    if (telefoneLimpo.length >= 8) {
      const { data: existente } = await supabase
        .from("clientes")
        .select("id")
        .eq("empresa_id", profile.empresa_id)
        .ilike("telefone", `%${telefoneLimpo.slice(-8)}%`)
        .maybeSingle();
      if (existente?.id) clienteId = existente.id as string;
    }

    if (!clienteId) {
      const { data: novoCliente, error: clienteErr } = await supabase
        .from("clientes")
        .insert({
          empresa_id: profile.empresa_id,
          nome: input.cliente_inline.nome.trim(),
          telefone: input.cliente_inline.telefone.trim(),
          cpf_cnpj: input.cliente_inline.cpf_cnpj?.trim() || null,
          endereco: input.cliente_inline.endereco
            ? { texto: input.cliente_inline.endereco }
            : null,
          origem: "venda",
        })
        .select("id")
        .single();
      if (clienteErr || !novoCliente) {
        return NextResponse.json(
          { message: clienteErr?.message ?? "Falha ao cadastrar cliente." },
          { status: 500 },
        );
      }
      clienteId = novoCliente.id as string;
      clienteCriadoNovo = true;
    }
  }

  if (!clienteId) {
    return NextResponse.json(
      { message: "Cliente obrigatório." },
      { status: 422 },
    );
  }

  // 1. Calcula valores derivados
  const valorItens = input.itens.reduce(
    (acc, i) => acc + i.quantidade * i.valor_unitario,
    0,
  );
  const valorTotal = Math.max(0, valorItens - input.desconto);
  const comissaoPercentual = COMISSAO_DEFAULT_PERCENT;
  const comissaoValor = (valorTotal * comissaoPercentual) / 100;
  const isOrcamento = input.tipo === "orcamento";

  // 2. Insert venda
  const { data: venda, error: vendaError } = await supabase
    .from("vendas")
    .insert({
      empresa_id: profile.empresa_id,
      cliente_id: clienteId,
      vendedor_id: profile.id,
      tipo: input.tipo,
      status: isOrcamento ? "aguardando_producao" : "aguardando_producao",
      valor_total: valorTotal,
      desconto: input.desconto,
      forma_pagamento: input.forma_pagamento ?? null,
      parcelas: input.parcelas,
      comissao_percentual: isOrcamento ? null : comissaoPercentual,
      comissao_valor: isOrcamento ? null : comissaoValor,
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

  // 3. Insert itens (texto livre + fotos + observacoes)
  const itensPayload = input.itens.map((item) => ({
    venda_id: venda.id,
    produto_descricao: item.produto_descricao.trim(),
    produto_variante_id: item.produto_variante_id ?? null,
    quantidade: item.quantidade,
    valor_unitario: item.valor_unitario,
    observacoes: item.observacoes?.trim() || null,
    foto_modelo_url: item.foto_modelo_url ?? null,
    foto_tecido_url: item.foto_tecido_url ?? null,
  }));

  const { data: itensCriados, error: itensError } = await supabase
    .from("venda_itens")
    .insert(itensPayload)
    .select("id");

  if (itensError) {
    // rollback simples
    await supabase.from("vendas").delete().eq("id", venda.id);
    if (clienteCriadoNovo) {
      await supabase.from("clientes").delete().eq("id", clienteId);
    }
    return NextResponse.json(
      { message: `Falha ao registrar itens: ${itensError.message}` },
      { status: 500 },
    );
  }

  // 4. Produção + comissão são criados SÓ quando é venda fechada.
  if (!isOrcamento) {
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
      forma_pagamento: input.forma_pagamento ?? null,
      venda_id: venda.id,
      vendedor_comissao_id: profile.id,
      responsavel_id: profile.id,
    });
  }

  // 5. Audit
  await logAudit({
    modulo: "vendas",
    acao: "create",
    entidade: "vendas",
    entidadeId: venda.id,
    dadosDepois: {
      numero: venda.numero,
      tipo: input.tipo,
      valor_total: valorTotal,
      cliente_inline: clienteCriadoNovo,
    },
  });

  return NextResponse.json({
    id: venda.id,
    numero: venda.numero,
    tipo: input.tipo,
    cliente_id: clienteId,
  });
}
