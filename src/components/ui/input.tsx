"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
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
