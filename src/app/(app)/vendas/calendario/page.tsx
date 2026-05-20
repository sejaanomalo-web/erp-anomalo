"use client";

import { Hero } from "@/components/sections/Hero";
import { CalendarView, type CalendarEvent } from "@/components/calendar/CalendarView";
import { mockVendas } from "@/lib/mocks";
import { VENDA_STATUS_LABEL, VENDA_STATUS_TONE } from "@/lib/constants";

export default function VendasCalendarioPage() {
  const eventos: CalendarEvent[] = mockVendas.map((v) => ({
    id: v.id,
    date: v.data_prevista_entrega,
    titulo: `#${v.numero} · ${v.cliente}`,
    tone: VENDA_STATUS_TONE[v.status],
    link: `/vendas/${v.id}`,
  }));

  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Operação"
        titulo="Calendário de vendas"
        descricao="Entregas previstas distribuídas por data."
      />
      <CalendarView events={eventos} />
      <div className="flex flex-wrap gap-md text-body-sm text-text-3">
        {Object.entries(VENDA_STATUS_LABEL).map(([k, label]) => (
          <span key={k} className="inline-flex items-center gap-xs">
            <span
              className="h-2 w-2 rounded-full"
              style={{
                background:
                  VENDA_STATUS_TONE[k as keyof typeof VENDA_STATUS_TONE] === "success"
                    ? "var(--success)"
                    : VENDA_STATUS_TONE[k as keyof typeof VENDA_STATUS_TONE] === "warning"
                      ? "var(--warning)"
                      : VENDA_STATUS_TONE[k as keyof typeof VENDA_STATUS_TONE] === "error"
                        ? "var(--error)"
                        : "var(--text-4)",
              }}
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
