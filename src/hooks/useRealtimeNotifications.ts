"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Notificacao } from "@/types/database.types";

export function useRealtimeNotifications(userId: string | null | undefined) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);

  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();
    let mounted = true;

    supabase
      .from("notificacoes")
      .select("*")
      .eq("usuario_id", userId)
      .eq("lida", false)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (!mounted) return;
        setNotificacoes((data as Notificacao[]) ?? []);
      });

    const channel = supabase
      .channel(`notificacoes:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notificacoes",
          filter: `usuario_id=eq.${userId}`,
        },
        (payload) => {
          setNotificacoes((prev) => [payload.new as Notificacao, ...prev]);
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [userId]);

  async function marcarLida(id: string) {
    const supabase = createClient();
    await supabase
      .from("notificacoes")
      .update({ lida: true })
      .eq("id", id);
    setNotificacoes((prev) => prev.filter((n) => n.id !== id));
  }

  async function marcarTodasLidas() {
    if (!userId) return;
    const supabase = createClient();
    await supabase
      .from("notificacoes")
      .update({ lida: true })
      .eq("usuario_id", userId)
      .eq("lida", false);
    setNotificacoes([]);
  }

  return { notificacoes, marcarLida, marcarTodasLidas };
}
