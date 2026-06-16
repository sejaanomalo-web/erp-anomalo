"use client";

import { FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MESES } from "@/lib/periodo";
import type { LinhaDRE, FluxoMes } from "@/lib/queries/financeiro";

type Props = {
  dre?: {
    receitas: LinhaDRE[];
    despesas: LinhaDRE[];
    total_receitas: number;
    total_despesas: number;
    resultado: number;
  };
  fluxo?: FluxoMes[];
  rotulo: string;
};

export function BotoesExportarRelatorio({ dre, fluxo, rotulo }: Props) {
  function exportarPlanilha() {
    if (!dre) return;

    const linhas: string[] = [];

    linhas.push("DRE - RECEITAS");
    linhas.push("Categoria;Qtd;Total");
    for (const r of dre.receitas) {
      linhas.push(`${r.categoria_nome};${r.qtd};${r.total.toFixed(2)}`);
    }
    linhas.push(`TOTAL RECEITAS;;${dre.total_receitas.toFixed(2)}`);

    linhas.push("");
    linhas.push("DRE - DESPESAS");
    linhas.push("Categoria;Qtd;Total");
    for (const d of dre.despesas) {
      linhas.push(`${d.categoria_nome};${d.qtd};${d.total.toFixed(2)}`);
    }
    linhas.push(`TOTAL DESPESAS;;${dre.total_despesas.toFixed(2)}`);

    linhas.push("");
    linhas.push(`RESULTADO;;${dre.resultado.toFixed(2)}`);

    if (fluxo && fluxo.length > 0) {
      linhas.push("");
      linhas.push("HISTORICO MENSAL");
      linhas.push("Mes;Receitas;Despesas;Resultado");
      for (const m of fluxo) {
        linhas.push(
          `${MESES[m.mesNum - 1]};${m.receitas.toFixed(2)};${m.despesas.toFixed(2)};${m.resultado.toFixed(2)}`,
        );
      }
    }

    const csv = "﻿" + linhas.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financeiro-${rotulo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="no-print flex items-center gap-2">
      <Button variant="outline" onClick={exportarPlanilha}>
        <FileSpreadsheet />
        Exportar planilha
      </Button>
      <Button variant="default" onClick={() => window.print()}>
        <FileText />
        Exportar PDF
      </Button>
    </div>
  );
}
