import { Suspense } from "react";
import { Eyebrow } from "@/components/brand/Eyebrow";
import { SeletorPeriodo } from "./SeletorPeriodo";
import { cn } from "@/lib/utils";

interface HeroProps {
  eyebrow?: string;
  titulo: string;
  descricao?: string;
  /** Ações (botões) renderizadas abaixo do título, à esquerda. */
  acoes?: React.ReactNode;
  /** Substitui o filtro de período padrão por um nó custom. */
  periodo?: React.ReactNode;
  /** Mostra o filtro de período global (default true). */
  mostrarPeriodo?: boolean;
  className?: string;
}

// Cabeçalho de página em "hero-banner": fundo ouro-sobre-preto com fio
// dourado no topo. Título à esquerda, filtro de período global no canto
// superior direito, ações logo abaixo do título (igual aos prints).
export function Hero({
  eyebrow,
  titulo,
  descricao,
  acoes,
  periodo,
  mostrarPeriodo = true,
  className,
}: HeroProps) {
  const periodoNode =
    periodo ??
    (mostrarPeriodo ? (
      <Suspense fallback={null}>
        <SeletorPeriodo />
      </Suspense>
    ) : null);

  return (
    <header className={cn("hero-banner flex flex-col gap-lg", className)}>
      <div className="flex flex-col gap-md md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-1 max-w-3xl">
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          <h1 className="text-h1 text-text-1">{titulo}</h1>
          {descricao ? (
            <p className="text-body-md text-text-3 mt-1">{descricao}</p>
          ) : null}
        </div>
        {periodoNode ? (
          <div className="flex shrink-0 flex-col items-start gap-2 lg:items-end">
            {periodoNode}
          </div>
        ) : null}
      </div>
      {acoes ? (
        <div className="flex items-center gap-2 flex-wrap">{acoes}</div>
      ) : null}
    </header>
  );
}
