import { cn } from "@/lib/utils";

interface DividerProps {
  className?: string;
  width?: number | "full";
}

// Gmail-style divider: hairline #DADCE0 sutil. Mantido o nome `GoldDivider`
// para evitar breaking changes nos imports; o estilo é neutro agora.
export function GoldDivider({ className, width = "full" }: DividerProps) {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={cn("h-px bg-border-thin", className)}
      style={width === "full" ? undefined : { width }}
    />
  );
}
