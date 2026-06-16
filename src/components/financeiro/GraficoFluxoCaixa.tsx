"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { FluxoMes } from "@/lib/queries/financeiro";
import { formatCurrency } from "@/lib/utils";

const MESES_CURTOS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

function fmtK(v: number): string {
  if (Math.abs(v) >= 1000) return `${Math.round(v / 1000)}k`;
  return String(Math.round(v));
}

// Fluxo de caixa anual: barras de receitas (verde) e despesas (vermelho)
// + linha de resultado (ouro). Só lançamentos realizados entram.
export function GraficoFluxoCaixa({ dados }: { dados: FluxoMes[] }) {
  const data = dados.map((m) => ({
    mes: MESES_CURTOS[m.mesNum - 1],
    Receitas: m.receitas,
    Despesas: m.despesas,
    Resultado: m.resultado,
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid
          vertical={false}
          stroke="var(--divider)"
          strokeDasharray="2 4"
        />
        <XAxis
          dataKey="mes"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "var(--text-3)", fontSize: 11 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          width={48}
          tick={{ fill: "var(--text-3)", fontSize: 11 }}
          tickFormatter={fmtK}
        />
        <Tooltip
          cursor={{ fill: "rgba(var(--accent-rgb),0.08)" }}
          contentStyle={{
            background: "var(--surface-2)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 10,
            color: "var(--text-1)",
            fontSize: 12,
          }}
          formatter={(value: number, name: string) => [formatCurrency(value), name]}
        />
        <Bar dataKey="Receitas" fill="#16a34a" radius={[3, 3, 0, 0]} maxBarSize={26} />
        <Bar dataKey="Despesas" fill="#ef4444" radius={[3, 3, 0, 0]} maxBarSize={26} />
        <Line
          type="monotone"
          dataKey="Resultado"
          stroke="var(--accent)"
          strokeWidth={2}
          dot={{ r: 3, fill: "var(--accent)", stroke: "var(--surface-1)" }}
          activeDot={{ r: 5 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
