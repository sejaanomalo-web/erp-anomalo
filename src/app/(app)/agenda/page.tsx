"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Calendar, ExternalLink, RefreshCw, Plug, Unplug } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarView, type CalendarEvent } from "@/components/calendar/CalendarView";
import { LoadingState } from "@/components/feedback/LoadingState";
import { toast } from "@/components/feedback/Toast";
import {
  useAgendaConexao,
  useAgendaEventos,
  useSincronizarGoogle,
  useDesconectarGoogle,
} from "@/lib/queries/agenda";
import { useVendas } from "@/lib/queries/vendas";
import { formatDate } from "@/lib/utils";

export default function AgendaPage() {
  return (
    <Suspense fallback={<LoadingState linhas={6} />}>
      <AgendaContent />
    </Suspense>
  );
}

function AgendaContent() {
  const searchParams = useSearchParams();
  const conexao = useAgendaConexao();
  const eventos = useAgendaEventos();
  const vendas = useVendas();
  const sync = useSincronizarGoogle();
  const desconectar = useDesconectarGoogle();

  useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");
    if (connected === "1") {
      toast.success("Google Calendar conectado.");
    }
    if (error) {
      toast.error(`Falha na conexão: ${decodeURIComponent(error)}`);
    }
  }, [searchParams]);

  // Mostra eventos sincronizados + entregas previstas das vendas
  const eventosCalendar: CalendarEvent[] = useMemo(() => {
    const items: CalendarEvent[] = [];
    for (const e of eventos.data ?? []) {
      items.push({
        id: e.id,
        date: e.inicio,
        titulo: e.titulo,
        tone:
          e.status_sync === "sincronizado"
            ? "success"
            : e.status_sync === "erro"
              ? "error"
              : "warning",
      });
    }
    for (const v of vendas.data ?? []) {
      if (v.status === "entregue" || v.status === "cancelada") continue;
      items.push({
        id: `venda-${v.id}`,
        date: v.data_prevista_entrega,
        titulo: `#${v.numero} · ${v.cliente?.nome ?? "—"}`,
        tone: v.tipo === "orcamento" ? "muted" : "accent",
        link: `/vendas/${v.id}`,
      });
    }
    return items;
  }, [eventos.data, vendas.data]);

  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Agenda"
        titulo="Calendário"
        descricao="Entregas previstas e sincronização com Google Agenda."
        acoes={
          <div className="flex items-center gap-sm flex-wrap">
            {conexao.data?.conectado ? (
              <>
                <Button
                  variant="secondary"
                  onClick={async () => {
                    try {
                      const r = await sync.mutateAsync();
                      toast.success(
                        r.criados > 0
                          ? `Sincronizadas ${r.criados} entregas.`
                          : "Nada novo para sincronizar.",
                      );
                    } catch (e) {
                      toast.error(
                        e instanceof Error ? e.message : "Falha.",
                      );
                    }
                  }}
                  disabled={sync.isPending}
                >
                  <RefreshCw size={14} strokeWidth={1.8} />
                  {sync.isPending ? "Sincronizando…" : "Sincronizar"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={async () => {
                    await desconectar.mutateAsync();
                    toast.success("Conta Google desconectada.");
                  }}
                  disabled={desconectar.isPending}
                >
                  <Unplug size={14} strokeWidth={1.8} />
                  Desconectar
                </Button>
              </>
            ) : (
              <Button asChild>
                <a href="/api/google/oauth/start">
                  <Plug size={14} strokeWidth={1.8} />
                  Conectar Google
                </a>
              </Button>
            )}
          </div>
        }
      />

      <Card className="p-lg flex flex-col gap-md">
        <div className="flex items-start justify-between gap-md flex-wrap">
          <div className="flex flex-col gap-xs">
            <span className="text-label-caps text-text-3">Google Agenda</span>
            {conexao.isLoading ? (
              <span className="text-body-sm text-text-3">Verificando…</span>
            ) : conexao.data?.conectado ? (
              <>
                <Badge tone="success">Conectado</Badge>
                {conexao.data.ultimo_sync_em ? (
                  <span className="text-body-sm text-text-3">
                    Última sincronização em{" "}
                    {formatDate(conexao.data.ultimo_sync_em)}
                  </span>
                ) : (
                  <span className="text-body-sm text-text-3">
                    Aguardando primeira sincronização.
                  </span>
                )}
              </>
            ) : (
              <>
                <Badge tone="muted">Não conectado</Badge>
                <span className="text-body-sm text-text-3 max-w-md">
                  Conecte sua conta Google para que as entregas previstas
                  apareçam direto no seu calendário pessoal.
                </span>
              </>
            )}
          </div>
          <a
            href="https://calendar.google.com"
            target="_blank"
            rel="noreferrer noopener"
            className="text-body-sm text-text-3 hover:text-accent inline-flex items-center gap-xs"
          >
            Abrir Google Agenda
            <ExternalLink size={12} strokeWidth={1.8} />
          </a>
        </div>
      </Card>

      {vendas.isLoading || eventos.isLoading ? (
        <LoadingState linhas={6} />
      ) : eventosCalendar.length === 0 ? (
        <Card className="p-lg flex flex-col items-center gap-md py-3xl">
          <Calendar
            size={48}
            strokeWidth={1.4}
            className="text-text-3"
            aria-hidden
          />
          <span className="text-h3 text-text-1">Sem eventos no momento.</span>
          <span className="text-body-md text-text-3">
            Quando houver entregas previstas, elas aparecem aqui.
          </span>
        </Card>
      ) : (
        <CalendarView events={eventosCalendar} />
      )}

      <p className="text-caption text-text-4">
        Sync atual é unidirecional: ERP envia entregas para o Google Agenda. A
        leitura de eventos do Google de volta para o ERP entra em iteração
        futura.
      </p>
    </div>
  );
}
