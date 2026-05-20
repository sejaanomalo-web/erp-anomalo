"use client";

import { useEffect, useState } from "react";
import { AnomaloMark } from "@/components/brand/AnomaloMark";
import { Rail } from "./Rail";
import { MobileDrawer } from "./MobileDrawer";
import { NotificationBell } from "./NotificationBell";
import { CommandPaletteTrigger } from "./CommandPaletteTrigger";

const STORAGE_KEY = "erp-anomalo:rail-collapsed";

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
          {children}
        </div>
      </main>

      <AnomaloMark />
    </div>
  );
}
