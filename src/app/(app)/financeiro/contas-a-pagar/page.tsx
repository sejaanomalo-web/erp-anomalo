"use client";

import { Hero } from "@/components/sections/Hero";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { FinanceiroStatusBadge } from "@/components/tables/StatusBadge";
import { Button } from "@/components/ui/button";
import { mockContasAPagar } from "@/lib/mocks";
import { formatCurrency, formatDate } from "@/lib/utils";
import { FINANCEIRO_STATUS_LABEL } from "@/lib/constants";

type Conta = (typeof mockContasAPagar)[number];

export default function ContasAPagarPage() {
  const columns: DataTableColumn<Conta>[] = [
    {
      key: "descricao",
      label: "Descrição",
      render: (c) => c.descricao,
      csv: (c) => c.descricao,
    },
    {
      key: "vencimento",
      label: "Vencimento",
      render: (c) => formatDate(c.vencimento),
      csv: (c) => formatDate(c.vencimento),
    },
    {
      key: "valor",
      label: "Valor",
      align: "right",
      render: (c) => formatCurrency(c.valor),
      csv: (c) => formatCurrency(c.valor),
    },
    {
      key: "status",
      label: "Status",
      render: (c) => <FinanceiroStatusBadge status={c.status} />,
      csv: (c) => FINANCEIRO_STATUS_LABEL[c.status],
    },
    {
      key: "acoes",
      label: "Ações",
      render: () => (
        <Button variant="ghost" size="sm">
          Marcar como pago
        </Button>
      ),
      hideOnMobile: true,
    },
  ];

  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Financeiro"
        titulo="Contas a pagar"
        descricao="Vencimentos próximos e atrasados."
      />
      <DataTable
        columns={columns}
        data={mockContasAPagar}
        rowKey={(c) => c.id}
        exportName="contas-a-pagar"
      />
    </div>
  );
}
