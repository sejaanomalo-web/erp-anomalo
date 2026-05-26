"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "./keys";
import { getPerfilAutenticado } from "@/lib/auth/perfil";
import type { FinanceiroStatus } from "@/types/database.types";

export interface LancamentoRow {
  id: string;
  tipo: "entrada" | "saida";
  descricao: string;
  valor: number;
  data_competencia: string;
  data_vencimento: string | null;
  data_pagamento: string | null;
  status: FinanceiroStatus;
  forma_pagamento: string | null;
  categoria_id: string | null;
  categoria: { nome: string } | null;
  venda_id: string | null;
  observacoes: string | null;
  created_at: string;
}

export interface LancamentosFiltros {
  tipo?: "entrada" | "saida";
  inicio: string;
  fim: string;
  status?: FinanceiroStatus | "todos";
  formaPagamento?: string | "todas";
  categoriaId?: string;
}

export function useLancamentos(filtros: LancamentosFiltros) {
  return useQuery({
    queryKey: ["financeiro", "lancamentos", filtros],
    queryFn: async () => {
      const supabase = createClient();
      let q = supabase
        .from("lancamentos_financeiros")
        .select(
          "id, tipo, descricao, valor, data_competencia, data_vencimento, data_pagamento, status, forma_pagamento, categoria_id, categoria:categorias_financeiras(nome), venda_id, observacoes, created_at",
        )
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

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as LancamentoRow[];
    },
  });
}

export function useCategoriasFinanceiras(tipo?: "entrada" | "saida") {
  return useQuery({
    queryKey: ["categorias-financeiras", tipo ?? "todas"],
    queryFn: async () => {
      const supabase = createClient();
      let q = supabase
        .from("categorias_financeiras")
        .select("id, nome, tipo, cor, ativa")
        .eq("ativa", true)
        .order("nome", { ascending: true });
      if (tipo) q = q.eq("tipo", tipo);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as {
        id: string;
        nome: string;
        tipo: "entrada" | "saida";
        cor: string | null;
        ativa: boolean;
      }[];
    },
  });
}

export interface LancamentoInput {
  tipo: "entrada" | "saida";
  descricao: string;
  valor: number;
  data_competencia: string;
  data_vencimento?: string | null;
  status: FinanceiroStatus;
  forma_pagamento?: string | null;
  categoria_id?: string | null;
  observacoes?: string | null;
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
          ...input,
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

export function useMarcarPago() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("lancamentos_financeiros")
        .update({
          status: "pago",
          data_pagamento: new Date().toISOString().slice(0, 10),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["financeiro"] });
    },
  });
}
