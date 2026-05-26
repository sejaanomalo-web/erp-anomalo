"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "./keys";

export interface ClienteRow {
  id: string;
  nome: string;
  cpf_cnpj: string | null;
  email: string | null;
  telefone: string | null;
  origem: string | null;
  created_at: string;
}

export interface ClientesFilters {
  inicio?: string;
  fim?: string;
  busca?: string;
}

export function useClientes(filters: ClientesFilters = {}) {
  return useQuery({
    queryKey: queryKeys.clientesList(filters as Record<string, unknown>),
    queryFn: async () => {
      const supabase = createClient();
      let query = supabase
        .from("clientes")
        .select("id, nome, cpf_cnpj, email, telefone, origem, created_at")
        .order("created_at", { ascending: false })
        .limit(1000);

      if (filters.inicio) query = query.gte("created_at", filters.inicio);
      if (filters.fim) query = query.lte("created_at", `${filters.fim}T23:59:59`);

      const { data, error } = await query;
      if (error) throw error;
      let rows = (data ?? []) as ClienteRow[];

      if (filters.busca?.trim()) {
        const q = filters.busca.trim().toLowerCase();
        const qDigits = q.replace(/\D/g, "");
        rows = rows.filter((c) => {
          const nome = c.nome?.toLowerCase() ?? "";
          const cpfDigits = (c.cpf_cnpj ?? "").replace(/\D/g, "");
          const telDigits = (c.telefone ?? "").replace(/\D/g, "");
          return (
            nome.includes(q) ||
            (qDigits.length >= 3 &&
              (cpfDigits.includes(qDigits) || telDigits.includes(qDigits)))
          );
        });
      }

      return rows;
    },
  });
}

export function useCliente(id: string) {
  return useQuery({
    queryKey: queryKeys.cliente(id),
    enabled: Boolean(id),
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as ClienteRow;
    },
  });
}

export interface ClienteInput {
  nome: string;
  telefone?: string | null;
  email?: string | null;
  cpf_cnpj?: string | null;
  origem?: string | null;
  observacoes?: string | null;
}

export function useAtualizarCliente(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ClienteInput) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("clientes")
        .update({
          nome: input.nome.trim(),
          telefone: input.telefone?.trim() || null,
          email: input.email?.trim() || null,
          cpf_cnpj: input.cpf_cnpj?.trim() || null,
          origem: input.origem?.trim() || null,
          observacoes: input.observacoes?.trim() || null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cliente(id) });
      qc.invalidateQueries({ queryKey: queryKeys.clientes() });
    },
  });
}

export function useExcluirCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("clientes").delete().eq("id", id);
      if (error) {
        if (error.code === "23503") {
          throw new Error(
            "Este cliente tem vendas vinculadas. Exclua as vendas primeiro ou mantenha o cliente para preservar o histórico.",
          );
        }
        throw error;
      }
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.clientes() });
    },
  });
}
