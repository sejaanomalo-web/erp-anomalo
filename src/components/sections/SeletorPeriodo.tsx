"use client";

import { usePeriodo } from "@/hooks/usePeriodo";
import { ANOS_DISPONIVEIS, MESES, type ModoPeriodo } from "@/lib/periodo";
import { cn } from "@/lib/utils";

const MODOS: { id: ModoPeriodo; label: string }[] = [
  { id: "mes", label: "Mês" },
  { id: "dia", label: "Dia" },
  { id: "intervalo", label: "Intervalo" },
];

// Filtro de período global (Mês / Dia / Intervalo). Toggle dourado + selects
// de mês/ano (modo mês), date picker (modo dia) ou par de datas (intervalo).
// Estado na URL via usePeriodo.
export function SeletorPeriodo() {
  const { periodo, setModo, setMesAno, setDia, setIntervalo } = usePeriodo();

  return (
    <div className="flex flex-col items-start gap-2 lg:items-end">
      <div className="flex items-center gap-1">
        {MODOS.map((m) => {
          const ativo = periodo.modo === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setModo(m.id)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.04em] transition-colors duration-fast",
                ativo
                  ? "border-accent bg-accent text-black"
                  : "border-border-thin bg-transparent text-text-3 hover:border-border-medium hover:text-text-1",
              )}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {periodo.modo === "mes" ? (
        <div className="flex items-center gap-2">
          <select
            aria-label="Mês"
            className="glass-input text-body-sm"
            value={MESES[periodo.mes - 1]}
            onChange={(e) => {
              const mes = MESES.findIndex((m) => m === e.target.value) + 1;
              if (mes >= 1) setMesAno(mes, periodo.ano);
            }}
          >
            {MESES.map((m) => (
              <option key={m} value={m} className="bg-surface-3">
                {m}
              </option>
            ))}
          </select>
          <select
            aria-label="Ano"
            className="glass-input text-body-sm"
            value={periodo.ano}
            onChange={(e) => setMesAno(periodo.mes, Number(e.target.value))}
          >
            {ANOS_DISPONIVEIS.map((y) => (
              <option key={y} value={y} className="bg-surface-3">
                {y}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {periodo.modo === "dia" ? (
        <input
          type="date"
          aria-label="Dia"
          className="glass-input text-body-sm"
          value={periodo.de}
          onChange={(e) => {
            if (e.target.value) setDia(e.target.value);
          }}
        />
      ) : null}

      {periodo.modo === "intervalo" ? (
        <div className="flex items-center gap-2">
          <input
            type="date"
            aria-label="De"
            className="glass-input text-body-sm"
            value={periodo.de}
            max={periodo.ate}
            onChange={(e) => {
              if (e.target.value) setIntervalo(e.target.value, periodo.ate);
            }}
          />
          <span className="text-caption text-text-4">a</span>
          <input
            type="date"
            aria-label="Até"
            className="glass-input text-body-sm"
            value={periodo.ate}
            min={periodo.de}
            onChange={(e) => {
              if (e.target.value) setIntervalo(periodo.de, e.target.value);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
