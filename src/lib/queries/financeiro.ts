"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "./keys";
import { getPerfilAutenticado } from "@/lib/auth/perfil";
import type { FinanceiroStatus } from "@/types/database.types";

// ============================================================
// Idioma do banco: tipo "entrada"/"saida", status "pendente"/"pago".
// A UI apresenta: entrada=Receita, saida=Despesa; pendente=Previsto,
// pago=Realizado. Helpers de rótulo abaixo.
// ============================================================

export type TipoFin = "entrada" | "saida";

export function tipoRotulo(tipo: TipoFin): string {
  return tipo === "entrada" ? "Receita" : "Despesa";
}

export function statusRotulo(status: FinanceiroStatus): string {
  switch (status) {
    case "pendente":
      return "Previsto";
    case "pago":
      return "Realizado";
    case "atrasado":
      return "Atrasado";
    case "cancelado":
      return "Cancelado";
    default:
      return status;
  }
}

export const TIPO_CONTA_ROTULO: Record<string, string> = {
  banco: "Banco",
  caixa: "Caixa",
  cartao_credito: "Cartão de crédito",
  investimento: "Investimento",
};

function hojeISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// ============================================================
// Lançamentos
// ============================================================

export interface LancamentoRow {
  id: string;
  tipo: TipoFin;
  descricao: string;
  valor: number;
  data_competencia: string;
  data_vencimento: string | null;
  data_pagamento: string | null;
  status: FinanceiroStatus;
  forma_pagamento: string | null;
  categoria_id: string | null;
  categoria: { nome: string; cor: string | null } | null;
  conta_id: string | null;
  conta: { nome: string } | null;
  recorrente_id: string | null;
  venda_id: string | null;
  observacoes: string | null;
  origem: string | null;
  created_at: string;
}

export interface LancamentosFiltros {
  tipo?: TipoFin;
  inicio: string;
  fim: string;
  status?: FinanceiroStatus | "todos";
  formaPagamento?: string | "todas";
  categoriaId?: string;
  contaId?: string;
}

const LANC_SELECT =
  "id, tipo, descricao, valor, data_competencia, data_vencimento, data_pagamento, status, forma_pagamento, categoria_id, categoria:categorias_financeiras(nome, cor), conta_id, conta:contas_financeiras(nome), recorrente_id, venda_id, observacoes, origem, created_at";

export function useLancamentos(filtros: LancamentosFiltros) {
  return useQuery({
    queryKey: ["financeiro", "lancamentos", filtros],
    queryFn: async () => {
      const supabase = createClient();
      let q = supabase
        .from("lancamentos_financeiros")
        .select(LANC_SELECT)
        .gte("data_competencia", filtros.inicio)
        .lte("data_competencia", filtros.fim)
        .order("data_competencia", { ascending: false })
        .limit(500);

      if (filtros.tipo) q = q.eq("tipo", filtros.tipo);
      if (filtros.status && filtros.status !== "todos")
        q = q.eq("status", filtros.status);
      if (filtros.formaPagamento && filtros.formaPagamento !== "todas")
        q = q.eq("forma_pagamento", filtros.formaPagamento);
      if (filtros.categoriaId) q = q.eq("categoria_id", filtros.categoriaId);
      if (filtros.contaId) q = q.eq("conta_id", filtros.contaId);

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as LancamentoRow[];
    },
  });
}

export interface LancamentoInput {
  tipo: TipoFin;
  descricao: string;
  valor: number;
  data_competencia: string;
  data_vencimento?: string | null;
  data_pagamento?: string | null;
  status: FinanceiroStatus;
  forma_pagamento?: string | null;
  categoria_id?: string | null;
  conta_id?: string | null;
  observacoes?: string | null;
  origem?: string | null;
}

export function useCriarLancamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: LancamentoInput) => {
      const supabase = createClient();
      const perfil = await getPerfilAutenticado(supabase);
      const { data, error } = await supabase
        .from("lancamentos_financeiros")
        .insert({
          empresa_id: perfil.empresa_id,
          responsavel_id: perfil.id,
          tipo: input.tipo,
          descricao: input.descricao,
          valor: input.valor,
          data_competencia: input.data_competencia,
          data_vencimento: input.data_vencimento ?? null,
          data_pagamento:
            input.status === "pago"
              ? input.data_pagamento ?? hojeISO()
              : null,
          status: input.status,
          forma_pagamento: input.forma_pagamento ?? null,
          categoria_id: input.categoria_id ?? null,
          conta_id: input.conta_id ?? null,
          observacoes: input.observacoes ?? null,
          origem: input.origem ?? null,
        })
        .select("id")
        .single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["financeiro"] });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard() });
    },
  });
}

export function useAtualizarLancamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string } & Partial<LancamentoInput>) => {
      const supabase = createClient();
      const { id, ...patch } = input;
      const { error } = await supabase
        .from("lancamentos_financeiros")
        .update(patch)
        .eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["financeiro"] });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard() });
    },
  });
}

export function useExcluirLancamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("lancamentos_financeiros")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["financeiro"] });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard() });
    },
  });
}

export function useMarcarPago() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("lancamentos_financeiros")
        .update({ status: "pago", data_pagamento: hojeISO() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["financeiro"] });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard() });
    },
  });
}

// ============================================================
// Resumo / KPIs / gráficos
// ============================================================

export interface ResumoFinanceiro {
  total_receitas: number;
  total_despesas: number;
  resultado: number;
  qtd_lancamentos: number;
  receitas_previstas: number;
  despesas_previstas: number;
}

export function useResumoFinanceiro(inicio: string, fim: string) {
  return useQuery({
    queryKey: ["financeiro", "resumo", inicio, fim],
    queryFn: async (): Promise<ResumoFinanceiro> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("lancamentos_financeiros")
        .select("tipo, valor, status")
        .gte("data_competencia", inicio)
        .lte("data_competencia", fim);
      if (error) throw error;
      const base: ResumoFinanceiro = {
        total_receitas: 0,
        total_despesas: 0,
        resultado: 0,
        qtd_lancamentos: 0,
        receitas_previstas: 0,
        despesas_previstas: 0,
      };
      for (const r of (data ?? []) as {
        tipo: TipoFin;
        valor: number;
        status: FinanceiroStatus;
      }[]) {
        if (r.status === "cancelado") continue;
        base.qtd_lancamentos += 1;
        const v = Number(r.valor);
        if (r.status === "pago") {
          if (r.tipo === "entrada") base.total_receitas += v;
          else base.total_despesas += v;
        } else {
          if (r.tipo === "entrada") base.receitas_previstas += v;
          else base.despesas_previstas += v;
        }
      }
      base.resultado = base.total_receitas - base.total_despesas;
      return base;
    },
  });
}

export interface FluxoMes {
  mesNum: number;
  receitas: number;
  despesas: number;
  resultado: number;
}

export function useFluxoCaixaAnual(ano: number) {
  return useQuery({
    queryKey: ["financeiro", "fluxo", ano],
    queryFn: async (): Promise<FluxoMes[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("lancamentos_financeiros")
        .select("tipo, valor, data_pagamento")
        .eq("status", "pago")
        .not("data_pagamento", "is", null)
        .gte("data_pagamento", `${ano}-01-01`)
        .lte("data_pagamento", `${ano}-12-31`);
      if (error) throw error;
      const meses: FluxoMes[] = Array.from({ length: 12 }, (_, i) => ({
        mesNum: i + 1,
        receitas: 0,
        despesas: 0,
        resultado: 0,
      }));
      for (const r of (data ?? []) as {
        tipo: TipoFin;
        valor: number;
        data_pagamento: string;
      }[]) {
        const m = Number(r.data_pagamento.slice(5, 7)) - 1;
        if (m < 0 || m > 11) continue;
        if (r.tipo === "entrada") meses[m].receitas += Number(r.valor);
        else meses[m].despesas += Number(r.valor);
      }
      for (const m of meses) m.resultado = m.receitas - m.despesas;
      return meses;
    },
  });
}

export function useVencimentosAbertos(limit = 6) {
  return useQuery({
    queryKey: ["financeiro", "vencimentos", limit],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("lancamentos_financeiros")
        .select(LANC_SELECT)
        .in("status", ["pendente", "atrasado"])
        .order("data_vencimento", { ascending: true, nullsFirst: false })
        .order("data_competencia", { ascending: true })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as unknown as LancamentoRow[];
    },
  });
}

// ============================================================
// DRE
// ============================================================

export interface LinhaDRE {
  categoria_id: string | null;
  categoria_nome: string;
  cor: string;
  total: number;
  qtd: number;
}

export interface DRE {
  receitas: LinhaDRE[];
  despesas: LinhaDRE[];
  total_receitas: number;
  total_despesas: number;
  resultado: number;
}

export function useDRE(inicio: string, fim: string) {
  return useQuery({
    queryKey: ["financeiro", "dre", inicio, fim],
    queryFn: async (): Promise<DRE> => {
      const supabase = createClient();
      const [{ data: lancs, error }, { data: cats }] = await Promise.all([
        supabase
          .from("lancamentos_financeiros")
          .select("tipo, valor, categoria_id")
          .eq("status", "pago")
          .gte("data_competencia", inicio)
          .lte("data_competencia", fim),
        supabase
          .from("categorias_financeiras")
          .select("id, nome, cor"),
      ]);
      if (error) throw error;
      const catById = new Map(
        ((cats ?? []) as { id: string; nome: string; cor: string | null }[]).map(
          (c) => [c.id, c],
        ),
      );
      type Acc = { total: number; qtd: number };
      const receitaAcc = new Map<string | null, Acc>();
      const despesaAcc = new Map<string | null, Acc>();
      for (const l of (lancs ?? []) as {
        tipo: TipoFin;
        valor: number;
        categoria_id: string | null;
      }[]) {
        const acc = l.tipo === "entrada" ? receitaAcc : despesaAcc;
        const e = acc.get(l.categoria_id) ?? { total: 0, qtd: 0 };
        e.total += Number(l.valor);
        e.qtd += 1;
        acc.set(l.categoria_id, e);
      }
      const build = (acc: Map<string | null, Acc>): LinhaDRE[] =>
        [...acc.entries()]
          .map(([catId, { total, qtd }]) => {
            const cat = catId ? catById.get(catId) : null;
            return {
              categoria_id: catId,
              categoria_nome: cat?.nome ?? "Sem categoria",
              cor: cat?.cor ?? "#8a93a3",
              total,
              qtd,
            };
          })
          .sort((a, b) => b.total - a.total);
      const receitas = build(receitaAcc);
      const despesas = build(despesaAcc);
      const total_receitas = receitas.reduce((s, l) => s + l.total, 0);
      const total_despesas = despesas.reduce((s, l) => s + l.total, 0);
      return {
        receitas,
        despesas,
        total_receitas,
        total_despesas,
        resultado: total_receitas - total_despesas,
      };
    },
  });
}

// ============================================================
// Categorias
// ============================================================

export interface CategoriaRow {
  id: string;
  nome: string;
  tipo: TipoFin;
  cor: string | null;
  ativa: boolean;
  ordem: number;
}

export function useCategoriasFinanceiras(tipo?: TipoFin) {
  return useQuery({
    queryKey: ["financeiro", "categorias", tipo ?? "todas"],
    queryFn: async () => {
      const supabase = createClient();
      let q = supabase
        .from("categorias_financeiras")
        .select("id, nome, tipo, cor, ativa, ordem")
        .order("ordem", { ascending: true })
        .order("nome", { ascending: true });
      if (tipo) q = q.eq("tipo", tipo);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as CategoriaRow[];
    },
  });
}

export function useSalvarCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id?: string;
      nome: string;
      tipo: TipoFin;
      cor?: string | null;
      ativa?: boolean;
      ordem?: number;
    }) => {
      const supabase = createClient();
      const perfil = await getPerfilAutenticado(supabase);
      const nome = input.nome.trim();
      if (nome.length < 2) throw new Error("Nome muito curto.");
      if (input.id) {
        const { error } = await supabase
          .from("categorias_financeiras")
          .update({
            nome,
            tipo: input.tipo,
            cor: input.cor ?? null,
            ativa: input.ativa ?? true,
            ordem: input.ordem ?? 0,
          })
          .eq("id", input.id);
        if (error) throw error;
        return input.id;
      }
      const { data, error } = await supabase
        .from("categorias_financeiras")
        .insert({
          empresa_id: perfil.empresa_id,
          nome,
          tipo: input.tipo,
          cor: input.cor ?? null,
          ativa: input.ativa ?? true,
          ordem: input.ordem ?? 0,
        })
        .select("id")
        .single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["financeiro"] }),
  });
}

export function useExcluirCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("categorias_financeiras")
        .delete()
        .eq("id", id);
      if (error)
        throw new Error(
          "Não foi possível excluir. A categoria pode estar em uso.",
        );
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["financeiro"] }),
  });
}

/** Mantido para o CategoriaCombobox: acha existente (case-insensitive) ou cria. */
export function useCriarCategoriaFinanceira() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nome: string;
      tipo: TipoFin;
      cor?: string | null;
    }): Promise<{ id: string; nome: string; tipo: TipoFin }> => {
      const supabase = createClient();
      const perfil = await getPerfilAutenticado(supabase);
      const nome = input.nome.trim();
      if (nome.length < 2) throw new Error("Nome muito curto.");
      const { data: existente } = await supabase
        .from("categorias_financeiras")
        .select("id, nome, tipo")
        .eq("empresa_id", perfil.empresa_id)
        .eq("tipo", input.tipo)
        .ilike("nome", nome)
        .maybeSingle();
      if (existente)
        return existente as { id: string; nome: string; tipo: TipoFin };
      const { data, error } = await supabase
        .from("categorias_financeiras")
        .insert({
          empresa_id: perfil.empresa_id,
          nome,
          tipo: input.tipo,
          cor: input.cor ?? null,
          ativa: true,
        })
        .select("id, nome, tipo")
        .single();
      if (error) throw error;
      return data as { id: string; nome: string; tipo: TipoFin };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["financeiro"] }),
  });
}

// ============================================================
// Contas
// ============================================================

export interface ContaRow {
  id: string;
  nome: string;
  tipo: "banco" | "caixa" | "cartao_credito" | "investimento";
  saldo_inicial: number;
  data_saldo_inicial: string;
  ativa: boolean;
  ordem: number;
}

export function useContas() {
  return useQuery({
    queryKey: ["financeiro", "contas"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("contas_financeiras")
        .select("id, nome, tipo, saldo_inicial, data_saldo_inicial, ativa, ordem")
        .order("ordem", { ascending: true })
        .order("nome", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ContaRow[];
    },
  });
}

export interface SaldoConta {
  conta: ContaRow;
  saldo_atual: number;
}

export function useSaldoPorConta() {
  return useQuery({
    queryKey: ["financeiro", "saldos"],
    queryFn: async (): Promise<SaldoConta[]> => {
      const supabase = createClient();
      const [{ data: contas }, { data: lancs }] = await Promise.all([
        supabase
          .from("contas_financeiras")
          .select("id, nome, tipo, saldo_inicial, data_saldo_inicial, ativa, ordem")
          .order("ordem")
          .order("nome"),
        supabase
          .from("lancamentos_financeiros")
          .select("conta_id, tipo, valor")
          .eq("status", "pago")
          .not("data_pagamento", "is", null)
          .not("conta_id", "is", null),
      ]);
      const mov = new Map<string, number>();
      for (const r of (lancs ?? []) as {
        conta_id: string;
        tipo: TipoFin;
        valor: number;
      }[]) {
        const delta = r.tipo === "entrada" ? Number(r.valor) : -Number(r.valor);
        mov.set(r.conta_id, (mov.get(r.conta_id) ?? 0) + delta);
      }
      return ((contas ?? []) as ContaRow[]).map((conta) => ({
        conta,
        saldo_atual: Number(conta.saldo_inicial) + (mov.get(conta.id) ?? 0),
      }));
    },
  });
}

export function useSalvarConta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id?: string;
      nome: string;
      tipo: ContaRow["tipo"];
      saldo_inicial: number;
      data_saldo_inicial: string;
      ativa?: boolean;
      ordem?: number;
    }) => {
      const supabase = createClient();
      const perfil = await getPerfilAutenticado(supabase);
      const nome = input.nome.trim();
      if (nome.length < 2) throw new Error("Nome muito curto.");
      const payload = {
        nome,
        tipo: input.tipo,
        saldo_inicial: input.saldo_inicial,
        data_saldo_inicial: input.data_saldo_inicial,
        ativa: input.ativa ?? true,
        ordem: input.ordem ?? 0,
      };
      if (input.id) {
        const { error } = await supabase
          .from("contas_financeiras")
          .update(payload)
          .eq("id", input.id);
        if (error) throw error;
        return input.id;
      }
      const { data, error } = await supabase
        .from("contas_financeiras")
        .insert({ empresa_id: perfil.empresa_id, ...payload })
        .select("id")
        .single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["financeiro"] }),
  });
}

export function useExcluirConta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("contas_financeiras")
        .delete()
        .eq("id", id);
      if (error)
        throw new Error("Não foi possível excluir. A conta pode estar em uso.");
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["financeiro"] }),
  });
}

// ============================================================
// Recorrentes
// ============================================================

export interface RecorrenteRow {
  id: string;
  nome: string;
  tipo: TipoFin;
  valor: number;
  categoria_id: string | null;
  conta_id: string | null;
  periodicidade: "mensal" | "anual" | "semanal";
  dia_vencimento: number | null;
  inicio: string;
  fim: string | null;
  ativo: boolean;
  ultimo_lancamento_gerado: string | null;
  observacoes: string | null;
}

export function useRecorrentes() {
  return useQuery({
    queryKey: ["financeiro", "recorrentes"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("recorrentes_financeiros")
        .select(
          "id, nome, tipo, valor, categoria_id, conta_id, periodicidade, dia_vencimento, inicio, fim, ativo, ultimo_lancamento_gerado, observacoes",
        )
        .order("nome", { ascending: true });
      if (error) throw error;
      return (data ?? []) as RecorrenteRow[];
    },
  });
}

export function useSalvarRecorrente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id?: string;
      nome: string;
      tipo: TipoFin;
      valor: number;
      categoria_id?: string | null;
      conta_id?: string | null;
      periodicidade?: RecorrenteRow["periodicidade"];
      dia_vencimento?: number | null;
      inicio: string;
      fim?: string | null;
      ativo?: boolean;
      observacoes?: string | null;
    }) => {
      const supabase = createClient();
      const perfil = await getPerfilAutenticado(supabase);
      const nome = input.nome.trim();
      if (nome.length < 2) throw new Error("Nome muito curto.");
      const payload = {
        nome,
        tipo: input.tipo,
        valor: input.valor,
        categoria_id: input.categoria_id ?? null,
        conta_id: input.conta_id ?? null,
        periodicidade: input.periodicidade ?? "mensal",
        dia_vencimento: input.dia_vencimento ?? null,
        inicio: input.inicio,
        fim: input.fim ?? null,
        ativo: input.ativo ?? true,
        observacoes: input.observacoes ?? null,
      };
      if (input.id) {
        const { error } = await supabase
          .from("recorrentes_financeiros")
          .update(payload)
          .eq("id", input.id);
        if (error) throw error;
        return input.id;
      }
      const { data, error } = await supabase
        .from("recorrentes_financeiros")
        .insert({ empresa_id: perfil.empresa_id, ...payload })
        .select("id")
        .single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["financeiro"] }),
  });
}

export function useExcluirRecorrente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("recorrentes_financeiros")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["financeiro"] }),
  });
}

/**
 * Materializa os recorrentes mensais ativos no mês/ano informado.
 * Idempotente: pula recorrente que já tem lançamento naquele mês.
 * Lançamentos nascem como "pendente" (previsto). Retorna a contagem criada.
 */
export function useGerarRecorrentes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ mes, ano }: { mes: number; ano: number }) => {
      const supabase = createClient();
      const perfil = await getPerfilAutenticado(supabase);
      const pad = (n: number) => String(n).padStart(2, "0");
      const inicioMes = `${ano}-${pad(mes)}-01`;
      const ultimoDia = new Date(ano, mes, 0).getDate();
      const fimMes = `${ano}-${pad(mes)}-${pad(ultimoDia)}`;

      const { data: recs, error: recErr } = await supabase
        .from("recorrentes_financeiros")
        .select(
          "id, nome, tipo, valor, categoria_id, conta_id, periodicidade, dia_vencimento, inicio, fim, ativo",
        )
        .eq("ativo", true)
        .eq("periodicidade", "mensal")
        .lte("inicio", fimMes);
      if (recErr) throw recErr;

      const { data: existentes } = await supabase
        .from("lancamentos_financeiros")
        .select("recorrente_id")
        .not("recorrente_id", "is", null)
        .gte("data_competencia", inicioMes)
        .lte("data_competencia", fimMes);
      const jaTem = new Set(
        ((existentes ?? []) as { recorrente_id: string }[]).map(
          (r) => r.recorrente_id,
        ),
      );

      let gerados = 0;
      for (const r of (recs ?? []) as RecorrenteRow[]) {
        if (r.fim && r.fim < inicioMes) continue;
        if (jaTem.has(r.id)) continue;
        const dia = Math.min(r.dia_vencimento ?? 1, ultimoDia);
        const data = `${ano}-${pad(mes)}-${pad(dia)}`;
        const { error } = await supabase.from("lancamentos_financeiros").insert({
          empresa_id: perfil.empresa_id,
          responsavel_id: perfil.id,
          tipo: r.tipo,
          descricao: r.nome,
          valor: r.valor,
          data_competencia: data,
          data_vencimento: data,
          status: "pendente",
          categoria_id: r.categoria_id,
          conta_id: r.conta_id,
          recorrente_id: r.id,
          origem: "Recorrente",
        });
        if (!error) {
          gerados += 1;
          await supabase
            .from("recorrentes_financeiros")
            .update({ ultimo_lancamento_gerado: inicioMes })
            .eq("id", r.id);
        }
      }
      return gerados;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["financeiro"] });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard() });
    },
  });
}
