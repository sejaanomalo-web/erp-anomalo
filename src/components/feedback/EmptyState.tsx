import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icone: LucideIcon;
  titulo: string;
  descricao?: string;
  acao?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icone: Icone,
  titulo,
  descricao,
  acao,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-md py-3xl px-lg text-center",
        className,
      )}
    >
      <Icone size={48} strokeWidth={1.4} className="text-text-3" aria-hidden />
      <div className="flex flex-col gap-xs max-w-md">
        <h3 className="text-h3 text-text-1">{titulo}</h3>
        {descricao ? (
          <p className="text-body-md text-text-3">{descricao}</p>
        ) : null}
      </div>
      {acao}
    </div>
  );
}
