"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "./keys";

export interface VarianteRow {
  id: string;
  produto_id: string;
  nome: string;
  sku: string | null;
  preco_venda: number | null;
  estoque_atual: number;
  estoque_minimo: number;
  ativo: boolean;
  produto: { nome: string } | null;
}

export function useProdutoVariantes() {
  return useQuery({
    queryKey: queryKeys.produtoVariantes(),
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("produto_variantes")
        .select(
          "id, produto_id, nome, sku, preco_venda, estoque_atual, estoque_minimo, ativo, produto:produtos(nome)",
        )
        .eq("ativo", true)
        .order("nome", { ascending: true })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as unknown as VarianteRow[];
    },
  });
}

export interface ProdutoComEstoque {
  id: string;
  nome: string;
  categoria: string | null;
  imagem_principal_url: string | null;
  variantes_count: number;
  estoque_total: number;
  estoque_minimo_total: number;
}

export function useProdutosComEstoque() {
  return useQuery({
    queryKey: queryKeys.estoqueList(),
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("produtos")
        .select(
          "id, nome, categoria, imagem_principal_url, produto_variantes(id, estoque_atual, estoque_minimo)",
        )
        .order("nome", { ascending: true });
      if (error) throw error;

      return (data ?? []).map((p) => {
        const variantes = (p as unknown as {
          produto_variantes: { estoque_atual: number; estoque_minimo: number }[];
        }).produto_variantes ?? [];
        return {
          id: p.id,
          nome: p.nome,
          categoria: p.categoria,
          imagem_principal_url: p.imagem_principal_url,
          variantes_count: variantes.length,
          estoque_total: variantes.reduce((acc, v) => acc + (v.estoque_atual ?? 0), 0),
          estoque_minimo_total: variantes.reduce(
            (acc, v) => acc + (v.estoque_minimo ?? 0),
            0,
          ),
        } as ProdutoComEstoque;
      });
    },
  });
}
