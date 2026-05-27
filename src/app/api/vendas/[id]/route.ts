import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { atualizarVendaSchema } from "@/lib/validation/vendas";
import { logAudit } from "@/lib/audit/logger";

export const dynamic = "force-dynamic";

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

  const { data: venda } = await supabase
    .from("vendas")
    .select("id, numero, empresa_id, vendedor_id, tipo, status, valor_total")
    .eq("id", id)
    .maybeSingle();
  if (!venda) {
    return NextResponse.json(
      { message: "Venda não encontrada." },
      { status: 404 },
    );
  }

  // Permissão: admin/gestor podem excluir qualquer; vendedor só as próprias
  // E SÓ se ainda for orçamento (depois de fechada, exige admin/gestor).
  const ehAdminOuGestor = ["admin", "gestor"].includes(
    profile.papel as string,
  );
  const ehDono = (venda.vendedor_id as string) === profile.id;
  const podeExcluir =
    ehAdminOuGestor ||
    (ehDono && profile.papel === "vendedor" && venda.tipo === "orcamento");

  if (!podeExcluir) {
    return NextResponse.json(
      {
        message:
          venda.tipo === "venda"
            ? "Apenas admin ou gestor pode excluir uma venda fechada."
            : "Sem permissão para excluir.",
      },
      { status: 403 },
    );
  }

  // Captura snapshot completo ANTES de qualquer delete, pra audit log preservar
  // o rastro do que foi removido em cascata (itens, lançamentos, produções).
  const [snapshotItens, snapshotLancamentos, snapshotProducoes] =
    await Promise.all([
      supabase.from("venda_itens").select("*").eq("venda_id", id),
      supabase
        .from("lancamentos_financeiros")
        .select("*")
        .eq("venda_id", id),
      supabase.from("producoes").select("*").eq("venda_id", id),
    ]);

  // Limpa lançamentos financeiros e produções vinculados antes de remover a venda.
  await supabase.from("lancamentos_financeiros").delete().eq("venda_id", id);
  await supabase.from("producoes").delete().eq("venda_id", id);
  // venda_itens é CASCADE pelo fk; excluir venda cuida.

  const { error: deleteErr } = await supabase
    .from("vendas")
    .delete()
    .eq("id", id);
  if (deleteErr) {
    return NextResponse.json(
      { message: deleteErr.message },
      { status: 500 },
    );
  }

  await logAudit({
    modulo: "vendas",
    acao: "delete",
    entidade: "vendas",
    entidadeId: id,
    dadosAntes: JSON.parse(
      JSON.stringify({
        venda,
        itens: snapshotItens.data ?? [],
        lancamentos: snapshotLancamentos.data ?? [],
        producoes: snapshotProducoes.data ?? [],
      }),
    ),
  });

  return NextResponse.json({ ok: true });
}

export async function PATCH(
  request: NextRequest,
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Corpo da requisição inválido (JSON malformado)." },
      { status: 400 },
    );
  }
  const parsed = atualizarVendaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 422 },
    );
  }
  const input = parsed.data;

  // Estado anterior para audit + cálculo
  const { data: vendaAtual, error: vendaErr } = await supabase
    .from("vendas")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (vendaErr || !vendaAtual) {
    return NextResponse.json(
      { message: "Venda não encontrada." },
      { status: 404 },
    );
  }

  // Vendedor só pode editar a própria; admin/gestor podem editar qualquer.
  if (
    profile.papel === "vendedor" &&
    (vendaAtual.vendedor_id as string) !== profile.id
  ) {
    return NextResponse.json(
      { message: "Você só pode editar as próprias vendas." },
      { status: 403 },
    );
  }
  if (!["admin", "gestor", "vendedor"].includes(profile.papel as string)) {
    return NextResponse.json(
      { message: "Sem permissão para editar vendas." },
      { status: 403 },
    );
  }

  // Validação do vendedor escolhido (se informado)
  let vendedorIdFinal: string | undefined;
  if (input.vendedor_id) {
    if (
      input.vendedor_id !== profile.id &&
      !["admin", "gestor"].includes(profile.papel as string)
    ) {
      return NextResponse.json(
        { message: "Sem permissão para reatribuir vendedor." },
        { status: 403 },
      );
    }
    const { data: vend } = await supabase
      .from("profiles")
      .select("id, empresa_id, papel, ativo")
      .eq("id", input.vendedor_id)
      .maybeSingle();
    if (
      !vend ||
      vend.empresa_id !== profile.empresa_id ||
      !["admin", "gestor", "vendedor"].includes(vend.papel as string) ||
      !vend.ativo
    ) {
      return NextResponse.json(
        { message: "Vendedor inválido." },
        { status: 422 },
      );
    }
    vendedorIdFinal = vend.id as string;
  }

  // Atualiza itens primeiro para recalcular valor_total
  if (input.itens && input.itens.length > 0) {
    const idsManter = input.itens
      .map((it) => it.id)
      .filter((x): x is string => Boolean(x));

    // Remove itens que sumiram do payload
    const { data: existentes } = await supabase
      .from("venda_itens")
      .select("id")
      .eq("venda_id", id);
    const idsExistentes = (existentes ?? []).map((e) => e.id as string);
    const aRemover = idsExistentes.filter((x) => !idsManter.includes(x));
    if (aRemover.length > 0) {
      await supabase.from("venda_itens").delete().in("id", aRemover);
    }

    for (const it of input.itens) {
      const payload = {
        venda_id: id,
        produto_descricao: it.produto_descricao.trim(),
        quantidade: it.quantidade,
        valor_unitario: it.valor_unitario,
        observacoes: it.observacoes?.trim() || null,
        foto_modelo_url: it.foto_modelo_url ?? null,
        foto_tecido_url: it.foto_tecido_url ?? null,
      };
      if (it.id) {
        await supabase.from("venda_itens").update(payload).eq("id", it.id);
      } else {
        await supabase.from("venda_itens").insert(payload);
      }
    }
  }

  // Recalcula valor_total a partir dos itens atuais
  const { data: itensAtuais } = await supabase
    .from("venda_itens")
    .select("quantidade, valor_unitario")
    .eq("venda_id", id);
  const valorItens = (itensAtuais ?? []).reduce(
    (acc, it) =>
      acc + Number(it.quantidade ?? 0) * Number(it.valor_unitario ?? 0),
    0,
  );
  const novoDesconto = input.desconto ?? Number(vendaAtual.desconto ?? 0);
  const novaTaxa = input.taxa ?? Number(vendaAtual.taxa ?? 0);
  const novoValorTotal = Math.max(0, valorItens - novoDesconto - novaTaxa);

  const updates: Record<string, unknown> = {};
  if (vendedorIdFinal) updates.vendedor_id = vendedorIdFinal;
  if (input.tipo) updates.tipo = input.tipo;
  if (input.desconto !== undefined) updates.desconto = input.desconto;
  if (input.taxa !== undefined) updates.taxa = input.taxa;
  if (input.forma_pagamento !== undefined)
    updates.forma_pagamento = input.forma_pagamento;
  if (input.parcelas !== undefined) updates.parcelas = input.parcelas;
  if (input.data_venda) updates.data_venda = input.data_venda;
  if (input.data_prevista_entrega)
    updates.data_prevista_entrega = input.data_prevista_entrega;
  if (input.data_prevista_producao !== undefined)
    updates.data_prevista_producao = input.data_prevista_producao;
  if (input.observacoes !== undefined) updates.observacoes = input.observacoes;
  updates.valor_total = novoValorTotal;

  const { error: updateErr } = await supabase
    .from("vendas")
    .update(updates)
    .eq("id", id);
  if (updateErr) {
    return NextResponse.json(
      { message: updateErr.message },
      { status: 500 },
    );
  }

  await logAudit({
    modulo: "vendas",
    acao: "update",
    entidade: "vendas",
    entidadeId: id,
    dadosAntes: JSON.parse(JSON.stringify(vendaAtual)),
    dadosDepois: JSON.parse(JSON.stringify(updates)),
  });

  return NextResponse.json({ ok: true, id });
}
