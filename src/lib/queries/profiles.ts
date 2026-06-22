"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "./keys";
import type { Papel, Profile } from "@/types/database.types";

export function useMeuPerfil() {
  return useQuery({
    queryKey: queryKeys.meuPerfil(),
    queryFn: async (): Promise<Profile | null> => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
  });
}

export interface VendedorOption {
  id: string;
  nome: string;
  papel: Papel;
}

export function useVendedores() {
  return useQuery({
    queryKey: queryKeys.vendedoresOptions(),
    queryFn: async (): Promise<VendedorOption[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("id, nome, papel")
        .in("papel", ["vendedor", "gestor", "admin"])
        .eq("ativo", true)
        .order("nome", { ascending: true });
      if (error) throw error;
      return (data ?? []) as VendedorOption[];
    },
  });
}
