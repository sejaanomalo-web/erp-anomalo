"use client";

import { useState } from "react";
import { Plus, TrendingDown } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { FinanceiroStatusBadge } from "@/components/tables/StatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { LoadingState } from "@/components/feedback/LoadingState";
import {
  PeriodoFilter,
  periodoInicial,
  type PeriodoValue,
} from "@/components/financeiro/PeriodoFilter";
import { LancamentoDialog } from "@/components/financeiro/LancamentoDialog";
import {
  useLancamentos,
  useMarcarPago,
  type LancamentoRow,
} from "@/lib/queries/financeiro";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "@/components/feedback/Toast";

export default function SaidasPage() {
  const [periodo, setPeriodo] = useState<PeriodoValue>(() => periodoInicial("mes"));
  const [dialog, setDialog] = useState(false);
  const { data, isLoading } = useLancamentos({
    tipo: "saida",
    inicio: periodo.inicio,
    fim: periodo.fim,
  });
  const marcarPago = useMarcarPago();

  const total = (data ?? []).reduce((acc, l) => acc + Number(l.valor), 0);

  const columns: DataTableColumn<LancamentoRow>[] = [
    { key: "descricao", label: "Descrição", render: (l) => l.descricao, csv: (l) => l.descricao },
    {
      key: "categoria",
      label: "Categoria",
      render: (l) => l.categoria?.nome ?? "—",
      csv: (l) => l.categoria?.nome ?? "",
      hideOnMobile: true,
    },
    {
      key: "data_vencimento",
      label: "Vencimento",
      render: (l) =>
        l.data_vencimento ? formatDate(l.data_vencimento) : formatDate(l.data_competencia),
      csv: (l) =>
        l.data_vencimento ? formatDate(l.data_vencimento) : formatDate(l.data_competencia),
    },
    {
      key: "forma_pagamento",
      label: "Forma",
      render: (l) => l.forma_pagamento ?? "—",
      csv: (l) => l.forma_pagamento ?? "",
      hideOnMobile: true,
    },
    {
      key: "valor",
      label: "Valor",
      align: "right",
      render: (l) => (
        <span className="tabular-nums text-text-1">
          {formatCurrency(Number(l.valor))}
        </span>
      ),
      csv: (l) => formatCurrency(Number(l.valor)),
    },
    {
      key: "status",
      label: "Status",
      render: (l) => <FinanceiroStatusBadge status={l.status} />,
      csv: (l) => l.status,
    },
    {
      key: "acoes",
      label: "",
      render: (l) =>
        l.status !== "pago" && l.status !== "cancelado" ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={async (e) => {
              e.stopPropagation();
              await marcarPago.mutateAsync(l.id);
              toast.success("Marcado como pago.");
            }}
          >
            Marcar pago
          </Button>
        ) : null,
      hideOnMobile: true,
    },
  ];

  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Financeiro"
        titulo="Despesas"
        descricao="Saídas registradas no período."
        acoes={
          <Button onClick={() => setDialog(true)}>
            <Plus size={14} strokeWidth={1.8} />
            Nova despesa
          </Button>
        }
      />

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-md">
        <PeriodoFilter value={periodo} onChange={setPeriodo} />
        <div className="text-right">
          <span className="block text-label-caps text-text-3">Total no período</span>
          <span className="block text-h2 text-error tabular-nums">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      {isLoading ? (
        <LoadingState linhas={6} />
      ) : (data?.length ?? 0) === 0 ? (
        <EmptyState
          icone={TrendingDown}
          titulo="Nenhuma despesa no período."
          descricao="Ajuste o filtro ou registre uma nova saída."
          acao={
            <Button onClick={() => setDialog(true)}>
              <Plus size={14} strokeWidth={1.8} />
              Nova despesa
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={data ?? []}
          rowKey={(l) => l.id}
          exportName="despesas"
        />
      )}

      <LancamentoDialog
        open={dialog}
        onOpenChange={setDialog}
        tipoInicial="saida"
      />
    </div>
  );
}
