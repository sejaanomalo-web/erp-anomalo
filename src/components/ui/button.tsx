"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Anômalo dark-gold: CTAs dourados, raio 10px, uppercase com tracking.
// Variantes utilitárias (ghost/link) ficam em sentence case para ações
// discretas (ícones, dropdowns, fechar).
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] uppercase font-bold tracking-[0.075em] transition-[background,color,border-color,box-shadow,filter,opacity] duration-fast disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--accent-strong)]",
  {
    variants: {
      variant: {
        // CTA principal = ouro preenchido com texto preto + glow dourado.
        default:
          "bg-accent text-[var(--on-accent)] border border-accent shadow-[0_0_16px_rgba(var(--accent-rgb),0.12)] hover:brightness-110 hover:shadow-[0_0_24px_rgba(var(--accent-rgb),0.30)]",
        // "Nova venda" usa o mesmo ouro preenchido.
        compose:
          "bg-accent text-[var(--on-accent)] border border-accent shadow-[0_0_16px_rgba(var(--accent-rgb),0.12)] hover:brightness-110 hover:shadow-[0_0_24px_rgba(var(--accent-rgb),0.30)]",
        outline:
          "border border-[rgba(var(--accent-rgb),0.4)] text-accent bg-transparent hover:bg-[rgba(var(--accent-rgb),0.10)] hover:border-[rgba(var(--accent-rgb),0.65)] hover:shadow-[0_0_16px_rgba(var(--accent-rgb),0.18)]",
        ghost:
          "bg-transparent text-text-2 normal-case font-medium tracking-normal hover:bg-[var(--state-hover)] hover:text-text-1 active:bg-[var(--state-pressed)]",
        secondary:
          "bg-surface-2 text-text-1 border border-border-thin hover:bg-surface-3",
        destructive:
          "bg-transparent text-danger border border-[rgba(239,68,68,0.4)] hover:bg-[rgba(239,68,68,0.12)] hover:border-[rgba(239,68,68,0.65)]",
        link: "text-accent underline-offset-4 hover:underline px-0 normal-case font-medium tracking-normal",
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
