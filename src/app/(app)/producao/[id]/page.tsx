"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/card";
import { ProducaoStatusBadge } from "@/components/tables/StatusBadge";
import { mockProducoes } from "@/lib/mocks";
import { formatDate } from "@/lib/utils";

export default function ProducaoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const prod = mockProducoes.find((p) => p.id === id) ?? mockProducoes[0];

  return (
    <div className="flex flex-col gap-2xl">
      <Link
        href="/producao"
        className="inline-flex items-center gap-xs text-body-sm text-text-3 hover:text-accent self-start"
      >
        <ArrowLeft size={14} strokeWidth={1.8} />
        Voltar ao quadro
      </Link>
      <Hero
        eyebrow={`Produção · venda #${prod.vendaNumero}`}
        titulo={prod.produto}
        descricao={`Responsável: ${prod.responsavel}. Entrega em ${formatDate(prod.prazo)}.`}
        acoes={<ProducaoStatusBadge status={prod.status} />}
      />
      <Card className="p-lg">
        <p className="text-body-md text-text-3">
          Cronograma, materiais usados, anexos e comentários ficarão aqui após a integração com Supabase.
        </p>
      </Card>
    </div>
  );
}
