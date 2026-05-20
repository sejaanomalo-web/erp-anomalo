"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { AnomaloMark } from "@/components/brand/AnomaloMark";
import { NAV } from "@/lib/navigation";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface RailProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Rail({ collapsed, onToggle }: RailProps) {
  const pathname = usePathname();
  const { canAccess } = usePermissions();

  const items = NAV.filter((item) => !item.modulo || canAccess(item.modulo));

  async function sair() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-screen sticky top-0 z-rail border-r border-border-thin bg-surface-1 transition-[width] duration-medium",
      )}
      style={{
        width: collapsed
          ? "var(--rail-width-collapsed)"
          : "var(--rail-width)",
      }}
    >
      <div className="flex items-center gap-sm px-md h-16 border-b border-border-thin">
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          className="text-text-3 hover:text-text-1 transition-colors duration-fast"
        >
          {collapsed ? (
            <ChevronRight size={18} strokeWidth={1.8} />
          ) : (
            <ChevronLeft size={18} strokeWidth={1.8} />
          )}
        </button>
        {collapsed ? null : (
          <Link
            href="/"
            className="flex items-center gap-sm text-text-1 font-bold tracking-[0.12em] uppercase text-body-sm"
          >
            <AnomaloMark size={14} className="text-accent" decorative={false} />
            ERP Anômalo
          </Link>
        )}
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
                  title={collapsed ? item.label : undefined}
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
                  {collapsed ? null : (
                    <span className="text-body-md font-medium">
                      {item.label}
                    </span>
                  )}
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
          title={collapsed ? "Sair" : undefined}
          className="flex items-center gap-md w-full px-sm py-sm text-text-3 hover:text-text-1 hover:bg-surface-2 transition-colors duration-fast"
        >
          <LogOut size={18} strokeWidth={1.8} />
          {collapsed ? null : <span className="text-body-md">Sair</span>}
        </button>
      </div>
    </aside>
  );
}
