import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database.types";

interface AuditPayload {
  modulo: string;
  acao: string;
  entidade: string;
  entidadeId?: string;
  dadosAntes?: Json;
  dadosDepois?: Json;
  ip?: string;
  userAgent?: string;
}

export async function logAudit(payload: AuditPayload) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("empresa_id")
      .eq("id", user.id)
      .maybeSingle();

    await supabase.from("audit_logs").insert({
      empresa_id: profile?.empresa_id ?? null,
      usuario_id: user.id,
      modulo: payload.modulo,
      acao: payload.acao,
      entidade: payload.entidade,
      entidade_id: payload.entidadeId ?? null,
      dados_antes: payload.dadosAntes ?? null,
      dados_depois: payload.dadosDepois ?? null,
      ip: payload.ip ?? null,
      user_agent: payload.userAgent ?? null,
    });
  } catch (err) {
    // Nunca derrubar a request principal por falha de audit. Só logar.
    console.error("[audit] falha ao gravar log", err);
  }
}
