"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface AgendaTokenInfo {
  conectado: boolean;
  ultimo_sync_em: string | null;
  scope: string | null;
}

export function useAgendaConexao() {
  return useQuery({
    queryKey: ["agenda", "conexao"],
    queryFn: async (): Promise<AgendaTokenInfo> => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return { conectado: false, ultimo_sync_em: null, scope: null };
      }
      const { data } = await supabase
        .from("google_calendar_tokens")
        .select("ultimo_sync_em, scope")
        .eq("usuario_id", user.id)
        .maybeSingle();
      return {
        conectado: Boolean(data),
        ultimo_sync_em:
          (data?.ultimo_sync_em as string | null | undefined) ?? null,
        scope: (data?.scope as string | null | undefined) ?? null,
      };
    },
  });
}

export interface AgendaEvento {
  id: string;
  titulo: string;
  inicio: string;
  fim: string | null;
  status_sync: "pendente" | "sincronizado" | "erro";
  ultimo_erro: string | null;
  venda_id: string | null;
}

export function useAgendaEventos() {
  return useQuery({
    queryKey: ["agenda", "eventos"],
    queryFn: async (): Promise<AgendaEvento[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("agenda_eventos")
        .select("id, titulo, inicio, fim, status_sync, ultimo_erro, venda_id")
        .order("inicio", { ascending: true })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as AgendaEvento[];
    },
  });
}

export function useSincronizarGoogle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/google/calendar/sync", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? "Falha na sincronização.");
      }
      return (await res.json()) as { ok: boolean; criados: number };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agenda"] });
    },
  });
}

export function useDesconectarGoogle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/google/disconnect", { method: "POST" });
      if (!res.ok) throw new Error("Falha ao desconectar.");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agenda"] });
    },
  });
}
