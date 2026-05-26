import { Eyebrow } from "@/components/brand/Eyebrow";
import { cn } from "@/lib/utils";

interface HeroProps {
  eyebrow?: string;
  titulo: string;
  descricao?: string;
  acoes?: React.ReactNode;
  className?: string;
}

// Gmail-style page header: título em sentence case (não uppercase), Roboto 500,
// descrição em body-md cinza M3, ações alinhadas à direita. Sem divisor decorativo.
export function Hero({
  eyebrow,
  titulo,
  descricao,
  acoes,
  className,
}: HeroProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-md md:flex-row md:items-start md:justify-between",
        className,
      )}
    >
      <div className="flex flex-col gap-1 max-w-3xl">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h1 className="text-h1 text-text-1">{titulo}</h1>
        {descricao ? (
          <p className="text-body-md text-text-3 mt-1">{descricao}</p>
        ) : null}
      </div>
      {acoes ? (
        <div className="flex items-center gap-2 flex-wrap">{acoes}</div>
      ) : null}
    </header>
  );
}
