"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "./keys";
import type { VendaStatus } from "@/types/database.types";

export interface VendaListRow {
  id: string;
  numero: number;
  cliente_id: string;
  vendedor_id: string;
  valor_total: number;
  status: VendaStatus;
  data_venda: string;
  data_prevista_entrega: string;
  cliente: { nome: string } | null;
  vendedor: { nome: string } | null;
}

interface VendasFilters {
  status?: VendaStatus | "todos";
  busca?: string;
}

export function useVendas(filters: VendasFilters = {}) {
  return useQuery({
    queryKey: queryKeys.vendasList(filters as Record<string, unknown>),
    queryFn: async () => {
      const supabase = createClient();
      let query = supabase
        .from("vendas")
        .select(
          "id, numero, cliente_id, vendedor_id, valor_total, status, data_venda, data_prevista_entrega, cliente:clientes(nome), vendedor:profiles!vendedor_id(nome)",
        )
        .order("data_venda", { ascending: false })
        .limit(200);

      if (filters.status && filters.status !== "todos") {
        query = query.eq("status", filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      let rows = (data ?? []) as unknown as VendaListRow[];

      if (filters.busca?.trim()) {
        const q = filters.busca.trim().toLowerCase();
        rows = rows.filter((r) => {
          const cliente = r.cliente?.nome?.toLowerCase() ?? "";
          const vendedor = r.vendedor?.nome?.toLowerCase() ?? "";
          return (
            cliente.includes(q) ||
            vendedor.includes(q) ||
            String(r.numero).includes(q)
          );
        });
      }

      return rows;
    },
  });
}

export interface VendaDetail extends VendaListRow {
  desconto: number;
  forma_pagamento: string | null;
  parcelas: number;
  comissao_percentual: number | null;
  comissao_valor: number | null;
  data_prevista_producao: string | null;
  endereco_entrega: Record<string, unknown> | null;
  observacoes: string | null;
  created_at: string;
}

export function useVenda(id: string) {
  return useQuery({
    queryKey: queryKeys.venda(id),
    enabled: Boolean(id),
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("vendas")
        .select(
          "*, cliente:clientes(nome, cpf_cnpj, email, telefone), vendedor:profiles!vendedor_id(nome, email)",
        )
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as unknown as VendaDetail;
    },
  });
}

export interface CriarVendaInput {
  cliente_id: string;
  valor_total: number;
  desconto: number;
  forma_pagamento: string | null;
  parcelas: number;
  data_venda: string;
  data_prevista_entrega: string;
  data_prevista_producao?: string | null;
  observacoes?: string | null;
  itens: {
    produto_variante_id: string;
    quantidade: number;
    valor_unitario: number;
    customizacoes?: string | null;
  }[];
}

export function useCriarVenda() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CriarVendaInput) => {
      const res = await fetch("/api/vendas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? "Falha ao registrar venda.");
      }
      return (await res.json()) as { id: string; numero: number };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.vendas() });
      qc.invalidateQueries({ queryKey: queryKeys.producoes() });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard() });
    },
  });
}
