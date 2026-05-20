import { cn } from "@/lib/utils";

interface GoldDividerProps {
  className?: string;
  width?: number;
}

export function GoldDivider({ className, width = 64 }: GoldDividerProps) {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={cn("h-px bg-accent", className)}
      style={{ width }}
    />
  );
}
