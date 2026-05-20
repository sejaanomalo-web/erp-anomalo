"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useState } from "react";
import { AnomaloMark } from "@/components/brand/AnomaloMark";
import { NAV } from "@/lib/navigation";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export function MobileTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Abrir menu"
      className="lg:hidden fixed left-md top-md z-topbar h-10 w-10 flex items-center justify-center bg-surface-1 border border-border-thin text-text-1"
    >
      <Menu size={20} strokeWidth={1.8} />
    </button>
  );
}

export function MobileDrawer() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { canAccess } = usePermissions();
  const items = NAV.filter((item) => !item.modulo || canAccess(item.modulo));

  async function sair() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <>
      <MobileTrigger onClick={() => setOpen(true)} />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0" hideClose>
          <div className="flex items-center justify-between gap-sm px-md h-16 border-b border-border-thin">
            <div className="flex items-center gap-sm text-text-1 font-bold tracking-[0.12em] uppercase text-body-sm">
              <AnomaloMark size={14} className="text-accent" decorative={false} />
              ERP Anômalo
            </div>
            <button
              type="button"
              aria-label="Fechar"
              onClick={() => setOpen(false)}
              className="text-text-3 hover:text-text-1"
            >
              <X size={20} strokeWidth={1.8} />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto scrollbar-thin py-md">
            <ul className="flex flex-col gap-xxs">
              {items.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <li key={item.href} className="relative">
                    {active ? (
                      <span
                        aria-hidden
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-9 w-[3px] bg-accent"
                      />
                    ) : null}
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-md mx-sm px-sm py-sm transition-colors duration-fast",
                        active
                          ? "text-text-1"
                          : "text-text-3 hover:text-text-1 hover:bg-surface-2",
                      )}
                    >
                      <Icon
                        size={18}
                        strokeWidth={1.8}
                        className={cn(active ? "text-accent" : "")}
                      />
                      <span className="text-body-md font-medium">
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="border-t border-border-thin p-sm">
            <button
              type="button"
              onClick={sair}
              className="flex items-center gap-md w-full px-sm py-sm text-text-3 hover:text-text-1 hover:bg-surface-2"
            >
              <LogOut size={18} strokeWidth={1.8} />
              <span className="text-body-md">Sair</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
