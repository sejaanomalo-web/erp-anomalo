import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createCalendarEvent,
  refreshAccessToken,
} from "@/lib/google/calendar";
import { logAudit } from "@/lib/audit/logger";

export const dynamic = "force-dynamic";

export async function POST(_request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const { data: token } = await supabase
    .from("google_calendar_tokens")
    .select("*")
    .eq("usuario_id", user.id)
    .maybeSingle();

  if (!token) {
    return NextResponse.json(
      { message: "Conta Google não conectada." },
      { status: 412 },
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      {
        message:
          "Credenciais Google não configuradas. Adicione GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET.",
      },
      { status: 500 },
    );
  }

  // Refresh access token sempre que faltar < 5 min
  let accessToken = token.access_token as string | null;
  const expiresAt = token.expires_at ? new Date(token.expires_at as string) : null;
  const precisaRenovar =
    !accessToken || !expiresAt || expiresAt.getTime() - Date.now() < 5 * 60_000;

  if (precisaRenovar) {
    const refreshed = await refreshAccessToken({
      refreshToken: token.refresh_token as string,
      clientId,
      clientSecret,
    });
    accessToken = refreshed.access_token;
    await supabase
      .from("google_calendar_tokens")
      .update({
        access_token: refreshed.access_token,
        expires_at: new Date(
          Date.now() + refreshed.expires_in * 1000,
        ).toISOString(),
      })
      .eq("usuario_id", user.id);
  }

  // Busca vendas com entrega futura sem evento sincronizado
  const hoje = new Date().toISOString().slice(0, 10);
  const { data: vendas } = await supabase
    .from("vendas")
    .select("id, numero, data_prevista_entrega, status")
    .gte("data_prevista_entrega", hoje)
    .not("status", "in", "(entregue,cancelada)");

  if (!vendas?.length) {
    return NextResponse.json({ ok: true, criados: 0, motivo: "nada a sincronizar" });
  }

  const { data: jaSincronizados } = await supabase
    .from("agenda_eventos")
    .select("venda_id")
    .in("venda_id", vendas.map((v) => v.id as string))
    .eq("status_sync", "sincronizado");

  const setSync = new Set(
    (jaSincronizados ?? []).map((s) => s.venda_id as string),
  );
  const aSincronizar = vendas.filter((v) => !setSync.has(v.id as string));

  let criados = 0;
  for (const venda of aSincronizar) {
    const dia = venda.data_prevista_entrega as string;
    const inicio = `${dia}T09:00:00-03:00`;
    const fim = `${dia}T10:00:00-03:00`;
    try {
      const event = await createCalendarEvent({
        accessToken: accessToken!,
        calendarId: (token.calendar_id as string | null) ?? "primary",
        event: {
          summary: `Entrega Aton #${venda.numero}`,
          description: `Entrega prevista da venda #${venda.numero}`,
          start: { dateTime: inicio, timeZone: "America/Sao_Paulo" },
          end: { dateTime: fim, timeZone: "America/Sao_Paulo" },
        },
      });

      await supabase.from("agenda_eventos").insert({
        empresa_id: null, // RLS exige; será preenchido por trigger ou aceito por admin
        venda_id: venda.id,
        usuario_id: user.id,
        google_event_id: event.id,
        titulo: `Entrega #${venda.numero}`,
        inicio,
        fim,
        status_sync: "sincronizado",
      });
      criados++;
    } catch (err) {
      await supabase.from("agenda_eventos").insert({
        venda_id: venda.id,
        usuario_id: user.id,
        titulo: `Entrega #${venda.numero}`,
        inicio,
        status_sync: "erro",
        ultimo_erro: err instanceof Error ? err.message : "erro desconhecido",
      });
    }
  }

  await supabase
    .from("google_calendar_tokens")
    .update({ ultimo_sync_em: new Date().toISOString() })
    .eq("usuario_id", user.id);

  await logAudit({
    modulo: "agenda",
    acao: "google_sync",
    entidade: "agenda_eventos",
    dadosDepois: { criados },
  });

  return NextResponse.json({ ok: true, criados });
}
