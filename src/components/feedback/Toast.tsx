"use client";

import { Toaster, toast } from "sonner";

export function ToastViewport() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            "!bg-surface-1 !border !border-border-thin !text-text-1 !shadow-elevated !rounded-none !p-md",
          title: "!text-body-md !text-text-1 !font-medium",
          description: "!text-body-sm !text-text-3",
          actionButton:
            "!bg-accent !text-[var(--on-accent)] !rounded-none !uppercase !text-button !tracking-[0.075em]",
          cancelButton:
            "!bg-surface-2 !text-text-2 !rounded-none !uppercase !text-button !tracking-[0.075em]",
        },
      }}
    />
  );
}

export { toast };
