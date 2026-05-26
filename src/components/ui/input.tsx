"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

// Gmail/M3 input: borda fina cinza, fundo branco, focus em Google Blue.
// Inputs numéricos: select() ao focar para evitar lutar com o `0`.
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", onFocus, ...props }, ref) => {
    const isNumeric = type === "number";

    function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
      if (isNumeric) {
        const target = e.currentTarget;
        setTimeout(() => target.select(), 0);
      }
      onFocus?.(e);
    }

    return (
      <input
        ref={ref}
        type={type}
        onFocus={handleFocus}
        className={cn(
          "flex h-10 w-full rounded-md border border-border-medium bg-surface-1 px-3 py-2 text-body-md text-text-1 placeholder:text-text-3 transition-colors duration-fast file:border-0 file:bg-transparent file:text-body-sm file:font-medium focus-visible:outline-none focus-visible:border-accent focus-visible:shadow-[0_0_0_1px_var(--accent)] disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
