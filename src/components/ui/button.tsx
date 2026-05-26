"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Gmail / Material 3: botões em pill (rounded-full), tipografia sentence case,
// Roboto 500 14px. State layers via mudança de bg-color no hover.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium tracking-[0.0142857em] transition-[background,color,border-color,box-shadow,opacity] duration-fast disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--accent-strong)]",
  {
    variants: {
      variant: {
        // Primary action = Google Blue 700 com texto branco (M3 primary).
        default:
          "bg-accent text-white hover:bg-accent-hover hover:shadow-sm active:bg-accent-active",
        // Compose pill — pale blue (M3 secondary container). Usado em CTAs
        // amistosos como "Nova venda".
        compose:
          "bg-compose text-compose-foreground hover:shadow-md active:brightness-95",
        outline:
          "border border-border-medium text-text-1 bg-surface-1 hover:bg-[var(--state-hover)] active:bg-[var(--state-pressed)]",
        ghost:
          "bg-transparent text-text-1 hover:bg-[var(--state-hover)] active:bg-[var(--state-pressed)]",
        secondary:
          "bg-surface-2 text-text-1 border border-border-thin hover:bg-surface-3",
        destructive:
          "bg-error text-white hover:brightness-110 active:brightness-90",
        link: "text-accent underline-offset-4 hover:underline px-0",
      },
      size: {
        sm: "h-8 px-3 text-button",
        default: "h-10 px-4 text-button",
        lg: "h-12 px-6 text-button",
        icon: "h-10 w-10 p-0",
        iconSm: "h-8 w-8 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
