"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Wallet, TrendingUp, TrendingDown, Scale } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { KPICard } from "@/components/sections/KPICard";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { mockFinanceiroSerie } from "@/lib/mocks";

export default function FinanceiroPage() {
  const totalEntradas = mockFinanceiroSerie.reduce((acc, m) => acc + m.entradas, 0);
  const totalSaidas = mockFinanceiroSerie.reduce((acc, m) => acc + m.saidas, 0);

  return (
    <div className="flex flex-col gap-3xl">
      <Hero
        eyebrow="Visão geral"
        titulo="Financeiro"
        descricao="Saldo, fluxo de caixa e comparativo mês a mês."
      />
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-md">
        <KPICard
          label="Saldo consolidado"
          valor={totalEntradas - totalSaidas}
          formato="moeda"
          icone={<Scale size={16} strokeWidth={1.8} />}
        />
        <KPICard
          label="Receitas (12m)"
          valor={totalEntradas}
          formato="moeda"
          icone={<TrendingUp size={16} strokeWidth={1.8} />}
        />
        <KPICard
          label="Despesas (12m)"
          valor={totalSaidas}
          formato="moeda"
          icone={<TrendingDown size={16} strokeWidth={1.8} />}
        />
        <KPICard
          label="Margem"
          valor={((totalEntradas - totalSaidas) / totalEntradas) * 100}
          formato="percentual"
          icone={<Wallet size={16} strokeWidth={1.8} />}
        />
      </section>
      <Card className="p-lg flex flex-col gap-md">
        <span className="text-label-caps text-text-3">Fluxo de caixa</span>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockFinanceiroSerie}>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" strokeDasharray="2 4" />
              <XAxis dataKey="mes" stroke="var(--text-3)" fontSize={11} axisLine={false} tickLine={false} />
              <YAxis
                stroke="var(--text-3)"
                fontSize={11}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  new Intl.NumberFormat("pt-BR", {
                    notation: "compact",
                  }).format(v as number)
                }
              />
              <Tooltip
                contentStyle={{
                  background: "var(--surface-3)",
                  border: "1px solid var(--border-thin)",
                  borderRadius: 0,
                  fontSize: 12,
                }}
                labelStyle={{ color: "var(--text-3)" }}
                formatter={(v) => formatCurrency(Number(v))}
              />
              <Bar dataKey="entradas" fill="var(--accent)" radius={0} />
              <Bar dataKey="saidas" fill="rgba(239,68,68,0.6)" radius={0} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
