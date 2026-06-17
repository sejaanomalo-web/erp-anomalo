"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut, Pencil, CalendarPlus } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useState } from "react";
import { TatoLogo } from "@/components/brand/TatoLogo";
import { OrcamentoDialog } from "@/components/vendas/OrcamentoDialog";
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
  const [orcamentoOpen, setOrcamentoOpen] = useState(false);
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
            <div className="flex items-center">
              <TatoLogo height={22} />
            </div>
            <button
              type="button"
              aria-label="Fechar"
              onClick={() => setOpen(false)}
              className="h-10 w-10 inline-flex items-center justify-center rounded-[10px] text-text-2 hover:bg-surface-2"
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
                className="inline-flex items-center justify-start gap-3 h-12 w-full pl-4 pr-6 bg-accent text-[var(--on-accent)] rounded-[12px] shadow-[0_0_16px_rgba(var(--accent-rgb),0.12)]"
              >
                <Pencil size={18} strokeWidth={2.2} />
                <span className="text-button uppercase tracking-[0.075em] font-bold">
                  Nova venda
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setOrcamentoOpen(true);
                }}
                className="mt-2 inline-flex items-center justify-start gap-3 h-12 w-full pl-4 pr-6 rounded-[12px] border border-[rgba(var(--accent-rgb),0.40)] text-accent hover:bg-[rgba(var(--accent-rgb),0.10)] transition-colors duration-fast"
              >
                <CalendarPlus size={18} strokeWidth={2.2} />
                <span className="text-button uppercase tracking-[0.075em] font-bold">
                  Orçamento
                </span>
              </button>
            </div>
          ) : null}

          <nav className="flex-1 overflow-y-auto scrollbar-thin px-3">
            <ul className="flex flex-col gap-1">
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
                        "relative flex items-center gap-3 h-11 px-3 rounded-[10px] transition-colors duration-fast",
                        active
                          ? "bg-surface-2 text-text-1"
                          : "text-text-2 hover:bg-surface-2",
                      )}
                    >
                      {active ? (
                        <span
                          aria-hidden
                          className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-[2px] bg-accent"
                        />
                      ) : null}
                      <Icon
                        size={20}
                        strokeWidth={active ? 2 : 1.8}
                        className={active ? "text-accent" : "text-text-2"}
                      />
                      <span className="text-body-md font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="p-3 border-t border-border-thin">
            <button
              type="button"
              onClick={sair}
              className="flex items-center gap-3 h-11 w-full px-3 rounded-[10px] text-text-2 hover:bg-surface-2"
            >
              <LogOut size={18} strokeWidth={1.8} />
              <span className="text-body-md font-medium">Sair</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>
      <OrcamentoDialog open={orcamentoOpen} onOpenChange={setOrcamentoOpen} />
    </>
  );
}
