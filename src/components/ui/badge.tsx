import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center gap-[6px] px-[10px] py-[3px] text-caption uppercase tracking-[0.06em] font-semibold rounded-full whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "bg-surface-2 text-text-2 border border-border-thin",
        muted: "bg-surface-2 text-text-3 border border-border-thin",
        accent:
          "bg-accent-subtle text-accent border border-[var(--accent-strong)]",
        success:
          "bg-[rgba(22,163,74,0.12)] text-success border border-[rgba(22,163,74,0.30)]",
        warning:
          "bg-[rgba(234,179,8,0.12)] text-warning border border-[rgba(234,179,8,0.30)]",
        error:
          "bg-[rgba(239,68,68,0.12)] text-error border border-[rgba(239,68,68,0.30)]",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, tone, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props}>
      {dot ? (
        <span
          aria-hidden
          className={cn(
            "h-[6px] w-[6px] rounded-full bg-current",
          )}
        />
      ) : null}
      {children}
    </span>
  );
}
