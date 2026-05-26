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
          "flex min-h-[96px] w-full rounded-md border border-border-medium bg-surface-1 px-3 py-2 text-body-md text-text-1 placeholder:text-text-3 transition-colors duration-fast focus-visible:outline-none focus-visible:border-accent focus-visible:shadow-[0_0_0_1px_var(--accent)] disabled:cursor-not-allowed disabled:opacity-50 resize-vertical",
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";
