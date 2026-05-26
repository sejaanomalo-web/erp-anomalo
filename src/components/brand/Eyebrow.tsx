import { cn } from "@/lib/utils";

interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
}

// Eyebrow Gmail-style: sentence case, Roboto 500, cinza M3.
export function Eyebrow({ children, className }: EyebrowProps) {
  return (
    <span
      className={cn(
        "text-[0.75rem] font-medium tracking-[0.025em] text-text-3 inline-block",
        className,
      )}
    >
      {children}
    </span>
  );
}
