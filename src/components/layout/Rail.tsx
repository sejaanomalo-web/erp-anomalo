"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Pencil } from "lucide-react";
import { TatoLogo } from "@/components/brand/TatoLogo";
import { NAV } from "@/lib/navigation";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface RailProps {
  collapsed: boolean;
  onToggle: () => void;
}

// Sidebar Anômalo dark-gold:
//   - Topo: logo Λ. Clicar nele expande/recolhe o rail.
//   - "Nova venda": pílula dourada (CTA primária).
//   - Itens: ativo com barra dourada à esquerda + fundo surface-2 + ícone ouro.
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
        "hidden lg:flex flex-col h-screen sticky top-0 z-rail bg-background border-r border-border-thin transition-[width] duration-medium",
      )}
      style={{
        width: collapsed
          ? "var(--rail-width-collapsed)"
          : "var(--rail-width)",
      }}
    >
      {/* Topo: logo Λ (clicar expande/recolhe) */}
      <div className="flex items-center h-16 px-3">
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          title={collapsed ? "Expandir menu" : "Recolher menu"}
          className={cn(
            "flex items-center gap-2 h-11 rounded-[10px] text-text-1 hover:bg-surface-2 transition-colors duration-fast",
            collapsed ? "w-full justify-center" : "w-full px-2",
          )}
        >
          <TatoLogo height={collapsed ? 14 : 22} />
        </button>
      </div>

      {/* Nova venda — pílula dourada */}
      {podeNovaVenda ? (
        <div className="px-3 pb-3">
          <button
            type="button"
            onClick={() => router.push("/vendas/nova")}
            title="Nova venda"
            className={cn(
              "inline-flex items-center justify-start gap-3 h-12 bg-accent text-[var(--on-accent)] rounded-[12px] shadow-[0_0_16px_rgba(var(--accent-rgb),0.12)] hover:brightness-110 hover:shadow-[0_0_24px_rgba(var(--accent-rgb),0.30)] transition-[filter,box-shadow] duration-fast",
              collapsed ? "w-12 justify-center" : "w-full pl-4 pr-6",
            )}
          >
            <Pencil size={18} strokeWidth={2.2} />
            {collapsed ? null : (
              <span className="text-button uppercase tracking-[0.075em] font-bold">
                Nova venda
              </span>
            )}
          </button>
        </div>
      ) : null}

      {/* Navegação */}
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
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "relative flex items-center gap-3 h-11 rounded-[10px] transition-colors duration-fast",
                    collapsed ? "justify-center px-0" : "px-3",
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
                  {collapsed ? null : (
                    <span className="text-body-md font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sair */}
      <div className="p-3 border-t border-border-thin">
        <button
          type="button"
          onClick={sair}
          title={collapsed ? "Sair" : undefined}
          className={cn(
            "flex items-center gap-3 h-11 w-full rounded-[10px] text-text-2 hover:bg-surface-2 transition-colors duration-fast",
            collapsed ? "justify-center px-0" : "px-3",
          )}
        >
          <LogOut size={18} strokeWidth={1.8} />
          {collapsed ? null : (
            <span className="text-body-md font-medium">Sair</span>
          )}
        </button>
      </div>
    </aside>
  );
}
