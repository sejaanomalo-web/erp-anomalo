"use client";

import { Hero } from "@/components/sections/Hero";
import { FinanceiroNav } from "@/components/financeiro/FinanceiroNav";
import { Card } from "@/components/ui/card";
import { BotoesExportarRelatorio } from "@/components/financeiro/BotoesExportarRelatorio";
import { useDRE, useFluxoCaixaAnual, type LinhaDRE } from "@/lib/queries/financeiro";
import { usePeriodo } from "@/hooks/usePeriodo";
import { MESES } from "@/lib/periodo";
import { cn, formatCurrency } from "@/lib/utils";

export default function FinanceiroRelatoriosPage() {
  const { periodo } = usePeriodo();
  const dre = useDRE(periodo.de, periodo.ate);
  const fluxo = useFluxoCaixaAnual(periodo.ano);
  const d = dre.data;
  const meses = fluxo.data ?? [];

  const prevIdx = [periodo.mes - 2, periodo.mes - 3, periodo.mes - 4].filter((i) => i >= 0);
  const avg = (key: "receitas" | "despesas") =>
    prevIdx.length
      ? prevIdx.reduce((s, i) => s + (meses[i]?.[key] ?? 0), 0) / prevIdx.length
      : 0;
  const projReceita = avg("receitas");
  const projDespesa = avg("despesas");
  const proxMeses = [1, 2, 3].map((k) => {
    const idx = (periodo.mes - 1 + k) % 12;
    return {
      nome: MESES[idx],
      receita: projReceita,
      despesa: projDespesa,
      resultado: projReceita - projDespesa,
    };
  });

  const blocoDRE = (
    titulo: string,
    linhas: LinhaDRE[],
    total: number,
    corTotal: "text-success" | "text-error",
  ) => (
    <Card className="p-lg flex flex-col gap-md">
      <div className="flex items-center justify-between">
        <h3 className="text-h4 text-text-1">{titulo}</h3>
        <span className={cn("text-h3 tabular-nums", corTotal)}>{formatCurrency(total)}</span>
      </div>
      {linhas.length ? (
        linhas.map((l) => {
          const pct = total > 0 ? (l.total / total) * 100 : 0;
          return (
            <div
              key={l.categoria_id}
              className="flex items-center justify-between border-b border-border-thin py-2"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: l.cor ?? undefined }}
                />
                <div>
                  <p className="text-body-md text-text-1">{l.categoria_nome}</p>
                  <p className="text-caption text-text-3">
                    {l.qtd} lançamentos · {pct.toFixed(1)}%
                  </p>
                </div>
              </div>
              <span className="text-body-md tabular-nums text-text-1">
                {formatCurrency(l.total)}
              </span>
            </div>
          );
        })
      ) : (
        <p className="text-body-sm text-text-3">Nenhum lançamento.</p>
      )}
    </Card>
  );

  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Financeiro · Relatórios"
        titulo={`DRE e projeção · ${periodo.rotulo}`}
        acoes={<BotoesExportarRelatorio dre={d} fluxo={meses} rotulo={periodo.rotulo} />}
      />

      <FinanceiroNav />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        {blocoDRE("Receitas", d?.receitas ?? [], d?.total_receitas ?? 0, "text-success")}
        {blocoDRE("Despesas", d?.despesas ?? [], d?.total_despesas ?? 0, "text-error")}
      </div>

      <Card className="p-lg flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-label-caps text-text-3">Resultado do mês</span>
          <span className="text-body-sm text-text-3">Receitas − Despesas</span>
        </div>
        <span
          className={cn(
            "text-display tabular-nums",
            (d?.resultado ?? 0) >= 0 ? "text-success" : "text-error",
          )}
        >
          {formatCurrency(d?.resultado ?? 0)}
        </span>
      </Card>

      <Card className="p-lg flex flex-col gap-md">
        <h3 className="text-h4 text-text-1">Projeção · próximos 3 meses</h3>
        <p className="text-body-sm text-text-3">
          Média móvel dos 3 meses anteriores. Tendência simples, não considera recorrentes
          futuros nem sazonalidade.
        </p>
        <table className="w-full text-body-sm">
          <thead>
            <tr>
              <th className="text-label-caps text-text-3 text-left">Mês</th>
              <th className="text-label-caps text-text-3 text-right">Receita projetada</th>
              <th className="text-label-caps text-text-3 text-right">Despesa projetada</th>
              <th className="text-label-caps text-text-3 text-right">Resultado</th>
            </tr>
          </thead>
          <tbody>
            {proxMeses.map((m) => (
              <tr key={m.nome} className="border-b border-border-thin">
                <td className="py-2 text-text-1">{m.nome}</td>
                <td className="py-2 text-right tabular-nums text-text-1">
                  {formatCurrency(m.receita)}
                </td>
                <td className="py-2 text-right tabular-nums text-text-1">
                  {formatCurrency(m.despesa)}
                </td>
                <td className="py-2 text-right tabular-nums">
                  <span className={m.resultado >= 0 ? "text-text-1" : "text-error"}>
                    {formatCurrency(m.resultado)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="p-lg flex flex-col gap-md">
        <h3 className="text-h4 text-text-1">Histórico {periodo.ano}</h3>
        <table className="w-full text-body-sm">
          <thead>
            <tr>
              <th className="text-label-caps text-text-3 text-left">Mês</th>
              <th className="text-label-caps text-text-3 text-right">Receitas</th>
              <th className="text-label-caps text-text-3 text-right">Despesas</th>
              <th className="text-label-caps text-text-3 text-right">Resultado</th>
            </tr>
          </thead>
          <tbody>
            {meses.map((m, i) => (
              <tr
                key={i}
                className={cn(
                  "border-b border-border-thin",
                  i + 1 === periodo.mes && "bg-surface-2",
                )}
              >
                <td className="py-2 text-text-1">{MESES[i]}</td>
                <td className="py-2 text-right tabular-nums text-text-1">
                  {formatCurrency(m.receitas)}
                </td>
                <td className="py-2 text-right tabular-nums text-text-1">
                  {formatCurrency(m.despesas)}
                </td>
                <td className="py-2 text-right tabular-nums">
                  <span className={m.resultado >= 0 ? "text-text-1" : "text-error"}>
                    {formatCurrency(m.resultado)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
