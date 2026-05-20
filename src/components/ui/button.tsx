"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-sm whitespace-nowrap font-semibold uppercase tracking-[0.075em] transition-[background,color,border-color,box-shadow,opacity] duration-fast disabled:pointer-events-none disabled:opacity-60 focus-visible:outline-none focus-visible:shadow-[0_0_0_1px_var(--accent-strong)]",
  {
    variants: {
      variant: {
        default:
          "bg-accent text-black hover:shadow-hover-md hover:bg-[#d3a14a] active:bg-[#b88330]",
        outline:
          "border border-[var(--accent-strong)] text-text-1 bg-transparent hover:bg-accent-subtle",
        ghost:
          "bg-accent-subtle text-text-1 hover:bg-[rgba(201,149,58,0.18)]",
        secondary:
          "bg-surface-2 text-text-1 border border-border-thin hover:bg-surface-3",
        destructive:
          "bg-error text-white hover:bg-[#dc2626]",
        link: "text-accent underline-offset-4 hover:underline normal-case tracking-normal font-medium",
      },
      size: {
        sm: "h-8 px-md text-button",
        default: "h-10 px-lg text-button",
        lg: "h-12 px-xl text-button",
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
