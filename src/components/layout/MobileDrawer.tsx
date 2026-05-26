"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut, Pencil } from "lucide-react";
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
      className="lg:hidden fixed left-md top-md z-topbar h-10 w-10 flex items-center justify-center rounded-full bg-surface-1 border border-border-thin text-text-1 hover:bg-[var(--state-hover)]"
    >
      <Menu size={20} strokeWidth={1.8} />
    </button>
  );
}

export function MobileDrawer() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { canAccess } = usePermissions();
  const items = NAV.filter((item) => !item.modulo || canAccess(item.modulo));
  const podeNovaVenda = canAccess("vendas");

  async function sair() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <>
      <MobileTrigger onClick={() => setOpen(true)} />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0 bg-background" hideClose>
          <div className="flex items-center justify-between gap-2 px-4 h-16">
            <div className="flex items-center gap-2 text-text-1 font-medium text-base">
              <AnomaloMark size={18} className="text-accent" decorative={false} />
              Tato Estofados
            </div>
            <button
              type="button"
              aria-label="Fechar"
              onClick={() => setOpen(false)}
              className="h-10 w-10 inline-flex items-center justify-center rounded-full text-text-2 hover:bg-[var(--state-hover)]"
            >
              <X size={20} strokeWidth={1.8} />
            </button>
          </div>

          {podeNovaVenda ? (
            <div className="px-3 pb-3">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  router.push("/vendas/nova");
                }}
                className="inline-flex items-center justify-start gap-3 h-14 w-full pl-4 pr-6 bg-compose text-compose-foreground rounded-2xl shadow-sm"
              >
                <Pencil size={20} strokeWidth={2} />
                <span className="text-body-md font-medium">Nova venda</span>
              </button>
            </div>
          ) : null}

          <nav className="flex-1 overflow-y-auto scrollbar-thin pr-2">
            <ul className="flex flex-col gap-[2px]">
              {items.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 h-10 pl-6 pr-6 rounded-r-full transition-colors duration-fast",
                        active
                          ? "bg-compose text-compose-foreground font-medium"
                          : "text-text-2 hover:bg-[var(--state-hover)]",
                      )}
                    >
                      <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                      <span className="text-body-md">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="p-2">
            <button
              type="button"
              onClick={sair}
              className="flex items-center gap-3 h-10 w-full px-4 rounded-full text-text-2 hover:bg-[var(--state-hover)]"
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
