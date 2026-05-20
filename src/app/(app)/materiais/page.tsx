"use client";

import { Hero } from "@/components/sections/Hero";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/badge";
import { mockMateriais } from "@/lib/mocks";
import { formatCurrency } from "@/lib/utils";

type Material = (typeof mockMateriais)[number];

export default function MateriaisPage() {
  const columns: DataTableColumn<Material>[] = [
    {
      key: "nome",
      label: "Material",
      render: (m) => m.nome,
      csv: (m) => m.nome,
    },
    {
      key: "fornecedor",
      label: "Fornecedor",
      render: (m) => <span className="text-text-3">{m.fornecedor}</span>,
      csv: (m) => m.fornecedor,
      hideOnMobile: true,
    },
    {
      key: "estoque_atual",
      label: "Estoque",
      align: "right",
      render: (m) => `${m.estoque_atual} ${m.unidade}`,
      csv: (m) => `${m.estoque_atual} ${m.unidade}`,
    },
    {
      key: "custo_medio",
      label: "Custo médio",
      align: "right",
      render: (m) => formatCurrency(m.custo_medio),
      csv: (m) => formatCurrency(m.custo_medio),
      hideOnMobile: true,
    },
    {
      key: "status",
      label: "Status",
      render: (m) =>
        m.estoque_atual <= m.estoque_minimo ? (
          <Badge tone="error">Crítico</Badge>
        ) : (
          <Badge tone="success">Ok</Badge>
        ),
      csv: (m) =>
        m.estoque_atual <= m.estoque_minimo ? "Crítico" : "Ok",
    },
  ];

  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Insumos"
        titulo="Materiais"
        descricao="Matérias-primas, fornecedores e custo médio."
      />
      <DataTable
        columns={columns}
        data={mockMateriais}
        rowKey={(m) => m.id}
        exportName="materiais"
        onRowClick={(m) => {
          window.location.href = `/materiais/${m.id}`;
        }}
      />
    </div>
  );
}
