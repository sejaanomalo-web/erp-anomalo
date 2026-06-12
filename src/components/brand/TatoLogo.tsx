import { cn } from "@/lib/utils";

interface TatoLogoProps {
  /** Altura do wordmark em px. */
  height?: number;
  className?: string;
}

// Logo TATO adaptável ao tema: glifos brancos no tema escuro (fundo marrom)
// e glifos marrom no tema claro (fundo bege). A troca é feita por CSS via
// data-theme (.tl-dark / .tl-light em globals.css), sem JS.
export function TatoLogo({ height = 20, className }: TatoLogoProps) {
  return (
    <span className={cn("tato-logo", className)} role="img" aria-label="TATO">
      <img
        src="/tato-dark.png"
        alt="TATO"
        className="tl-dark"
        style={{ height }}
      />
      <img
        src="/tato-light.png"
        alt="TATO"
        className="tl-light"
        style={{ height }}
      />
    </span>
  );
}
