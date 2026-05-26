"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "./keys";
import type { VendaStatus, VendaTipo } from "@/types/database.types";

export interface VendaListRow {
  id: string;
  numero: number;
  cliente_id: string;
  vendedor_id: string;
  tipo: VendaTipo;
  valor_total: number;
  status: VendaStatus;
  data_venda: string;
  data_prevista_entrega: string;
  cliente: { nome: string; telefone: string | null } | null;
  vendedor: { nome: string } | null;
}

interface VendasFilters {
  tipo?: VendaTipo | "todos";
  status?: VendaStatus | "todos";
  busca?: string;
  vendedorId?: string;
}

export function useVendas(filters: VendasFilters = {}) {
  return useQuery({
    queryKey: queryKeys.vendasList(filters as Record<string, unknown>),
    queryFn: async () => {
      const supabase = createClient();
      let query = supabase
        .from("vendas")
        .select(
          "id, numero, cliente_id, vendedor_id, tipo, valor_total, status, data_venda, data_prevista_entrega, cliente:clientes(nome, telefone), vendedor:profiles!vendedor_id(nome)",
        )
        .order("data_venda", { ascending: false })
        .limit(500);

      if (filters.status && filters.status !== "todos") {
        query = query.eq("status", filters.status);
      }
      if (filters.tipo && filters.tipo !== "todos") {
        query = query.eq("tipo", filters.tipo);
      }
      if (filters.vendedorId) {
        query = query.eq("vendedor_id", filters.vendedorId);
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

export interface VendaItemDetail {
  id: string;
  produto_descricao: string | null;
  quantidade: number;
  valor_unitario: number;
  observacoes: string | null;
  foto_modelo_url: string | null;
  foto_tecido_url: string | null;
}

export interface VendaDetail extends VendaListRow {
  desconto: number;
  taxa: number;
  forma_pagamento: string | null;
  parcelas: number;
  comissao_percentual: number | null;
  comissao_valor: number | null;
  data_prevista_producao: string | null;
  endereco_entrega: Record<string, unknown> | null;
  observacoes: string | null;
  created_at: string;
  itens: VendaItemDetail[];
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
          "*, cliente:clientes(nome, cpf_cnpj, email, telefone), vendedor:profiles!vendedor_id(nome, email), itens:venda_itens(id, produto_descricao, quantidade, valor_unitario, observacoes, foto_modelo_url, foto_tecido_url)",
        )
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as unknown as VendaDetail;
    },
  });
}

export interface CriarVendaInput {
  cliente_id?: string | null;
  cliente_inline?: {
    nome: string;
    telefone: string;
    cpf_cnpj?: string | null;
    endereco?: string | null;
  } | null;
  vendedor_id?: string | null;
  tipo: VendaTipo;
  valor_total: number;
  desconto: number;
  taxa: number;
  forma_pagamento: string | null;
  parcelas: number;
  data_venda: string;
  data_prevista_entrega: string;
  data_prevista_producao?: string | null;
  observacoes?: string | null;
  itens: {
    produto_descricao: string;
    quantidade: number;
    valor_unitario: number;
    observacoes?: string | null;
    foto_modelo_url?: string | null;
    foto_tecido_url?: string | null;
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
      return (await res.json()) as {
        id: string;
        numero: number;
        tipo: VendaTipo;
        cliente_id: string;
      };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.vendas() });
      qc.invalidateQueries({ queryKey: queryKeys.producoes() });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard() });
      qc.invalidateQueries({ queryKey: queryKeys.clientes() });
    },
  });
}

export interface AtualizarVendaInput {
  vendedor_id?: string;
  tipo?: VendaTipo;
  desconto?: number;
  taxa?: number;
  forma_pagamento?: string | null;
  parcelas?: number;
  data_venda?: string;
  data_prevista_entrega?: string;
  data_prevista_producao?: string | null;
  observacoes?: string | null;
  itens?: {
    id?: string;
    produto_descricao: string;
    quantidade: number;
    valor_unitario: number;
    observacoes?: string | null;
    foto_modelo_url?: string | null;
    foto_tecido_url?: string | null;
  }[];
}

export function useAtualizarVenda(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: AtualizarVendaInput) => {
      const res = await fetch(`/api/vendas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? "Falha ao atualizar venda.");
      }
      return (await res.json()) as { ok: true; id: string };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.venda(id) });
      qc.invalidateQueries({ queryKey: queryKeys.vendas() });
      qc.invalidateQueries({ queryKey: queryKeys.producoes() });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard() });
    },
  });
}

export function useExcluirVenda() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/vendas/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? "Falha ao excluir venda.");
      }
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.vendas() });
      qc.invalidateQueries({ queryKey: queryKeys.producoes() });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard() });
    },
  });
}

export function useConverterOrcamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/vendas/${id}/converter`, {
        method: "POST",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? "Falha ao converter orçamento.");
      }
      return id;
    },
    onSuccess: (id) => {
      qc.invalidateQueries({ queryKey: queryKeys.vendas() });
      qc.invalidateQueries({ queryKey: queryKeys.venda(id) });
      qc.invalidateQueries({ queryKey: queryKeys.producoes() });
    },
  });
}

export function useMoverKanbanVenda() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      tipo: VendaTipo;
      status: VendaStatus;
    }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("vendas")
        .update({ tipo: input.tipo, status: input.status })
        .eq("id", input.id);
      if (error) throw error;

      fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modulo: "vendas",
          acao: "kanban_move",
          entidade: "vendas",
          entidadeId: input.id,
          dadosDepois: { tipo: input.tipo, status: input.status },
        }),
      }).catch(() => null);

      return input;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.vendas() });
    },
  });
}
