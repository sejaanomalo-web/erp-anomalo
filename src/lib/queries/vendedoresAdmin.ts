"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "./keys";
import type { Papel } from "@/types/database.types";

export interface VendedorListRow {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  cargo: string | null;
  papel: Papel;
  ativo: boolean;
  avatar_url: string | null;
  created_at: string;
}

export function useVendedoresAdmin() {
  return useQuery({
    queryKey: queryKeys.vendedoresList(),
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, nome, email, telefone, cargo, papel, ativo, avatar_url, created_at",
        )
        .in("papel", ["vendedor", "gestor", "admin"])
        .order("nome", { ascending: true });
      if (error) throw error;
      return (data ?? []) as VendedorListRow[];
    },
  });
}

export interface VendedorAgregado {
  totalVendas: number;
  totalOrcamentos: number;
  valorFechado: number;
  ticketMedio: number;
}

interface ItemVendido {
  id: string;
  numero: number;
  data_venda: string;
  produto_descricao: string | null;
  quantidade: number;
  valor_unitario: number;
  tipo: "venda" | "orcamento";
}

export interface VendedorDetalhe {
  perfil: VendedorListRow;
  agregado: VendedorAgregado;
  itens: ItemVendido[];
}

export function useVendedor(id: string) {
  return useQuery({
    queryKey: ["vendedores", "detail", id],
    enabled: Boolean(id),
    queryFn: async (): Promise<VendedorDetalhe> => {
      const supabase = createClient();

      const { data: perfil, error: perfilErr } = await supabase
        .from("profiles")
        .select(
          "id, nome, email, telefone, cargo, papel, ativo, avatar_url, created_at",
        )
        .eq("id", id)
        .single();
      if (perfilErr) throw perfilErr;

      const { data: vendasRaw, error: vendasErr } = await supabase
        .from("vendas")
        .select(
          "id, numero, tipo, valor_total, data_venda, itens:venda_itens(id, produto_descricao, quantidade, valor_unitario)",
        )
        .eq("vendedor_id", id)
        .order("data_venda", { ascending: false })
        .limit(500);
      if (vendasErr) throw vendasErr;

      const vendas = (vendasRaw ?? []) as unknown as {
        id: string;
        numero: number;
        tipo: "venda" | "orcamento";
        valor_total: number;
        data_venda: string;
        itens: {
          id: string;
          produto_descricao: string | null;
          quantidade: number;
          valor_unitario: number;
        }[];
      }[];

      const fechadas = vendas.filter((v) => v.tipo === "venda");
      const valorFechado = fechadas.reduce(
        (acc, v) => acc + Number(v.valor_total ?? 0),
        0,
      );

      const itens: ItemVendido[] = vendas.flatMap((v) =>
        (v.itens ?? []).map((it) => ({
          id: it.id,
          numero: v.numero,
          data_venda: v.data_venda,
          produto_descricao: it.produto_descricao,
          quantidade: it.quantidade,
          valor_unitario: Number(it.valor_unitario),
          tipo: v.tipo,
        })),
      );

      return {
        perfil: perfil as VendedorListRow,
        agregado: {
          totalVendas: fechadas.length,
          totalOrcamentos: vendas.length - fechadas.length,
          valorFechado,
          ticketMedio: fechadas.length ? valorFechado / fechadas.length : 0,
        },
        itens,
      };
    },
  });
}

export function useConvidarVendedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nome: string;
      email: string;
      telefone?: string | null;
      papel: Papel;
    }) => {
      const res = await fetch("/api/vendedores/convite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? "Falha ao convidar vendedor.");
      }
      return (await res.json()) as {
        usuario_id: string;
        email: string;
        senha_temporaria: string;
        ja_existia: boolean;
      };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.vendedores() });
    },
  });
}

export function useAtualizarVendedorPerfil() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      nome?: string;
      telefone?: string | null;
      cargo?: string | null;
      papel?: Papel;
      ativo?: boolean;
    }) => {
      const supabase = createClient();
      const { id, ...patch } = input;
      const payload: Record<string, unknown> = {};
      if (patch.nome !== undefined) payload.nome = patch.nome.trim();
      if (patch.telefone !== undefined)
        payload.telefone = patch.telefone?.trim() || null;
      if (patch.cargo !== undefined)
        payload.cargo = patch.cargo?.trim() || null;
      if (patch.papel !== undefined) payload.papel = patch.papel;
      if (patch.ativo !== undefined) payload.ativo = patch.ativo;

      const { error } = await supabase
        .from("profiles")
        .update(payload)
        .eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      qc.invalidateQueries({ queryKey: queryKeys.vendedores() });
      qc.invalidateQueries({ queryKey: ["vendedores", "detail", id] });
    },
  });
}

export function useDesativarVendedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ ativo: false })
        .eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.vendedores() });
    },
  });
}

export function useExcluirVendedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/vendedores/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? "Falha ao excluir usuário.");
      }
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.vendedores() });
    },
  });
}

export function useAtualizarPermissoes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      usuario_id: string;
      modulos_extras: string[];
      acoes_extras: Record<string, string[]>;
    }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({
          permissoes_extras: {
            modulos_extras: input.modulos_extras,
            acoes_extras: input.acoes_extras,
          },
        })
        .eq("id", input.usuario_id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.vendedores() });
      qc.invalidateQueries({ queryKey: queryKeys.meuPerfil() });
    },
  });
}
