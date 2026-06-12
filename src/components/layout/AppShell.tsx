"use client";

import { Suspense, useEffect, useState } from "react";
import { Rail } from "./Rail";
import { MobileDrawer } from "./MobileDrawer";
import { NotificationBell } from "./NotificationBell";
import { CommandPaletteTrigger } from "./CommandPaletteTrigger";
import { AnomaloMark } from "@/components/brand/AnomaloMark";

const STORAGE_KEY = "erp-anomalo:rail-collapsed";

// Shell Anômalo dark-gold: rail + conteúdo sobre canvas preto. Marca Λ como
// assinatura discreta no canto inferior direito.
export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "1") setCollapsed(true);
  }, []);

  function toggle() {
    setCollapsed((c) => {
      const next = !c;
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <div className="flex min-h-screen bg-background text-text-1">
      <Rail collapsed={collapsed} onToggle={toggle} />
      <MobileDrawer />
      <NotificationBell />
      <CommandPaletteTrigger />

      <main className="flex-1 min-w-0">
        <div className="mx-auto w-full max-w-[1280px] px-md md:px-lg lg:px-xl py-2xl pt-16 lg:pt-2xl">
          <Suspense fallback={null}>{children}</Suspense>
        </div>
      </main>

      <AnomaloMark size={44} className="anomalo-mark" />
    </div>
  );
}
