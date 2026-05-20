"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CalendarEvent {
  id: string;
  date: string | Date;
  titulo: string;
  tone?: "neutral" | "accent" | "success" | "warning" | "error" | "muted";
  link?: string;
}

interface CalendarViewProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  initialView?: "month" | "list";
  initialDate?: Date;
}

const TONE_BG: Record<NonNullable<CalendarEvent["tone"]>, string> = {
  neutral: "bg-surface-2 text-text-2 border-border-thin",
  muted: "bg-surface-2 text-text-3 border-border-thin",
  accent: "bg-accent-subtle text-accent border-[var(--accent-strong)]",
  success: "bg-[rgba(22,163,74,0.12)] text-success border-[rgba(22,163,74,0.30)]",
  warning: "bg-[rgba(234,179,8,0.12)] text-warning border-[rgba(234,179,8,0.30)]",
  error: "bg-[rgba(239,68,68,0.12)] text-error border-[rgba(239,68,68,0.30)]",
};

export function CalendarView({
  events,
  onEventClick,
  initialView = "month",
  initialDate = new Date(),
}: CalendarViewProps) {
  const [view, setView] = useState<"month" | "list">(initialView);
  const [reference, setReference] = useState(initialDate);

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(reference), { locale: ptBR });
    const end = endOfWeek(endOfMonth(reference), { locale: ptBR });
    const days: Date[] = [];
    let cursor = start;
    while (cursor <= end) {
      days.push(cursor);
      cursor = addDays(cursor, 1);
    }
    return days;
  }, [reference]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of events) {
      const d = typeof ev.date === "string" ? new Date(ev.date) : ev.date;
      const key = format(d, "yyyy-MM-dd");
      const arr = map.get(key) ?? [];
      arr.push(ev);
      map.set(key, arr);
    }
    return map;
  }, [events]);

  const listEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const da = typeof a.date === "string" ? new Date(a.date) : a.date;
      const db = typeof b.date === "string" ? new Date(b.date) : b.date;
      return da.getTime() - db.getTime();
    });
  }, [events]);

  return (
    <div className="flex flex-col gap-md">
      <div className="flex items-center justify-between flex-wrap gap-md">
        <div className="flex items-center gap-sm">
          <Button
            variant="secondary"
            size="iconSm"
            onClick={() => setReference((r) => subMonths(r, 1))}
            aria-label="Mês anterior"
          >
            <ChevronLeft size={16} strokeWidth={1.8} />
          </Button>
          <span className="text-h4 text-text-1 min-w-[180px] text-center capitalize">
            {format(reference, "MMMM yyyy", { locale: ptBR })}
          </span>
          <Button
            variant="secondary"
            size="iconSm"
            onClick={() => setReference((r) => addMonths(r, 1))}
            aria-label="Próximo mês"
          >
            <ChevronRight size={16} strokeWidth={1.8} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setReference(new Date())}>
            Hoje
          </Button>
        </div>
        <div className="flex items-center gap-xs">
          <Button
            size="sm"
            variant={view === "month" ? "default" : "secondary"}
            onClick={() => setView("month")}
            className="md:flex hidden"
          >
            Mês
          </Button>
          <Button
            size="sm"
            variant={view === "list" ? "default" : "secondary"}
            onClick={() => setView("list")}
          >
            Lista
          </Button>
        </div>
      </div>

      {view === "month" ? (
        <div className="solid-surface overflow-hidden">
          <div className="grid grid-cols-7 border-b border-border-thin">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
              <div
                key={d}
                className="text-label-caps text-text-3 px-sm py-sm text-center"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {monthDays.map((day) => {
              const inMonth = isSameMonth(day, reference);
              const today = isSameDay(day, new Date());
              const dayEvents = eventsByDay.get(format(day, "yyyy-MM-dd")) ?? [];
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "min-h-[96px] border-r border-b border-border-thin p-xs flex flex-col gap-xs",
                    !inMonth && "bg-surface-1/40 text-text-4",
                  )}
                >
                  <span
                    className={cn(
                      "text-body-sm tabular-nums",
                      today
                        ? "text-accent font-semibold"
                        : inMonth
                          ? "text-text-2"
                          : "text-text-4",
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  <div className="flex flex-col gap-[2px]">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => onEventClick?.(ev)}
                        className={cn(
                          "text-left text-body-sm border px-[6px] py-[2px] truncate",
                          TONE_BG[ev.tone ?? "neutral"],
                        )}
                      >
                        {ev.titulo}
                      </button>
                    ))}
                    {dayEvents.length > 3 ? (
                      <span className="text-caption text-text-4">
                        +{dayEvents.length - 3} mais
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="solid-surface divide-y divide-border-thin">
          {listEvents.length === 0 ? (
            <div className="p-lg text-center text-text-3">
              Nenhum evento no período.
            </div>
          ) : (
            listEvents.map((ev) => {
              const d = typeof ev.date === "string" ? new Date(ev.date) : ev.date;
              return (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => onEventClick?.(ev)}
                  className="flex items-center gap-md w-full p-md text-left hover:bg-surface-2 transition-colors duration-fast"
                >
                  <div className="w-16 shrink-0 text-center">
                    <span className="block text-label-caps text-text-3">
                      {format(d, "MMM", { locale: ptBR })}
                    </span>
                    <span className="block text-h3 text-text-1 tabular-nums">
                      {format(d, "dd")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-body-md text-text-1 truncate">
                      {ev.titulo}
                    </span>
                    <span className="block text-body-sm text-text-3">
                      {format(d, "EEEE", { locale: ptBR })}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      ev.tone === "success" && "bg-success",
                      ev.tone === "warning" && "bg-warning",
                      ev.tone === "error" && "bg-error",
                      (!ev.tone || ev.tone === "neutral" || ev.tone === "muted") &&
                        "bg-text-4",
                      ev.tone === "accent" && "bg-accent",
                    )}
                  />
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
