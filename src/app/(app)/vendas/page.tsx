"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, ShoppingCart, Search, Columns3, CalendarPlus } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { Button } from "@/components/ui/button";
import { OrcamentoDialog } from "@/components/vendas/OrcamentoDialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { VendaStatusBadge } from "@/components/tables/StatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { LoadingState } from "@/components/feedback/LoadingState";
import {
  VENDA_STATUS_LABEL,
  VENDA_TIPO_LABEL,
  VENDA_TIPO_TONE,
} from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { usePeriodo } from "@/hooks/usePeriodo";
import { useVendas, type VendaListRow } from "@/lib/queries/vendas";
import type { VendaStatus, VendaTipo } from "@/types/database.types";

export default function VendasPage() {
  const { periodo } = usePeriodo();
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState<VendaStatus | "todos">("todos");
  const [tipo, setTipo] = useState<VendaTipo | "todos">("todos");
  const [orcamentoOpen, setOrcamentoOpen] = useState(false);
  const buscaDebounced = useDebounce(busca, 200);
  const vendas = useVendas({
    status,
    tipo,
    busca: buscaDebounced,
    inicio: periodo.de,
    fim: periodo.ate,
  });

  const columns: DataTableColumn<VendaListRow>[] = [
    {
      key: "numero",
      label: "Nº",
      render: (v) => (
        <span className="tabular-nums text-text-1">#{v.numero}</span>
      ),
      csv: (v) => `#${v.numero}`,
    },
    {
      key: "tipo",
      label: "Tipo",
      render: (v) => (
        <Badge tone={VENDA_TIPO_TONE[v.tipo]}>{VENDA_TIPO_LABEL[v.tipo]}</Badge>
      ),
      csv: (v) => VENDA_TIPO_LABEL[v.tipo],
      hideOnMobile: true,
    },
    {
      key: "cliente",
      label: "Cliente",
      render: (v) => v.cliente?.nome ?? "—",
      csv: (v) => v.cliente?.nome ?? "",
    },
    {
      key: "telefone",
      label: "Telefone",
      render: (v) => v.cliente?.telefone ?? "—",
      csv: (v) => v.cliente?.telefone ?? "",
      hideOnMobile: true,
    },
    {
      key: "vendedor",
      label: "Vendedor",
      render: (v) => v.vendedor?.nome ?? "—",
      csv: (v) => v.vendedor?.nome ?? "",
      hideOnMobile: true,
    },
    {
      key: "valor",
      label: "Valor",
      align: "right",
      render: (v) => formatCurrency(Number(v.valor_total)),
      csv: (v) => formatCurrency(Number(v.valor_total)),
    },
    {
      key: "status",
      label: "Status",
      render: (v) => <VendaStatusBadge status={v.status} />,
      csv: (v) => VENDA_STATUS_LABEL[v.status],
    },
    {
      key: "data_venda",
      label: "Cadastrado em",
      render: (v) => formatDate(v.data_venda),
      csv: (v) => formatDate(v.data_venda),
      hideOnMobile: true,
    },
    {
      key: "data_prevista_entrega",
      label: "Entrega",
      render: (v) => formatDate(v.data_prevista_entrega),
      csv: (v) => formatDate(v.data_prevista_entrega),
    },
  ];

  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Operação"
        titulo="Vendas"
        descricao="Orçamentos e vendas fechadas. Filtre, busque ou abra o Kanban."
        acoes={
          <div className="flex items-center gap-sm flex-wrap">
            <Button variant="secondary" asChild>
              <Link href="/vendas/kanban">
                <Columns3 size={14} strokeWidth={1.8} />
                Kanban
              </Link>
            </Button>
            <Button asChild>
              <Link href="/vendas/nova">
                <Plus size={14} strokeWidth={1.8} />
                Nova venda
              </Link>
            </Button>
            <Button variant="secondary" onClick={() => setOrcamentoOpen(true)}>
              <CalendarPlus size={14} strokeWidth={1.8} />
              Orçamento
            </Button>
          </div>
        }
      />

      <OrcamentoDialog open={orcamentoOpen} onOpenChange={setOrcamentoOpen} />

      <div className="flex flex-col md:flex-row md:items-end gap-md">
        <div className="flex flex-col gap-xs flex-1 md:max-w-md">
          <label htmlFor="busca" className="text-label-caps text-text-3">
            Buscar
          </label>
          <div className="relative">
            <Search
              size={16}
              strokeWidth={1.8}
              className="absolute left-sm top-1/2 -translate-y-1/2 text-text-4 pointer-events-none"
            />
            <Input
              id="busca"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Número, cliente ou vendedor"
              className="pl-xl"
            />
          </div>
        </div>
        <div className="flex flex-col gap-xs">
          <label className="text-label-caps text-text-3">Tipo</label>
          <Select
            value={tipo}
            onValueChange={(v) => setTipo(v as VendaTipo | "todos")}
          >
            <SelectTrigger className="min-w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="orcamento">Orçamento</SelectItem>
              <SelectItem value="venda">Venda fechada</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-xs">
          <label className="text-label-caps text-text-3">Status</label>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as VendaStatus | "todos")}
          >
            <SelectTrigger className="min-w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {Object.entries(VENDA_STATUS_LABEL).map(([k, label]) => (
                <SelectItem key={k} value={k}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {vendas.isLoading ? (
        <LoadingState linhas={6} />
      ) : vendas.error ? (
        <ErrorBox error={vendas.error as Error} />
      ) : (vendas.data?.length ?? 0) === 0 ? (
        <EmptyState
          icone={ShoppingCart}
          titulo="Nenhuma venda ainda."
          descricao="Registre a primeira venda para começar."
          acao={
            <Button asChild>
              <Link href="/vendas/nova">
                <Plus size={14} strokeWidth={1.8} />
                Nova venda
              </Link>
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={vendas.data ?? []}
          rowKey={(v) => v.id}
          exportName="vendas"
          onRowClick={(v) => {
            window.location.href = `/vendas/${v.id}`;
          }}
        />
      )}
    </div>
  );
}

function ErrorBox({ error }: { error: Error }) {
  return (
    <div className="solid-surface p-lg flex flex-col gap-xs">
      <span className="text-label-caps text-error">Erro</span>
      <p className="text-body-md text-text-1">{error.message}</p>
    </div>
  );
}
