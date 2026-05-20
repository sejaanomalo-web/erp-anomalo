"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[96px] w-full border border-border-medium bg-surface-3 px-md py-sm text-body-md text-text-1 placeholder:text-text-4 transition-colors duration-fast focus-visible:outline-none focus-visible:border-[var(--accent-strong)] focus-visible:shadow-[0_0_0_1px_var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60 resize-vertical",
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";
