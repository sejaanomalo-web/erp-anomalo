"use client";

import { Users, Target, MessageSquareText, Phone } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { KPICard } from "@/components/sections/KPICard";
import { Card } from "@/components/ui/card";
import { LeadStatusBadge } from "@/components/tables/StatusBadge";
import { mockLeads } from "@/lib/mocks";
import { formatCurrency, formatDate } from "@/lib/utils";
import { LEAD_KANBAN_COLUMNS } from "@/lib/constants";

export default function CrmPage() {
  const totalLeads = mockLeads.length;
  const ganhos = mockLeads.filter((l) => l.status === "ganho").length;
  const taxa = totalLeads ? (ganhos / totalLeads) * 100 : 0;
  const ticket = mockLeads.reduce((acc, l) => acc + l.valor_estimado, 0) / totalLeads;

  return (
    <div className="flex flex-col gap-3xl">
      <Hero
        eyebrow="Relacionamento"
        titulo="CRM"
        descricao="Pipeline de leads e métricas de conversão."
      />
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-md">
        <KPICard
          label="Leads ativos"
          valor={totalLeads}
          icone={<Users size={16} strokeWidth={1.8} />}
        />
        <KPICard
          label="Taxa de conversão"
          valor={taxa}
          formato="percentual"
          icone={<Target size={16} strokeWidth={1.8} />}
        />
        <KPICard
          label="Ticket médio (lead)"
          valor={ticket}
          formato="moeda"
          icone={<MessageSquareText size={16} strokeWidth={1.8} />}
        />
        <KPICard
          label="Próximas interações"
          valor={mockLeads.filter((l) => l.proximo_contato).length}
          icone={<Phone size={16} strokeWidth={1.8} />}
        />
      </section>

      <section className="flex flex-col gap-md">
        <span className="text-label-caps text-text-3">Pipeline</span>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-md">
          {LEAD_KANBAN_COLUMNS.map((col) => {
            const items = mockLeads.filter((l) => l.status === col.id);
            return (
              <Card key={col.id} className="p-md flex flex-col gap-md min-h-[160px]">
                <div className="flex items-center justify-between">
                  <span className="text-label-caps text-text-1">{col.titulo}</span>
                  <span className="text-body-sm text-text-3 tabular-nums">
                    {items.length}
                  </span>
                </div>
                <ul className="flex flex-col gap-sm">
                  {items.slice(0, 3).map((lead) => (
                    <li key={lead.id} className="flex flex-col gap-xxs">
                      <span className="text-body-md text-text-1 truncate">
                        {lead.nome}
                      </span>
                      <span className="text-body-sm text-text-3 tabular-nums">
                        {formatCurrency(lead.valor_estimado)}
                      </span>
                      <span className="text-caption text-text-4">
                        {formatDate(lead.proximo_contato)}
                      </span>
                    </li>
                  ))}
                  {items.length === 0 ? (
                    <li className="text-caption text-text-4">Vazio</li>
                  ) : null}
                </ul>
                {items.length > 3 ? (
                  <span className="text-caption text-text-4 mt-auto">
                    +{items.length - 3} mais
                  </span>
                ) : null}
              </Card>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-md">
        <span className="text-label-caps text-text-3">Últimos leads</span>
        <Card className="divide-y divide-border-thin">
          {mockLeads.slice(0, 5).map((lead) => (
            <div
              key={lead.id}
              className="flex items-center justify-between gap-md p-md"
            >
              <div className="flex flex-col gap-xxs min-w-0">
                <span className="text-body-md text-text-1 truncate">{lead.nome}</span>
                <span className="text-body-sm text-text-3">
                  {lead.vendedor} · próximo contato {formatDate(lead.proximo_contato)}
                </span>
              </div>
              <div className="flex items-center gap-md">
                <span className="text-body-md tabular-nums text-text-1">
                  {formatCurrency(lead.valor_estimado)}
                </span>
                <LeadStatusBadge status={lead.status} />
              </div>
            </div>
          ))}
        </Card>
      </section>
    </div>
  );
}
