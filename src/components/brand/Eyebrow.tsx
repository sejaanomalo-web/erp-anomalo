import { cn } from "@/lib/utils";

interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
}

export function Eyebrow({ children, className }: EyebrowProps) {
  return (
    <span
      className={cn(
        "text-label-caps text-text-3 inline-block uppercase",
        className,
      )}
    >
      {children}
    </span>
  );
}
