"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getPerfilAutenticado } from "@/lib/auth/perfil";
import {
  FOTO_PRODUTO_MAX_BYTES,
  FOTO_PRODUTO_MIME_PERMITIDOS,
} from "@/lib/constants";

export interface EmpresaRow {
  id: string;
  nome: string;
  cnpj: string | null;
  logo_url: string | null;
  endereco: Record<string, unknown> | null;
  ativa: boolean;
  created_at: string;
  updated_at: string;
}

export function useEmpresa() {
  return useQuery({
    queryKey: ["empresa", "self"],
    queryFn: async (): Promise<EmpresaRow | null> => {
      const supabase = createClient();
      const perfil = await getPerfilAutenticado(supabase);
      const { data, error } = await supabase
        .from("empresas")
        .select("*")
        .eq("id", perfil.empresa_id)
        .maybeSingle();
      if (error) throw error;
      return (data as EmpresaRow | null) ?? null;
    },
  });
}

export interface SalvarEmpresaInput {
  nome: string;
  cnpj?: string | null;
  logo_url?: string | null;
}

export function useSalvarEmpresa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SalvarEmpresaInput) => {
      const supabase = createClient();
      const perfil = await getPerfilAutenticado(supabase);
      const { error } = await supabase
        .from("empresas")
        .update({
          nome: input.nome.trim(),
          cnpj: input.cnpj?.trim() || null,
          logo_url: input.logo_url ?? undefined,
        })
        .eq("id", perfil.empresa_id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["empresa"] });
    },
  });
}

export function useUploadLogoEmpresa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File): Promise<{ url: string }> => {
      if (file.size > FOTO_PRODUTO_MAX_BYTES) {
        throw new Error(
          `Logo maior que ${Math.round(FOTO_PRODUTO_MAX_BYTES / 1024 / 1024)}MB.`,
        );
      }
      if (
        !FOTO_PRODUTO_MIME_PERMITIDOS.includes(
          file.type as (typeof FOTO_PRODUTO_MIME_PERMITIDOS)[number],
        )
      ) {
        throw new Error("Formato não suportado. Use JPEG, PNG ou WebP.");
      }
      const supabase = createClient();
      const perfil = await getPerfilAutenticado(supabase);
      const ext = file.name.split(".").pop() ?? "png";
      const path = `${perfil.empresa_id}/logo-${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from("empresa-logos")
        .upload(path, file, {
          cacheControl: "31536000",
          upsert: true,
          contentType: file.type,
        });
      if (error) throw error;

      const { data } = supabase.storage
        .from("empresa-logos")
        .getPublicUrl(path);

      // Já persiste no campo logo_url da empresa
      await supabase
        .from("empresas")
        .update({ logo_url: data.publicUrl })
        .eq("id", perfil.empresa_id);

      return { url: data.publicUrl };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["empresa"] });
    },
  });
}
