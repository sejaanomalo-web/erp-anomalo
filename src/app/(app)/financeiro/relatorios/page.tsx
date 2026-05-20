"use client";

import Link from "next/link";
import { ArrowRight, FileBarChart } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/card";

const RELATORIOS = [
  { id: "dre", titulo: "DRE simplificado", descricao: "Receitas, despesas e resultado por período." },
  { id: "fluxo", titulo: "Fluxo de caixa", descricao: "Entradas e saídas diárias com saldo acumulado." },
  { id: "comparativo", titulo: "Comparativo de período", descricao: "Compare dois recortes lado a lado." },
  { id: "comissoes", titulo: "Comissões a pagar", descricao: "Por vendedor, com status." },
];

export default function FinanceiroRelatoriosPage() {
  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Financeiro"
        titulo="Relatórios"
        descricao="Modelos prontos com filtros e exportação CSV."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        {RELATORIOS.map((r) => (
          <Link key={r.id} href="/relatorios">
            <Card hover className="p-lg flex flex-col gap-sm">
              <div className="flex items-center gap-sm">
                <FileBarChart size={16} strokeWidth={1.8} className="text-text-3" />
                <span className="text-label-caps text-text-3">Modelo</span>
              </div>
              <span className="text-h3 text-text-1">{r.titulo}</span>
              <span className="text-body-sm text-text-3">{r.descricao}</span>
              <span className="text-body-sm text-accent inline-flex items-center gap-xs mt-md">
                Abrir
                <ArrowRight size={14} strokeWidth={1.8} />
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
