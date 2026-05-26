"use client";

import { useState } from "react";
import { Plus, TrendingUp, Pencil, Trash2 } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { FinanceiroStatusBadge } from "@/components/tables/StatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import {
  PeriodoFilter,
  periodoInicial,
  type PeriodoValue,
} from "@/components/financeiro/PeriodoFilter";
import { LancamentoDialog } from "@/components/financeiro/LancamentoDialog";
import {
  useLancamentos,
  useExcluirLancamento,
  type LancamentoRow,
} from "@/lib/queries/financeiro";
import { toast } from "@/components/feedback/Toast";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function EntradasPage() {
  const [periodo, setPeriodo] = useState<PeriodoValue>(() =>
    periodoInicial("mes"),
  );
  const [dialog, setDialog] = useState(false);
  const [editar, setEditar] = useState<LancamentoRow | null>(null);
  const [excluirAlvo, setExcluirAlvo] = useState<LancamentoRow | null>(null);
  const excluir = useExcluirLancamento();

  const { data, isLoading } = useLancamentos({
    tipo: "entrada",
    inicio: periodo.inicio,
    fim: periodo.fim,
  });

  const total = (data ?? []).reduce((acc, l) => acc + Number(l.valor), 0);

  const columns: DataTableColumn<LancamentoRow>[] = [
    {
      key: "descricao",
      label: "Descrição",
      render: (l) => l.descricao,
      csv: (l) => l.descricao,
    },
    {
      key: "origem",
      label: "Origem",
      render: (l) => l.origem ?? "—",
      csv: (l) => l.origem ?? "",
      hideOnMobile: true,
    },
    {
      key: "categoria",
      label: "Categoria",
      render: (l) => l.categoria?.nome ?? "—",
      csv: (l) => l.categoria?.nome ?? "",
      hideOnMobile: true,
    },
    {
      key: "data_competencia",
      label: "Competência",
      render: (l) => formatDate(l.data_competencia),
      csv: (l) => formatDate(l.data_competencia),
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
      render: (l) => (
        <div className="flex items-center gap-1 justify-end">
          <Button
            variant="ghost"
            size="iconSm"
            aria-label="Editar"
            onClick={(e) => {
              e.stopPropagation();
              setEditar(l);
            }}
          >
            <Pencil size={14} strokeWidth={1.8} />
          </Button>
          <Button
            variant="ghost"
            size="iconSm"
            aria-label="Excluir"
            onClick={(e) => {
              e.stopPropagation();
              setExcluirAlvo(l);
            }}
          >
            <Trash2 size={14} strokeWidth={1.8} className="text-error" />
          </Button>
        </div>
      ),
      hideOnMobile: true,
    },
  ];

  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Financeiro"
        titulo="Receitas"
        descricao="Entradas registradas no período."
        acoes={
          <Button onClick={() => setDialog(true)}>
            <Plus size={14} strokeWidth={1.8} />
            Nova receita
          </Button>
        }
      />

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-md">
        <PeriodoFilter value={periodo} onChange={setPeriodo} />
        <div className="text-right">
          <span className="block text-label-caps text-text-3">
            Total no período
          </span>
          <span className="block text-h2 text-accent tabular-nums">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      {isLoading ? (
        <LoadingState linhas={6} />
      ) : (data?.length ?? 0) === 0 ? (
        <EmptyState
          icone={TrendingUp}
          titulo="Nenhuma receita no período."
          descricao="Ajuste o filtro ou registre uma nova entrada."
          acao={
            <Button onClick={() => setDialog(true)}>
              <Plus size={14} strokeWidth={1.8} />
              Nova receita
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={data ?? []}
          rowKey={(l) => l.id}
          exportName="receitas"
        />
      )}

      <LancamentoDialog
        open={dialog}
        onOpenChange={setDialog}
        tipoInicial="entrada"
      />

      <LancamentoDialog
        open={Boolean(editar)}
        onOpenChange={(o) => !o && setEditar(null)}
        tipoInicial="entrada"
        editar={editar}
      />

      <ConfirmDialog
        open={Boolean(excluirAlvo)}
        onOpenChange={(o) => !o && setExcluirAlvo(null)}
        titulo={
          excluirAlvo ? `Excluir "${excluirAlvo.descricao}"?` : "Excluir"
        }
        descricao="Remove o lançamento. Não dá para desfazer."
        variant="destructive"
        textoConfirmar="Excluir"
        onConfirm={async () => {
          if (!excluirAlvo) return;
          try {
            await excluir.mutateAsync(excluirAlvo.id);
            toast.success("Receita excluída.");
            setExcluirAlvo(null);
          } catch (err) {
            toast.error(
              err instanceof Error ? err.message : "Falha ao excluir.",
            );
          }
        }}
      />
    </div>
  );
}
