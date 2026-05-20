"use client";

import Link from "next/link";
import { Plus, Package } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { mockEstoque } from "@/lib/mocks";

type Item = (typeof mockEstoque)[number];

export default function EstoquePage() {
  const columns: DataTableColumn<Item>[] = [
    {
      key: "produto",
      label: "Produto",
      render: (i) => (
        <div className="flex items-center gap-sm">
          <span className="h-8 w-8 bg-surface-2 inline-flex items-center justify-center">
            <Package size={14} strokeWidth={1.8} className="text-text-3" />
          </span>
          <span className="text-text-1">{i.produto}</span>
        </div>
      ),
      csv: (i) => i.produto,
    },
    {
      key: "categoria",
      label: "Categoria",
      render: (i) => <span className="text-text-3">{i.categoria}</span>,
      csv: (i) => i.categoria,
      hideOnMobile: true,
    },
    {
      key: "variantes",
      label: "Variantes",
      align: "right",
      render: (i) => i.variantes,
      csv: (i) => String(i.variantes),
      hideOnMobile: true,
    },
    {
      key: "estoque_atual",
      label: "Estoque atual",
      align: "right",
      render: (i) => i.estoque_atual,
      csv: (i) => String(i.estoque_atual),
    },
    {
      key: "estoque_minimo",
      label: "Mínimo",
      align: "right",
      render: (i) => i.estoque_minimo,
      csv: (i) => String(i.estoque_minimo),
      hideOnMobile: true,
    },
    {
      key: "status",
      label: "Status",
      render: (i) =>
        i.estoque_atual <= i.estoque_minimo ? (
          <Badge tone="error">Crítico</Badge>
        ) : (
          <Badge tone="success">Ok</Badge>
        ),
      csv: (i) =>
        i.estoque_atual <= i.estoque_minimo ? "Crítico" : "Ok",
    },
  ];

  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Almoxarifado"
        titulo="Estoque"
        descricao="Produtos acabados disponíveis para venda."
        acoes={
          <div className="flex gap-xs">
            <Button variant="secondary" asChild>
              <Link href="/estoque/nova-saida">
                <Plus size={14} strokeWidth={1.8} />
                Saída
              </Link>
            </Button>
            <Button asChild>
              <Link href="/estoque/nova-entrada">
                <Plus size={14} strokeWidth={1.8} />
                Entrada
              </Link>
            </Button>
          </div>
        }
      />
      <DataTable
        columns={columns}
        data={mockEstoque}
        rowKey={(i) => i.id}
        exportName="estoque"
        onRowClick={(i) => {
          window.location.href = `/estoque/${i.id}`;
        }}
      />
    </div>
  );
}
