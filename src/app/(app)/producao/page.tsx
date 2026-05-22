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
import { Hammer, Image as ImageIcon } from "lucide-react";
import type { ProducaoStatus } from "@/types/database.types";

interface CardItem {
  id: string;
  status: ProducaoStatus;
  vendaNumero: number;
  produto: string;
  responsavel: string;
  prazo: string | null;
  fotoModelo: string | null;
  fotoTecido: string | null;
}

export default function ProducaoPage() {
  const producoes = useProducoes();
  const mover = useMoverProducao();

  const items: CardItem[] = (producoes.data ?? []).map((p) => ({
    id: p.id,
    status: p.status,
    vendaNumero: p.venda?.numero ?? 0,
    produto: p.produto_descricao ?? "Produto sem descrição",
    responsavel: p.responsavel?.nome ?? "Sem responsável",
    prazo: p.data_fim_prevista,
    fotoModelo: p.foto_modelo_url,
    fotoTecido: p.foto_tecido_url,
  }));

  const columns: KanbanColumn<ProducaoStatus>[] = PRODUCAO_KANBAN_COLUMNS;

  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Fábrica"
        titulo="Produção"
        descricao="Quadro arrastável. Esta tela exibe apenas dados do produto, sem informações pessoais."
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
                  Ref. #{item.vendaNumero}
                </span>
                <Badge tone="muted">{item.responsavel}</Badge>
              </div>
              <span className="text-body-md text-text-1 line-clamp-3">
                {item.produto}
              </span>
              {(item.fotoModelo || item.fotoTecido) && (
                <div className="grid grid-cols-2 gap-xs">
                  {item.fotoModelo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.fotoModelo}
                      alt="Modelo"
                      className="w-full aspect-square object-cover border border-border-thin"
                    />
                  )}
                  {item.fotoTecido && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.fotoTecido}
                      alt="Tecido"
                      className="w-full aspect-square object-cover border border-border-thin"
                    />
                  )}
                  {!item.fotoModelo || !item.fotoTecido ? (
                    <div className="w-full aspect-square border border-dashed border-border-thin flex items-center justify-center text-text-4">
                      <ImageIcon size={16} strokeWidth={1.4} />
                    </div>
                  ) : null}
                </div>
              )}
              {item.prazo ? (
                <span className="text-caption text-text-4">
                  Prazo {formatDate(item.prazo)}
                </span>
              ) : null}
            </>
          )}
        />
      )}
    </div>
  );
}
