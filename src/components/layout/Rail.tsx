"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, LogOut, Pencil } from "lucide-react";
import { AnomaloMark } from "@/components/brand/AnomaloMark";
import { NAV } from "@/lib/navigation";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface RailProps {
  collapsed: boolean;
  onToggle: () => void;
}

// Gmail-style sidebar:
//   - Header com logo + toggle
//   - "Compose pill" (CTA primária em pill, pale blue, sombra suave). No ERP, "Nova venda"
//   - Nav-rail items: pill assimétrico no item ativo (bg compose pale blue, ícone preenchido),
//     transparent + state layer hover nos inativos
export function Rail({ collapsed, onToggle }: RailProps) {
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
    <aside
      className={cn(
        "hidden lg:flex flex-col h-screen sticky top-0 z-rail bg-background transition-[width] duration-medium",
      )}
      style={{
        width: collapsed
          ? "var(--rail-width-collapsed)"
          : "var(--rail-width)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 h-16">
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          className="h-10 w-10 inline-flex items-center justify-center rounded-full text-text-2 hover:bg-[var(--state-hover)] active:bg-[var(--state-pressed)] transition-colors duration-fast"
        >
          {collapsed ? (
            <ChevronRight size={20} strokeWidth={2} />
          ) : (
            <ChevronLeft size={20} strokeWidth={2} />
          )}
        </button>
        {collapsed ? null : (
          <Link
            href="/"
            className="flex items-center gap-2 text-text-1 font-medium text-base"
          >
            <AnomaloMark size={18} className="text-accent" decorative={false} />
            <span>ERP Anômalo</span>
          </Link>
        )}
      </div>

      {/* Compose pill — CTA primária */}
      {podeNovaVenda ? (
        <div className="px-3 pb-3">
          <button
            type="button"
            onClick={() => router.push("/vendas/nova")}
            title="Nova venda"
            className={cn(
              "inline-flex items-center justify-start gap-3 h-14 bg-compose text-compose-foreground rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-fast",
              collapsed ? "w-14 justify-center" : "w-full pl-4 pr-6",
            )}
          >
            <Pencil size={20} strokeWidth={2} />
            {collapsed ? null : (
              <span className="text-body-md font-medium">Nova venda</span>
            )}
          </button>
        </div>
      ) : null}

      {/* Nav-rail */}
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
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-3 h-8 transition-colors duration-fast",
                    // Nav-rail item: pill assimétrico ancorado à direita
                    "rounded-r-full",
                    collapsed ? "mx-2 px-2 rounded-full justify-center" : "pl-6 pr-6",
                    active
                      ? "bg-compose text-compose-foreground font-medium"
                      : "text-text-2 hover:bg-[var(--state-hover)] active:bg-[var(--state-pressed)]",
                  )}
                >
                  <Icon
                    size={20}
                    strokeWidth={active ? 2.2 : 1.8}
                    className={cn(active ? "text-compose-foreground" : "text-text-2")}
                  />
                  {collapsed ? null : (
                    <span className="text-body-md">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sign out */}
      <div className="p-2">
        <button
          type="button"
          onClick={sair}
          title={collapsed ? "Sair" : undefined}
          className={cn(
            "flex items-center gap-3 h-10 w-full rounded-full text-text-2 hover:bg-[var(--state-hover)] active:bg-[var(--state-pressed)] transition-colors duration-fast",
            collapsed ? "justify-center px-2" : "px-4",
          )}
        >
          <LogOut size={18} strokeWidth={1.8} />
          {collapsed ? null : <span className="text-body-md">Sair</span>}
        </button>
      </div>
    </aside>
  );
}
