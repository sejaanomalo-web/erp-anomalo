"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, ShoppingCart, Search } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { VENDA_STATUS_LABEL } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { useVendas, type VendaListRow } from "@/lib/queries/vendas";
import type { VendaStatus } from "@/types/database.types";

export default function VendasPage() {
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState<VendaStatus | "todos">("todos");
  const buscaDebounced = useDebounce(busca, 200);
  const vendas = useVendas({ status, busca: buscaDebounced });

  const columns: DataTableColumn<VendaListRow>[] = [
    {
      key: "numero",
      label: "Nº",
      render: (v) => <span className="tabular-nums text-text-1">#{v.numero}</span>,
      csv: (v) => `#${v.numero}`,
    },
    {
      key: "cliente",
      label: "Cliente",
      render: (v) => v.cliente?.nome ?? "—",
      csv: (v) => v.cliente?.nome ?? "",
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
      label: "Data venda",
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
        descricao="Filtre por status, vendedor ou cliente."
        acoes={
          <Button asChild>
            <Link href="/vendas/nova">
              <Plus size={14} strokeWidth={1.8} />
              Nova venda
            </Link>
          </Button>
        }
      />

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
        <Card error={vendas.error} />
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

function Card({ error }: { error: Error }) {
  return (
    <div className="solid-surface p-lg flex flex-col gap-xs">
      <span className="text-label-caps text-error">Erro</span>
      <p className="text-body-md text-text-1">{error.message}</p>
    </div>
  );
}
