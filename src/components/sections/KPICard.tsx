import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn, formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

interface KPICardProps {
  label: string;
  valor: number | string;
  formato?: "moeda" | "numero" | "percentual" | "texto";
  delta?: {
    valor: number;
    periodo: string;
  };
  meta?: {
    valor: number;
    atingido: number;
  };
  icone?: React.ReactNode;
  className?: string;
}

function formatar(valor: number | string, formato: KPICardProps["formato"]) {
  if (typeof valor === "string") return valor;
  switch (formato) {
    case "moeda":
      return formatCurrency(valor);
    case "percentual":
      return formatPercent(valor);
    case "numero":
      return formatNumber(valor);
    default:
      return String(valor);
  }
}

export function KPICard({
  label,
  valor,
  formato = "numero",
  delta,
  meta,
  icone,
  className,
}: KPICardProps) {
  const deltaPositive = delta && delta.valor >= 0;
  return (
    <Card hover className={cn("p-lg flex flex-col gap-md", className)}>
      <div className="flex items-start justify-between gap-md">
        <span className="text-label-caps text-text-3">{label}</span>
        {icone ? (
          <span className="text-text-3" aria-hidden>
            {icone}
          </span>
        ) : null}
      </div>
      <div className="flex flex-col gap-xs">
        <span className="text-display tabular-nums text-text-1">
          {formatar(valor, formato)}
        </span>
        {delta ? (
          <div className="flex items-center gap-xs text-body-sm">
            {deltaPositive ? (
              <ArrowUpRight size={14} strokeWidth={2} className="text-success" />
            ) : (
              <ArrowDownRight size={14} strokeWidth={2} className="text-error" />
            )}
            <span className={deltaPositive ? "text-success" : "text-error"}>
              {formatPercent(Math.abs(delta.valor))}
            </span>
            <span className="text-text-4">vs. {delta.periodo}</span>
          </div>
        ) : null}
      </div>
      {meta ? (
        <div className="flex flex-col gap-xs mt-auto">
          <Progress
            value={Math.min(100, (meta.atingido / meta.valor) * 100)}
          />
          <div className="flex items-center justify-between text-body-sm">
            <span className="text-text-4">Meta</span>
            <span className="text-accent font-semibold tabular-nums">
              {formato === "moeda"
                ? formatCurrency(meta.valor)
                : formatNumber(meta.valor)}
            </span>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
