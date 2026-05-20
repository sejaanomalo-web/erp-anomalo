"use client";

import { useState } from "react";
import { Hero } from "@/components/sections/Hero";
import {
  KanbanBoard,
  type KanbanColumn,
  type KanbanItem,
} from "@/components/kanban/KanbanBoard";
import { mockLeads } from "@/lib/mocks";
import { LEAD_KANBAN_COLUMNS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "@/components/feedback/Toast";
import type { LeadStatus } from "@/types/database.types";

interface LeadCard extends KanbanItem<LeadStatus> {
  nome: string;
  valor_estimado: number;
  vendedor: string;
  proximo_contato: string;
}

export default function LeadsPage() {
  const [items, setItems] = useState<LeadCard[]>(
    mockLeads.map((l) => ({
      id: l.id,
      status: l.status,
      nome: l.nome,
      valor_estimado: l.valor_estimado,
      vendedor: l.vendedor,
      proximo_contato: l.proximo_contato,
    })),
  );
  const columns: KanbanColumn<LeadStatus>[] = LEAD_KANBAN_COLUMNS;

  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Relacionamento"
        titulo="Leads"
        descricao="Pipeline arrastável."
      />
      <KanbanBoard
        columns={columns}
        items={items}
        onItemMove={async (id, status) => {
          setItems((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
          toast.success("Status do lead atualizado.");
        }}
        renderCard={(item) => (
          <>
            <span className="text-body-md text-text-1">{item.nome}</span>
            <span className="text-body-sm text-text-3 tabular-nums">
              {formatCurrency(item.valor_estimado)}
            </span>
            <span className="text-caption text-text-4">
              {item.vendedor} · próximo contato {formatDate(item.proximo_contato)}
            </span>
          </>
        )}
      />
    </div>
  );
}
