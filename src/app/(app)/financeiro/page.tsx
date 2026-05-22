"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Scale,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { Hero } from "@/components/sections/Hero";
import { KPICard } from "@/components/sections/KPICard";
import { Card } from "@/components/ui/card";
import {
  PeriodoFilter,
  periodoInicial,
  type PeriodoValue,
} from "@/components/financeiro/PeriodoFilter";
import { useLancamentos } from "@/lib/queries/financeiro";
import { formatCurrency } from "@/lib/utils";

export default function FinanceiroPage() {
  const [periodo, setPeriodo] = useState<PeriodoValue>(() => periodoInicial("mes"));
  const entradas = useLancamentos({
    tipo: "entrada",
    inicio: periodo.inicio,
    fim: periodo.fim,
  });
  const saidas = useLancamentos({
    tipo: "saida",
    inicio: periodo.inicio,
    fim: periodo.fim,
  });

  const totalEntradas = (entradas.data ?? []).reduce(
    (acc, l) => acc + Number(l.valor),
    0,
  );
  const totalSaidas = (saidas.data ?? []).reduce(
    (acc, l) => acc + Number(l.valor),
    0,
  );
  const saldo = totalEntradas - totalSaidas;
  const margem = totalEntradas > 0 ? (saldo / totalEntradas) * 100 : 0;

  const serie = useMemo(() => {
    const buckets = new Map<string, { entradas: number; saidas: number }>();

    for (const l of entradas.data ?? []) {
      const key = format(new Date(l.data_competencia), "yyyy-MM-dd");
      const v = buckets.get(key) ?? { entradas: 0, saidas: 0 };
      v.entradas += Number(l.valor);
      buckets.set(key, v);
    }
    for (const l of saidas.data ?? []) {
      const key = format(new Date(l.data_competencia), "yyyy-MM-dd");
      const v = buckets.get(key) ?? { entradas: 0, saidas: 0 };
      v.saidas += Number(l.valor);
      buckets.set(key, v);
    }

    return [...buckets.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([data, valores]) => ({
        data: format(new Date(data), "dd/MM"),
        entradas: valores.entradas,
        saidas: valores.saidas,
      }));
  }, [entradas.data, saidas.data]);

  return (
    <div className="flex flex-col gap-3xl">
      <Hero
        eyebrow="Visão geral"
        titulo="Financeiro"
        descricao="Saldo, fluxo de caixa e comparativo do período."
      />

      <PeriodoFilter value={periodo} onChange={setPeriodo} />

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-md">
        <KPICard
          label="Saldo do período"
          valor={saldo}
          formato="moeda"
          icone={<Scale size={16} strokeWidth={1.8} />}
        />
        <KPICard
          label="Receitas"
          valor={totalEntradas}
          formato="moeda"
          icone={<TrendingUp size={16} strokeWidth={1.8} />}
        />
        <KPICard
          label="Despesas"
          valor={totalSaidas}
          formato="moeda"
          icone={<TrendingDown size={16} strokeWidth={1.8} />}
        />
        <KPICard
          label="Margem"
          valor={margem}
          formato="percentual"
          icone={<Wallet size={16} strokeWidth={1.8} />}
        />
      </section>

      <Card className="p-lg flex flex-col gap-md">
        <div className="flex items-end justify-between">
          <span className="text-label-caps text-text-3">Fluxo de caixa</span>
          <Link
            href="/financeiro/entradas"
            className="text-body-sm text-text-3 hover:text-accent inline-flex items-center gap-xs"
          >
            Ver receitas
            <ArrowRight size={14} strokeWidth={1.8} />
          </Link>
        </div>
        <div className="h-80 w-full">
          {serie.length === 0 ? (
            <div className="h-full flex items-center justify-center text-body-sm text-text-3">
              Sem lançamentos no período.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serie}>
                <CartesianGrid
                  vertical={false}
                  stroke="rgba(255,255,255,0.04)"
                  strokeDasharray="2 4"
                />
                <XAxis
                  dataKey="data"
                  stroke="var(--text-3)"
                  fontSize={11}
                  axisLine={false}
                  tickLine={false}
                />
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
          )}
        </div>
      </Card>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-md">
        <Card className="p-lg flex flex-col gap-md">
          <span className="text-label-caps text-text-3">Receitas</span>
          <Link
            href="/financeiro/entradas"
            className="text-body-md text-accent inline-flex items-center gap-xs"
          >
            Gerenciar
            <ArrowRight size={14} strokeWidth={1.8} />
          </Link>
        </Card>
        <Card className="p-lg flex flex-col gap-md">
          <span className="text-label-caps text-text-3">Despesas</span>
          <Link
            href="/financeiro/saidas"
            className="text-body-md text-accent inline-flex items-center gap-xs"
          >
            Gerenciar
            <ArrowRight size={14} strokeWidth={1.8} />
          </Link>
        </Card>
      </section>
    </div>
  );
}
