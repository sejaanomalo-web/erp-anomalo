"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/card";
import { LeadStatusBadge } from "@/components/tables/StatusBadge";
import { mockLeads } from "@/lib/mocks";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function LeadDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const lead = mockLeads.find((l) => l.id === id) ?? mockLeads[0];

  return (
    <div className="flex flex-col gap-2xl">
      <Link
        href="/crm/leads"
        className="inline-flex items-center gap-xs text-body-sm text-text-3 hover:text-accent self-start"
      >
        <ArrowLeft size={14} strokeWidth={1.8} />
        Voltar a leads
      </Link>
      <Hero
        eyebrow="Lead"
        titulo={lead.nome}
        descricao={`Vendedor: ${lead.vendedor}. Valor estimado ${formatCurrency(lead.valor_estimado)}.`}
        acoes={<LeadStatusBadge status={lead.status} />}
      />
      <Card className="p-lg">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div className="flex flex-col gap-xxs">
            <dt className="text-label-caps text-text-3">Próximo contato</dt>
            <dd className="text-body-md text-text-1">
              {formatDate(lead.proximo_contato)}
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
