"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "./keys";

export interface MaterialRow {
  id: string;
  nome: string;
  unidade: string;
  categoria: string | null;
  estoque_minimo: number;
  estoque_atual: number;
  custo_medio: number | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export function useMateriais() {
  return useQuery({
    queryKey: queryKeys.materiaisList(),
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("materiais")
        .select("*")
        .order("nome", { ascending: true });
      if (error) throw error;
      return (data ?? []) as MaterialRow[];
    },
  });
}

export interface MaterialInput {
  id?: string;
  nome: string;
  unidade: string;
  categoria?: string | null;
  estoque_minimo: number;
  estoque_atual: number;
  custo_medio?: number | null;
}

export function useSalvarMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: MaterialInput) => {
      const supabase = createClient();
      const { data: profile } = await supabase
        .from("profiles")
        .select("empresa_id")
        .maybeSingle();
      if (!profile?.empresa_id) {
        throw new Error("Perfil sem empresa vinculada.");
      }

      const payload = {
        empresa_id: profile.empresa_id,
        nome: input.nome.trim(),
        unidade: input.unidade.trim(),
        categoria: input.categoria?.trim() || null,
        estoque_minimo: input.estoque_minimo,
        estoque_atual: input.estoque_atual,
        custo_medio: input.custo_medio ?? null,
      };

      if (input.id) {
        const { data, error } = await supabase
          .from("materiais")
          .update(payload)
          .eq("id", input.id)
          .select("id")
          .single();
        if (error) throw error;
        return { id: data.id as string, criado: false };
      }

      const { data, error } = await supabase
        .from("materiais")
        .insert(payload)
        .select("id")
        .single();
      if (error) throw error;
      return { id: data.id as string, criado: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.materiais() });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard() });
    },
  });
}

export function useMovimentarMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      material_id: string;
      tipo: "entrada" | "saida" | "ajuste";
      origem: "compra" | "producao" | "ajuste_manual" | "perda";
      quantidade: number;
      valor_unitario?: number | null;
      observacoes?: string | null;
    }) => {
      const supabase = createClient();
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, empresa_id")
        .maybeSingle();
      if (!profile?.empresa_id) {
        throw new Error("Perfil sem empresa.");
      }

      const { error } = await supabase.from("estoque_movimentacoes").insert({
        empresa_id: profile.empresa_id,
        tipo: input.tipo,
        origem: input.origem,
        material_id: input.material_id,
        quantidade: input.quantidade,
        valor_unitario: input.valor_unitario ?? null,
        responsavel_id: profile.id,
        observacoes: input.observacoes ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.materiais() });
      qc.invalidateQueries({ queryKey: queryKeys.estoque() });
    },
  });
}
