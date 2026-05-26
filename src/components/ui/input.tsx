"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", onFocus, ...props }, ref) => {
    const isNumeric = type === "number";

    function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
      // Inputs numéricos: ao focar, seleciona o conteúdo todo para que o
      // usuário não precise apagar o 0 padrão antes de digitar.
      if (isNumeric) {
        // setTimeout porque alguns browsers movem o cursor depois do focus event
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
          "flex h-10 w-full border border-border-medium bg-surface-3 px-md py-sm text-body-md text-text-1 placeholder:text-text-4 transition-colors duration-fast file:border-0 file:bg-transparent file:text-body-sm file:font-medium focus-visible:outline-none focus-visible:border-[var(--accent-strong)] focus-visible:shadow-[0_0_0_1px_var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
