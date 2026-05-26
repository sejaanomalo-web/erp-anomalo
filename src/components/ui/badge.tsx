import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Gmail/M3: status pills em rounded-full, sentence case, paleta Google brand.
// Label tags da sidebar usam variante "label" (rounded-square 4px sem texto).
const badgeVariants = cva(
  "inline-flex items-center justify-center gap-[6px] whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "bg-surface-2 text-text-2 border border-border-thin",
        muted: "bg-surface-2 text-text-3 border border-border-thin",
        accent:
          "bg-[var(--selected)] text-[var(--selected-foreground)] border border-[var(--accent-strong)]",
        success:
          "bg-[rgba(52,168,83,0.12)] text-success border border-[rgba(52,168,83,0.30)]",
        warning:
          "bg-[rgba(251,188,4,0.18)] text-[#806400] border border-[rgba(251,188,4,0.45)]",
        error:
          "bg-[rgba(234,67,53,0.10)] text-error border border-[rgba(234,67,53,0.30)]",
      },
      shape: {
        pill: "rounded-full px-[10px] py-[3px] text-[0.6875rem] tracking-[0.02em] font-medium",
        label: "rounded-sm h-4 w-4 p-0", // filled rounded-square 16x16 (Gmail sidebar label)
      },
    },
    defaultVariants: {
      tone: "neutral",
      shape: "pill",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({
  className,
  tone,
  shape,
  dot,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ tone, shape }), className)}
      {...props}
    >
      {dot ? (
        <span
          aria-hidden
          className="h-[6px] w-[6px] rounded-full bg-current"
        />
      ) : null}
      {children}
    </span>
  );
}
