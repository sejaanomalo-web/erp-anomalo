import { GoldDivider } from "@/components/brand/GoldDivider";
import { Eyebrow } from "@/components/brand/Eyebrow";
import { cn } from "@/lib/utils";

interface HeroProps {
  eyebrow?: string;
  titulo: string;
  descricao?: string;
  acoes?: React.ReactNode;
  className?: string;
}

export function Hero({ eyebrow, titulo, descricao, acoes, className }: HeroProps) {
  return (
    <header className={cn("flex flex-col gap-md md:flex-row md:items-end md:justify-between", className)}>
      <div className="flex flex-col gap-sm max-w-3xl">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h1 className="text-h1 text-text-1">{titulo}</h1>
        {descricao ? (
          <p className="text-body-md text-text-3 mt-xs">{descricao}</p>
        ) : null}
        <GoldDivider className="mt-md" />
      </div>
      {acoes ? <div className="flex items-center gap-sm flex-wrap">{acoes}</div> : null}
    </header>
  );
}
