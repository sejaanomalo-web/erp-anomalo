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

export function useClientes() {
  return useQuery({
    queryKey: queryKeys.clientesList(),
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("clientes")
        .select("id, nome, cpf_cnpj, email, telefone, origem, created_at")
        .order("nome", { ascending: true })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as ClienteRow[];
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

export interface CriarClienteInput {
  nome: string;
  cpf_cnpj?: string | null;
  email?: string | null;
  telefone?: string | null;
  origem?: string | null;
  observacoes?: string | null;
}

export function useCriarCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CriarClienteInput) => {
      const supabase = createClient();
      const { data: profile } = await supabase
        .from("profiles")
        .select("empresa_id")
        .maybeSingle();
      if (!profile?.empresa_id) {
        throw new Error("Perfil sem empresa vinculada.");
      }
      const { data, error } = await supabase
        .from("clientes")
        .insert({
          ...input,
          empresa_id: profile.empresa_id,
        })
        .select("id, nome")
        .single();
      if (error) throw error;
      return data as { id: string; nome: string };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.clientes() });
    },
  });
}
