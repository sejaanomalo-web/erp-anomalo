"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/financeiro", label: "Visão geral", exact: true },
  { href: "/financeiro/lancamentos", label: "Lançamentos" },
  { href: "/financeiro/recorrentes", label: "Recorrentes" },
  { href: "/financeiro/contas", label: "Contas" },
  { href: "/financeiro/categorias", label: "Categorias" },
  { href: "/financeiro/relatorios", label: "Relatórios" },
];

// Navegação interna do Financeiro (pílulas). Ativo = dourado/preto. Preserva
// o período (?modo&de&ate&mes&ano) ao trocar de aba.
export function FinanceiroNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qs = searchParams.toString();

  return (
    <nav className="inline-flex max-w-full items-center gap-1 overflow-x-auto scrollbar-thin rounded-xl border border-border-thin bg-surface-1 p-1">
      {TABS.map((t) => {
        const active = t.exact
          ? pathname === t.href
          : pathname === t.href || pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={qs ? `${t.href}?${qs}` : t.href}
            className={cn(
              "whitespace-nowrap rounded-lg px-4 py-2 text-label-caps transition-colors duration-fast",
              active ? "bg-accent text-black" : "text-text-2 hover:text-text-1",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
