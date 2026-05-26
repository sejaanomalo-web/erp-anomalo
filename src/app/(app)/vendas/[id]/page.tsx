"use client";

import { use } from "react";
import { ArrowLeft, Check, Pencil } from "lucide-react";
import Link from "next/link";
import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VendaStatusBadge } from "@/components/tables/StatusBadge";
import { LoadingState } from "@/components/feedback/LoadingState";
import { toast } from "@/components/feedback/Toast";
import { useVenda, useConverterOrcamento } from "@/lib/queries/vendas";
import { formatCurrency, formatDate } from "@/lib/utils";
import { VENDA_TIPO_LABEL, VENDA_TIPO_TONE } from "@/lib/constants";

export default function VendaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: venda, isLoading, error } = useVenda(id);
  const converter = useConverterOrcamento();

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

  const isOrcamento = venda.tipo === "orcamento";

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
        eyebrow={`#${venda.numero} · ${VENDA_TIPO_LABEL[venda.tipo]}`}
        titulo={venda.cliente?.nome ?? "Cliente sem nome"}
        descricao={`Vendedor: ${venda.vendedor?.nome ?? "—"}. Entrega ${formatDate(venda.data_prevista_entrega)}.`}
        acoes={
          <div className="flex items-center gap-sm flex-wrap">
            <Badge tone={VENDA_TIPO_TONE[venda.tipo]}>
              {VENDA_TIPO_LABEL[venda.tipo]}
            </Badge>
            <VendaStatusBadge status={venda.status} />
            {isOrcamento ? (
              <Button
                size="sm"
                onClick={async () => {
                  try {
                    await converter.mutateAsync(id);
                    toast.success("Orçamento convertido em venda.");
                  } catch (err) {
                    toast.error(
                      err instanceof Error
                        ? err.message
                        : "Falha na conversão.",
                    );
                  }
                }}
                disabled={converter.isPending}
              >
                <Check size={14} strokeWidth={1.8} />
                {converter.isPending ? "Convertendo…" : "Fechar venda"}
              </Button>
            ) : null}
            <Button variant="secondary" size="sm" asChild>
              <Link href={`/vendas/${id}/editar`}>
                <Pencil size={14} strokeWidth={1.8} />
                Editar
              </Link>
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="detalhes">
        <TabsList>
          <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
          <TabsTrigger value="produto">Produto</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="detalhes">
          <Card className="p-lg">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-md">
              {[
                ["Cliente", venda.cliente?.nome ?? "—"],
                ["Telefone", venda.cliente?.telefone ?? "—"],
                ["Vendedor", venda.vendedor?.nome ?? "—"],
                ["Tipo", VENDA_TIPO_LABEL[venda.tipo]],
                ["Valor total", formatCurrency(Number(venda.valor_total))],
                ["Desconto", formatCurrency(Number(venda.desconto))],
                ["Forma de pagamento", venda.forma_pagamento ?? "—"],
                ["Parcelas", String(venda.parcelas)],
                [
                  "Comissão",
                  isOrcamento
                    ? "—"
                    : formatCurrency(Number(venda.comissao_valor ?? 0)),
                ],
                ["Data do cadastro", formatDate(venda.data_venda)],
                ["Entrega prevista", formatDate(venda.data_prevista_entrega)],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-col gap-xxs">
                  <dt className="text-label-caps text-text-3">{k}</dt>
                  <dd className="text-body-md text-text-1">{v}</dd>
                </div>
              ))}
            </dl>
            {venda.observacoes ? (
              <div className="mt-md pt-md border-t border-border-thin">
                <span className="text-label-caps text-text-3">Observações</span>
                <p className="text-body-md text-text-1 mt-xs whitespace-pre-wrap">
                  {venda.observacoes}
                </p>
              </div>
            ) : null}
          </Card>
        </TabsContent>

        <TabsContent value="produto">
          <div className="flex flex-col gap-md">
            {(venda.itens ?? []).map((item) => (
              <Card key={item.id} className="p-lg flex flex-col gap-md">
                <div className="flex items-start justify-between gap-md flex-wrap">
                  <div className="flex flex-col gap-xs flex-1 min-w-0">
                    <span className="text-label-caps text-text-3">Descrição</span>
                    <span className="text-body-md text-text-1">
                      {item.produto_descricao ?? "—"}
                    </span>
                  </div>
                  <div className="flex gap-md">
                    <div className="flex flex-col gap-xs">
                      <span className="text-label-caps text-text-3">Qtd.</span>
                      <span className="text-h4 tabular-nums text-text-1">
                        {item.quantidade}
                      </span>
                    </div>
                    <div className="flex flex-col gap-xs">
                      <span className="text-label-caps text-text-3">
                        Valor unit.
                      </span>
                      <span className="text-h4 tabular-nums text-text-1">
                        {formatCurrency(Number(item.valor_unitario))}
                      </span>
                    </div>
                  </div>
                </div>
                {item.observacoes ? (
                  <div className="flex flex-col gap-xs">
                    <span className="text-label-caps text-text-3">
                      Observações
                    </span>
                    <p className="text-body-md text-text-1 whitespace-pre-wrap">
                      {typeof item.observacoes === "string"
                        ? item.observacoes
                        : JSON.stringify(item.observacoes)}
                    </p>
                  </div>
                ) : null}
                {(item.foto_modelo_url || item.foto_tecido_url) && (
                  <div className="grid grid-cols-2 gap-md">
                    {item.foto_modelo_url && (
                      <div className="flex flex-col gap-xs">
                        <span className="text-label-caps text-text-3">
                          Foto do modelo
                        </span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.foto_modelo_url}
                          alt="Modelo"
                          className="w-full aspect-[4/3] object-cover border border-border-thin"
                        />
                      </div>
                    )}
                    {item.foto_tecido_url && (
                      <div className="flex flex-col gap-xs">
                        <span className="text-label-caps text-text-3">
                          Foto do tecido
                        </span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.foto_tecido_url}
                          alt="Tecido"
                          className="w-full aspect-[4/3] object-cover border border-border-thin"
                        />
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
            {(venda.itens?.length ?? 0) === 0 ? (
              <Card className="p-lg">
                <p className="text-body-md text-text-3">
                  Nenhum item nesta venda.
                </p>
              </Card>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="audit">
          <Card className="p-lg">
            <p className="text-body-md text-text-3">
              Histórico em <code className="text-text-1">audit_logs</code>.
              Toda mudança crítica nesta venda fica registrada lá com
              identificação de usuário e timestamp.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
