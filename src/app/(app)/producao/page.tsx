"use client";

import { Hero } from "@/components/sections/Hero";
import {
  KanbanBoard,
  type KanbanColumn,
} from "@/components/kanban/KanbanBoard";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { toast } from "@/components/feedback/Toast";
import { PRODUCAO_KANBAN_COLUMNS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { useMoverProducao, useProducoes } from "@/lib/queries/producoes";
import { Hammer } from "lucide-react";
import type { ProducaoStatus } from "@/types/database.types";

interface CardItem {
  id: string;
  status: ProducaoStatus;
  vendaNumero: number;
  cliente: string;
  produto: string;
  responsavel: string;
  prazo: string | null;
}

export default function ProducaoPage() {
  const producoes = useProducoes();
  const mover = useMoverProducao();

  const items: CardItem[] = (producoes.data ?? []).map((p) => ({
    id: p.id,
    status: p.status,
    vendaNumero: p.venda?.numero ?? 0,
    cliente: p.venda?.cliente?.nome ?? "—",
    produto:
      p.variante?.produto?.nome && p.variante.nome
        ? `${p.variante.produto.nome} · ${p.variante.nome}`
        : p.variante?.nome ?? "—",
    responsavel: p.responsavel?.nome ?? "Sem responsável",
    prazo: p.data_fim_prevista,
  }));

  const columns: KanbanColumn<ProducaoStatus>[] = PRODUCAO_KANBAN_COLUMNS;

  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Fábrica"
        titulo="Produção"
        descricao="Quadro arrastável. Mudar a coluna atualiza o status."
      />
      {producoes.isLoading ? (
        <LoadingState linhas={4} />
      ) : items.length === 0 ? (
        <EmptyState
          icone={Hammer}
          titulo="Quadro vazio."
          descricao="As produções aparecem aqui assim que vendas forem registradas."
        />
      ) : (
        <KanbanBoard
          columns={columns}
          items={items}
          onItemMove={async (id, status) => {
            await mover.mutateAsync({ id, status });
            toast.success("Status atualizado.");
          }}
          renderCard={(item) => (
            <>
              <div className="flex items-center justify-between gap-sm">
                <span className="text-label-caps text-text-3">
                  #{item.vendaNumero}
                </span>
                <Badge tone="muted">{item.responsavel}</Badge>
              </div>
              <span className="text-body-md text-text-1">{item.cliente}</span>
              <span className="text-body-sm text-text-3">{item.produto}</span>
              {item.prazo ? (
                <span className="text-caption text-text-4">
                  Entrega {formatDate(item.prazo)}
                </span>
              ) : null}
            </>
          )}
        />
      )}
    </div>
  );
}
