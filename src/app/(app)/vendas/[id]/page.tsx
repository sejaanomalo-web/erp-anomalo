"use client";

import { use } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VendaStatusBadge } from "@/components/tables/StatusBadge";
import { LoadingState } from "@/components/feedback/LoadingState";
import { useVenda } from "@/lib/queries/vendas";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function VendaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: venda, isLoading, error } = useVenda(id);

  if (isLoading) return <LoadingState linhas={6} />;
  if (error || !venda) {
    return (
      <div className="solid-surface p-lg flex flex-col gap-xs">
        <span className="text-label-caps text-error">Erro</span>
        <p className="text-body-md text-text-1">
          {error instanceof Error ? error.message : "Venda não encontrada."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2xl">
      <Link
        href="/vendas"
        className="inline-flex items-center gap-xs text-body-sm text-text-3 hover:text-accent self-start"
      >
        <ArrowLeft size={14} strokeWidth={1.8} />
        Voltar para vendas
      </Link>

      <Hero
        eyebrow={`Venda #${venda.numero}`}
        titulo={venda.cliente?.nome ?? "Cliente sem nome"}
        descricao={`Vendedor: ${venda.vendedor?.nome ?? "—"}. Entrega ${formatDate(venda.data_prevista_entrega)}.`}
        acoes={<VendaStatusBadge status={venda.status} />}
      />

      <Tabs defaultValue="detalhes">
        <TabsList>
          <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
          <TabsTrigger value="producao">Produção</TabsTrigger>
          <TabsTrigger value="comentarios">Comentários</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="detalhes">
          <Card className="p-lg">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-md">
              {[
                ["Cliente", venda.cliente?.nome ?? "—"],
                ["Vendedor", venda.vendedor?.nome ?? "—"],
                ["Valor total", formatCurrency(Number(venda.valor_total))],
                ["Desconto", formatCurrency(Number(venda.desconto))],
                ["Forma de pagamento", venda.forma_pagamento ?? "—"],
                ["Parcelas", String(venda.parcelas)],
                ["Comissão", formatCurrency(Number(venda.comissao_valor ?? 0))],
                ["Data da venda", formatDate(venda.data_venda)],
                ["Entrega prevista", formatDate(venda.data_prevista_entrega)],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-col gap-xxs">
                  <dt className="text-label-caps text-text-3">{k}</dt>
                  <dd className="text-body-md text-text-1">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </TabsContent>

        <TabsContent value="producao">
          <Card className="p-lg">
            <p className="text-body-md text-text-3">
              Ver no <Link href="/producao" className="text-accent">quadro Kanban</Link>.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="comentarios">
          <Card className="p-lg">
            <p className="text-body-md text-text-3">
              Thread de comentários disponível em iteração futura.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card className="p-lg">
            <p className="text-body-md text-text-3">
              Histórico de alterações registrado em <code className="text-text-1">audit_logs</code>.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
