"use client";

import { FileBarChart, ArrowRight } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/card";
import Link from "next/link";

const CATEGORIAS = [
  {
    id: "vendas",
    titulo: "Vendas",
    relatorios: [
      "Vendas por período",
      "Vendas por vendedor",
      "Vendas por produto",
    ],
  },
  {
    id: "financeiro",
    titulo: "Financeiro",
    relatorios: ["Fluxo de caixa", "DRE simplificado", "Comparativo de período"],
  },
  {
    id: "estoque",
    titulo: "Estoque",
    relatorios: ["Estoque crítico", "Movimentações por período"],
  },
  {
    id: "crm",
    titulo: "CRM",
    relatorios: ["Funil de conversão", "Interações por vendedor"],
  },
];

export default function RelatoriosPage() {
  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Análise"
        titulo="Relatórios"
        descricao="Modelos prontos com filtros e exportação CSV."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
        {CATEGORIAS.map((cat) => (
          <Card key={cat.id} className="p-lg flex flex-col gap-md">
            <div className="flex items-center gap-sm">
              <FileBarChart size={16} strokeWidth={1.8} className="text-text-3" />
              <span className="text-label-caps text-text-3">{cat.titulo}</span>
            </div>
            <ul className="flex flex-col gap-sm">
              {cat.relatorios.map((r) => (
                <li key={r}>
                  <Link
                    href="#"
                    className="flex items-center justify-between gap-sm text-body-md text-text-1 hover:text-accent transition-colors duration-fast"
                  >
                    {r}
                    <ArrowRight size={14} strokeWidth={1.8} className="text-text-4" />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
