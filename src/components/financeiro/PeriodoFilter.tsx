"use client";

import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  format,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type PeriodoPreset = "semana" | "mes" | "ano" | "custom";

export interface PeriodoValue {
  preset: PeriodoPreset;
  inicio: string;
  fim: string;
}

export function periodoInicial(preset: PeriodoPreset = "mes"): PeriodoValue {
  const now = new Date();
  if (preset === "semana") {
    return {
      preset,
      inicio: format(startOfWeek(now, { locale: ptBR }), "yyyy-MM-dd"),
      fim: format(endOfWeek(now, { locale: ptBR }), "yyyy-MM-dd"),
    };
  }
  if (preset === "ano") {
    return {
      preset,
      inicio: format(startOfYear(now), "yyyy-MM-dd"),
      fim: format(endOfYear(now), "yyyy-MM-dd"),
    };
  }
  return {
    preset: "mes",
    inicio: format(startOfMonth(now), "yyyy-MM-dd"),
    fim: format(endOfMonth(now), "yyyy-MM-dd"),
  };
}

interface PeriodoFilterProps {
  value: PeriodoValue;
  onChange: (next: PeriodoValue) => void;
  className?: string;
}

const PRESETS: { id: PeriodoPreset; label: string }[] = [
  { id: "semana", label: "Semana" },
  { id: "mes", label: "Mês" },
  { id: "ano", label: "Ano" },
  { id: "custom", label: "Período" },
];

export function PeriodoFilter({ value, onChange, className }: PeriodoFilterProps) {
  function handlePreset(p: PeriodoPreset) {
    if (p === "custom") {
      onChange({ ...value, preset: "custom" });
      return;
    }
    onChange(periodoInicial(p));
  }

  return (
    <div className={cn("flex flex-col md:flex-row gap-md md:items-end", className)}>
      <div className="flex items-center gap-xs flex-wrap">
        {PRESETS.map((p) => (
          <Button
            key={p.id}
            size="sm"
            variant={value.preset === p.id ? "default" : "secondary"}
            onClick={() => handlePreset(p.id)}
          >
            {p.label}
          </Button>
        ))}
      </div>
      <div className="flex items-end gap-sm">
        <div className="flex flex-col gap-xs">
          <Label htmlFor="periodo_inicio">De</Label>
          <Input
            id="periodo_inicio"
            type="date"
            value={value.inicio}
            onChange={(e) =>
              onChange({ ...value, preset: "custom", inicio: e.target.value })
            }
            className="w-[160px]"
          />
        </div>
        <div className="flex flex-col gap-xs">
          <Label htmlFor="periodo_fim">Até</Label>
          <Input
            id="periodo_fim"
            type="date"
            value={value.fim}
            onChange={(e) =>
              onChange({ ...value, preset: "custom", fim: e.target.value })
            }
            className="w-[160px]"
          />
        </div>
      </div>
    </div>
  );
}
