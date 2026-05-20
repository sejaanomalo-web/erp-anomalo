"use client";

import { Hero } from "@/components/sections/Hero";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { mockVendedores } from "@/lib/mocks";
import { formatCurrency, formatPercent } from "@/lib/utils";

type Vendedor = (typeof mockVendedores)[number];

export default function VendedoresPage() {
  const columns: DataTableColumn<Vendedor>[] = [
    { key: "nome", label: "Vendedor", render: (v) => v.nome, csv: (v) => v.nome },
    {
      key: "vendasMes",
      label: "Vendas no mês",
      align: "right",
      render: (v) => v.vendasMes,
      csv: (v) => String(v.vendasMes),
    },
    {
      key: "ticketMedio",
      label: "Ticket médio",
      align: "right",
      render: (v) => formatCurrency(v.ticketMedio),
      csv: (v) => formatCurrency(v.ticketMedio),
      hideOnMobile: true,
    },
    {
      key: "comissaoMes",
      label: "Comissão",
      align: "right",
      render: (v) => formatCurrency(v.comissaoMes),
      csv: (v) => formatCurrency(v.comissaoMes),
    },
    {
      key: "conversao",
      label: "Conversão",
      align: "right",
      render: (v) => formatPercent(v.conversao),
      csv: (v) => formatPercent(v.conversao),
      hideOnMobile: true,
    },
  ];

  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Time"
        titulo="Vendedores"
        descricao="Performance do mês corrente."
      />
      <DataTable
        columns={columns}
        data={mockVendedores}
        rowKey={(v) => v.id}
        exportName="vendedores"
        onRowClick={(v) => {
          window.location.href = `/vendedores/${v.id}`;
        }}
      />
    </div>
  );
}
