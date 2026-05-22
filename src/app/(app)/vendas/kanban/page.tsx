"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Hammer } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import {
  KanbanBoard,
  type KanbanColumn,
} from "@/components/kanban/KanbanBoard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  KANBAN_VENDAS_COLUMNS,
  kanbanVendaColuna,
  VENDA_TIPO_LABEL,
  VENDA_TIPO_TONE,
} from "@/lib/constants";
import {
  useMoverKanbanVenda,
  useVendas,
} from "@/lib/queries/vendas";
import type {
  KanbanVendaColuna,
  VendaStatus,
  VendaTipo,
} from "@/types/database.types";
import { toast } from "@/components/feedback/Toast";

interface CardItem {
  id: string;
  status: KanbanVendaColuna;
  numero: number;
  cliente: string;
  valor: number;
  tipo: VendaTipo;
  vendaStatus: VendaStatus;
  data: string;
}

const TRANSICAO: Record<
  KanbanVendaColuna,
  { tipo: VendaTipo; status: VendaStatus }
> = {
  orcamento: { tipo: "orcamento", status: "aguardando_producao" },
  fechado: { tipo: "venda", status: "aguardando_producao" },
  entregue: { tipo: "venda", status: "entregue" },
  assistencia: { tipo: "venda", status: "assistencia" },
};

export default function VendasKanbanPage() {
  const vendas = useVendas();
  const mover = useMoverKanbanVenda();

  const items: CardItem[] = useMemo(
    () =>
      (vendas.data ?? []).map((v) => ({
        id: v.id,
        status: kanbanVendaColuna(v.tipo, v.status),
        numero: v.numero,
        cliente: v.cliente?.nome ?? "—",
        valor: Number(v.valor_total),
        tipo: v.tipo,
        vendaStatus: v.status,
        data: v.data_prevista_entrega,
      })),
    [vendas.data],
  );

  const columns: KanbanColumn<KanbanVendaColuna>[] = KANBAN_VENDAS_COLUMNS;

  return (
    <div className="flex flex-col gap-2xl">
      <Link
        href="/vendas"
        className="inline-flex items-center gap-xs text-body-sm text-text-3 hover:text-accent self-start"
      >
        <ArrowLeft size={14} strokeWidth={1.8} />
        Voltar para a lista
      </Link>

      <Hero
        eyebrow="Operação"
        titulo="Kanban de vendas"
        descricao="Orçamento, fechado, entregue e assistência. Arraste para mover."
      />

      {vendas.isLoading ? (
        <LoadingState linhas={4} />
      ) : items.length === 0 ? (
        <EmptyState
          icone={Hammer}
          titulo="Quadro vazio."
          descricao="Quando registrar a primeira venda ou orçamento, ela aparece aqui."
        />
      ) : (
        <KanbanBoard
          columns={columns}
          items={items}
          onItemMove={async (id, coluna) => {
            const dest = TRANSICAO[coluna];
            const item = items.find((it) => it.id === id);
            if (!item) return;

            // Quando arrasta para "fechado" mantém status original se já é venda
            // (não perde o estágio de produção atual).
            const status =
              coluna === "fechado" && item.tipo === "venda"
                ? item.vendaStatus
                : dest.status;

            await mover.mutateAsync({ id, tipo: dest.tipo, status });
            toast.success(
              coluna === "orcamento"
                ? "Movido para orçamento."
                : coluna === "fechado"
                  ? "Marcado como venda fechada."
                  : coluna === "entregue"
                    ? "Marcado como entregue."
                    : "Movido para assistência.",
            );
          }}
          renderCard={(item) => (
            <>
              <div className="flex items-center justify-between gap-sm">
                <span className="text-label-caps text-text-3">
                  #{item.numero}
                </span>
                <Badge tone={VENDA_TIPO_TONE[item.tipo]}>
                  {VENDA_TIPO_LABEL[item.tipo]}
                </Badge>
              </div>
              <Link
                href={`/vendas/${item.id}`}
                className="text-body-md text-text-1 hover:text-accent transition-colors duration-fast"
              >
                {item.cliente}
              </Link>
              <span className="text-body-sm tabular-nums text-text-3">
                {formatCurrency(item.valor)}
              </span>
              <span className="text-caption text-text-4">
                Entrega {formatDate(item.data)}
              </span>
            </>
          )}
        />
      )}
    </div>
  );
}
