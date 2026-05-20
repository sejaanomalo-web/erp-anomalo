"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/card";
import { mockMateriais } from "@/lib/mocks";
import { formatCurrency } from "@/lib/utils";

export default function MaterialDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const m = mockMateriais.find((x) => x.id === id) ?? mockMateriais[0];

  return (
    <div className="flex flex-col gap-2xl">
      <Link
        href="/materiais"
        className="inline-flex items-center gap-xs text-body-sm text-text-3 hover:text-accent self-start"
      >
        <ArrowLeft size={14} strokeWidth={1.8} />
        Voltar a materiais
      </Link>
      <Hero
        eyebrow="Insumo"
        titulo={m.nome}
        descricao={`Fornecedor principal: ${m.fornecedor}.`}
      />
      <Card className="p-lg">
        <dl className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <div className="flex flex-col gap-xxs">
            <dt className="text-label-caps text-text-3">Estoque atual</dt>
            <dd className="text-h3 tabular-nums text-text-1">
              {m.estoque_atual} {m.unidade}
            </dd>
          </div>
          <div className="flex flex-col gap-xxs">
            <dt className="text-label-caps text-text-3">Mínimo</dt>
            <dd className="text-h3 tabular-nums text-text-1">
              {m.estoque_minimo} {m.unidade}
            </dd>
          </div>
          <div className="flex flex-col gap-xxs">
            <dt className="text-label-caps text-text-3">Custo médio</dt>
            <dd className="text-h3 tabular-nums text-text-1">
              {formatCurrency(m.custo_medio)}
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
