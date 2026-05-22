"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { startOfMonth, endOfMonth, addMonths } from "date-fns";
import { Calendar, ExternalLink, RefreshCw, Plug, Unplug } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarView,
  type CalendarEvent,
} from "@/components/calendar/CalendarView";
import { LoadingState } from "@/components/feedback/LoadingState";
import { toast } from "@/components/feedback/Toast";
import {
  useAgendaConexao,
  useAgendaEventos,
  useSincronizarGoogle,
  useDesconectarGoogle,
} from "@/lib/queries/agenda";
import { useVendas } from "@/lib/queries/vendas";
import { useLancamentos } from "@/lib/queries/financeiro";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AgendaPage() {
  return (
    <Suspense fallback={<LoadingState linhas={6} />}>
      <AgendaContent />
    </Suspense>
  );
}

function AgendaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conexao = useAgendaConexao();
  const eventos = useAgendaEventos();
  const vendas = useVendas();
  const sync = useSincronizarGoogle();
  const desconectar = useDesconectarGoogle();

  // Janela de 3 meses: mês anterior + atual + 2 próximos. Cobre lançamentos
  // que aparecem no calendário enquanto o usuário navega entre meses.
  const periodoFinanceiro = useMemo(() => {
    const hoje = new Date();
    return {
      inicio: startOfMonth(addMonths(hoje, -1)).toISOString().slice(0, 10),
      fim: endOfMonth(addMonths(hoje, 2)).toISOString().slice(0, 10),
    };
  }, []);
  const lancamentos = useLancamentos({
    inicio: periodoFinanceiro.inicio,
    fim: periodoFinanceiro.fim,
  });

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

  // Agrega:
  //   • eventos sincronizados com Google (agenda_eventos)
  //   • entregas previstas das vendas/orçamentos ativos
  //   • lançamentos financeiros com vencimento (entradas e saídas)
  const eventosCalendar: CalendarEvent[] = useMemo(() => {
    const items: CalendarEvent[] = [];

    for (const e of eventos.data ?? []) {
      items.push({
        id: `agenda-${e.id}`,
        date: e.inicio,
        titulo: e.titulo,
        categoria: "Agenda",
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
        categoria: v.tipo === "orcamento" ? "Orçamento" : "Entrega",
        descricao: `Entrega prevista · ${formatCurrency(Number(v.valor_total))}`,
        tone: v.tipo === "orcamento" ? "muted" : "accent",
        link: `/vendas/${v.id}`,
      });
    }

    for (const l of lancamentos.data ?? []) {
      const data = l.data_vencimento ?? l.data_competencia;
      if (!data) continue;

      let tone: CalendarEvent["tone"] = "neutral";
      if (l.tipo === "entrada") {
        tone = l.status === "pago" ? "success" : "accent";
      } else {
        if (l.status === "pago") tone = "muted";
        else if (l.status === "atrasado") tone = "error";
        else tone = "warning";
      }

      const categoria = l.tipo === "entrada" ? "Receita" : "Despesa";
      const link =
        l.tipo === "entrada" ? "/financeiro/entradas" : "/financeiro/saidas";

      items.push({
        id: `fin-${l.id}`,
        date: data,
        titulo: l.descricao,
        categoria,
        descricao: [
          formatCurrency(Number(l.valor)),
          l.forma_pagamento,
          l.categoria?.nome,
        ]
          .filter(Boolean)
          .join(" · "),
        tone,
        link,
      });
    }

    return items;
  }, [eventos.data, vendas.data, lancamentos.data]);

  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Agenda"
        titulo="Calendário"
        descricao="Entregas, vencimentos e sincronização com Google Agenda."
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

      {vendas.isLoading || eventos.isLoading || lancamentos.isLoading ? (
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
            Quando houver entregas previstas ou lançamentos financeiros, eles
            aparecem aqui.
          </span>
        </Card>
      ) : (
        <CalendarView
          events={eventosCalendar}
          onEventClick={(ev) => {
            if (ev.link) router.push(ev.link);
          }}
        />
      )}

      <div className="flex flex-wrap gap-md text-body-sm text-text-3">
        <Legenda tone="accent" label="Entrega de venda" />
        <Legenda tone="muted" label="Orçamento" />
        <Legenda tone="success" label="Receita / sync OK" />
        <Legenda tone="warning" label="A vencer / pendente" />
        <Legenda tone="error" label="Atrasado / erro" />
      </div>

      <p className="text-caption text-text-4">
        Clique em um dia para ver todos os compromissos. Clique em um evento
        para abrir a tela de origem (venda, despesa ou receita).
      </p>
    </div>
  );
}

function Legenda({
  tone,
  label,
}: {
  tone: "accent" | "muted" | "success" | "warning" | "error";
  label: string;
}) {
  const dot =
    tone === "accent"
      ? "bg-accent"
      : tone === "success"
        ? "bg-success"
        : tone === "warning"
          ? "bg-warning"
          : tone === "error"
            ? "bg-error"
            : "bg-text-4";
  return (
    <span className="inline-flex items-center gap-xs">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
