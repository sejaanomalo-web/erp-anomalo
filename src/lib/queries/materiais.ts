"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "./keys";
import { getPerfilAutenticado } from "@/lib/auth/perfil";

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
      const perfil = await getPerfilAutenticado(supabase);

      const payload = {
        empresa_id: perfil.empresa_id,
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

export interface MovimentacaoRow {
  id: string;
  created_at: string;
  tipo: "entrada" | "saida" | "ajuste";
  origem: string;
  quantidade: number;
  valor_unitario: number | null;
  observacoes: string | null;
  material_id: string | null;
  material: { nome: string; unidade: string } | null;
  responsavel: { nome: string } | null;
}

export interface MovimentacaoFiltros {
  inicio?: string;
  fim?: string;
  tipo?: "entrada" | "saida" | "ajuste" | "todos";
  materialId?: string | "todos";
  busca?: string;
}

export function useMovimentacoesMaterial(filtros: MovimentacaoFiltros = {}) {
  return useQuery({
    queryKey: [
      "estoque",
      "movimentacoes",
      "materiais",
      filtros as Record<string, unknown>,
    ],
    queryFn: async (): Promise<MovimentacaoRow[]> => {
      const supabase = createClient();
      let q = supabase
        .from("estoque_movimentacoes")
        .select(
          "id, created_at, tipo, origem, quantidade, valor_unitario, observacoes, material_id, material:materiais(nome, unidade), responsavel:profiles!responsavel_id(nome)",
        )
        .not("material_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(500);

      if (filtros.inicio) q = q.gte("created_at", `${filtros.inicio}T00:00:00`);
      if (filtros.fim) q = q.lte("created_at", `${filtros.fim}T23:59:59`);
      if (filtros.tipo && filtros.tipo !== "todos") q = q.eq("tipo", filtros.tipo);
      if (filtros.materialId && filtros.materialId !== "todos")
        q = q.eq("material_id", filtros.materialId);

      const { data, error } = await q;
      if (error) throw error;
      let rows = (data ?? []) as unknown as MovimentacaoRow[];

      if (filtros.busca?.trim()) {
        const qstr = filtros.busca.trim().toLowerCase();
        rows = rows.filter((r) => {
          const nome = r.material?.nome?.toLowerCase() ?? "";
          const observ = (r.observacoes ?? "").toLowerCase();
          return nome.includes(qstr) || observ.includes(qstr);
        });
      }

      return rows;
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
      const perfil = await getPerfilAutenticado(supabase);

      const { error } = await supabase.from("estoque_movimentacoes").insert({
        empresa_id: perfil.empresa_id,
        tipo: input.tipo,
        origem: input.origem,
        material_id: input.material_id,
        quantidade: input.quantidade,
        valor_unitario: input.valor_unitario ?? null,
        responsavel_id: perfil.id,
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
