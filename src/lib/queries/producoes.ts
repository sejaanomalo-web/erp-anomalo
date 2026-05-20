"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "./keys";
import type { ProducaoStatus } from "@/types/database.types";

export interface ProducaoCard {
  id: string;
  status: ProducaoStatus;
  prioridade: number;
  data_fim_prevista: string | null;
  observacoes: string | null;
  venda: {
    numero: number;
    cliente: { nome: string } | null;
  } | null;
  responsavel: { nome: string } | null;
  variante: {
    nome: string;
    produto: { nome: string } | null;
  } | null;
}

export function useProducoes() {
  return useQuery({
    queryKey: queryKeys.producoesList(),
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("producoes")
        .select(
          "id, status, prioridade, data_fim_prevista, observacoes, venda:vendas(numero, cliente:clientes(nome)), responsavel:profiles!responsavel_id(nome), venda_item:venda_itens(produto_variante:produto_variantes(nome, produto:produtos(nome)))",
        )
        .order("prioridade", { ascending: false })
        .order("data_fim_prevista", { ascending: true })
        .limit(200);
      if (error) throw error;

      return (data ?? []).map((p) => {
        const r = p as unknown as {
          id: string;
          status: ProducaoStatus;
          prioridade: number;
          data_fim_prevista: string | null;
          observacoes: string | null;
          venda: { numero: number; cliente: { nome: string } | null } | null;
          responsavel: { nome: string } | null;
          venda_item: {
            produto_variante: {
              nome: string;
              produto: { nome: string } | null;
            } | null;
          } | null;
        };
        return {
          id: r.id,
          status: r.status,
          prioridade: r.prioridade,
          data_fim_prevista: r.data_fim_prevista,
          observacoes: r.observacoes,
          venda: r.venda,
          responsavel: r.responsavel,
          variante: r.venda_item?.produto_variante ?? null,
        } as ProducaoCard;
      });
    },
  });
}

export function useMoverProducao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; status: ProducaoStatus }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("producoes")
        .update({ status: input.status })
        .eq("id", input.id);
      if (error) throw error;

      // Audit log via API server-side
      fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modulo: "producao",
          acao: "update_status",
          entidade: "producoes",
          entidadeId: input.id,
          dadosDepois: { status: input.status },
        }),
      }).catch(() => null);

      return input;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.producoes() });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard() });
    },
  });
}
