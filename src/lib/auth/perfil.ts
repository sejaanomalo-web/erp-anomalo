"use client";

import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Resolve o perfil do usuário autenticado.
 *
 * Causa do bug que isto evita: chamar `from("profiles").maybeSingle()` sem
 * filtro retorna a primeira linha permitida pela RLS. Se outro profile da
 * mesma empresa vier antes, pega-se o errado (que pode estar sem
 * `empresa_id`). Sempre filtre por `auth.uid()`.
 */
export async function getPerfilAutenticado(
  supabase: SupabaseClient,
): Promise<{ id: string; empresa_id: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Você não está autenticado.");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, empresa_id")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw error;
  if (!profile) {
    throw new Error("Perfil não encontrado para este usuário.");
  }
  if (!profile.empresa_id) {
    throw new Error(
      "Seu perfil ainda não está vinculado a uma empresa. Peça ao admin para acertar em Configurações > Permissões.",
    );
  }
  return { id: profile.id as string, empresa_id: profile.empresa_id as string };
}
