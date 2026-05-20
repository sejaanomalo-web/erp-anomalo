"use client";

import { Hero } from "@/components/sections/Hero";
import { CalendarView, type CalendarEvent } from "@/components/calendar/CalendarView";
import { mockProducoes } from "@/lib/mocks";

export default function ProducaoCalendarioPage() {
  const eventos: CalendarEvent[] = mockProducoes.map((p) => ({
    id: p.id,
    date: p.prazo,
    titulo: `#${p.vendaNumero} · ${p.produto}`,
    tone:
      p.status === "pronto" || p.status === "expedicao"
        ? "success"
        : p.status === "em_producao" || p.status === "controle_qualidade"
          ? "warning"
          : "neutral",
  }));

  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Fábrica"
        titulo="Calendário de produção"
        descricao="Datas previstas, ordenadas por prioridade."
      />
      <CalendarView events={eventos} />
    </div>
  );
}
