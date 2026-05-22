"use client";

import { useState } from "react";
import { Search, Users } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { Input } from "@/components/ui/input";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { EmptyState } from "@/components/feedback/EmptyState";
import { LoadingState } from "@/components/feedback/LoadingState";
import {
  PeriodoFilter,
  periodoInicial,
  type PeriodoValue,
} from "@/components/financeiro/PeriodoFilter";
import { useClientes, type ClienteRow } from "@/lib/queries/clientes";
import { useDebounce } from "@/hooks/useDebounce";
import { formatDate, maskCpfCnpj } from "@/lib/utils";

export default function ClientesPage() {
  const [busca, setBusca] = useState("");
  const [periodo, setPeriodo] = useState<PeriodoValue>(() => ({
    ...periodoInicial("ano"),
  }));
  const buscaDebounced = useDebounce(busca, 250);
  const clientes = useClientes({
    inicio: periodo.inicio,
    fim: periodo.fim,
    busca: buscaDebounced,
  });

  const columns: DataTableColumn<ClienteRow>[] = [
    { key: "nome", label: "Cliente", render: (c) => c.nome, csv: (c) => c.nome },
    {
      key: "telefone",
      label: "Telefone",
      render: (c) => c.telefone ?? "—",
      csv: (c) => c.telefone ?? "",
    },
    {
      key: "cpf_cnpj",
      label: "CPF/CNPJ",
      render: (c) => <span className="text-text-3">{maskCpfCnpj(c.cpf_cnpj)}</span>,
      csv: (c) => maskCpfCnpj(c.cpf_cnpj),
      hideOnMobile: true,
    },
    {
      key: "origem",
      label: "Origem",
      render: (c) => c.origem ?? "—",
      csv: (c) => c.origem ?? "",
      hideOnMobile: true,
    },
    {
      key: "created_at",
      label: "Cadastrado em",
      render: (c) => formatDate(c.created_at),
      csv: (c) => formatDate(c.created_at),
    },
  ];

  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Relacionamento"
        titulo="Clientes"
        descricao="Clientes são cadastrados automaticamente quando uma venda ou orçamento é registrado."
      />

      <div className="flex flex-col gap-md md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-xs flex-1 md:max-w-md">
          <label htmlFor="busca" className="text-label-caps text-text-3">
            Buscar por nome, CPF, CNPJ ou telefone
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
              placeholder="Nome, número ou documento"
              className="pl-xl"
            />
          </div>
        </div>
        <PeriodoFilter value={periodo} onChange={setPeriodo} />
      </div>

      {clientes.isLoading ? (
        <LoadingState linhas={6} />
      ) : (clientes.data?.length ?? 0) === 0 ? (
        <EmptyState
          icone={Users}
          titulo="Nenhum cliente no período."
          descricao="Clientes entram automaticamente quando você registra uma venda ou orçamento."
        />
      ) : (
        <DataTable
          columns={columns}
          data={clientes.data ?? []}
          rowKey={(c) => c.id}
          exportName="clientes"
          onRowClick={(c) => {
            window.location.href = `/crm/clientes/${c.id}`;
          }}
        />
      )}
    </div>
  );
}
