"use client";

import { useEffect, useMemo, useState } from "react";
import { Command } from "cmdk";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { NAV } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query, 150);

  const sugestoes = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    if (!q) return NAV;
    return NAV.filter((item) => item.label.toLowerCase().includes(q));
  }, [debounced]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  function go(href: string) {
    onOpenChange(false);
    router.push(href);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent hideClose className="p-0 max-w-xl">
          <Command shouldFilter={false} loop>
            <div className="flex items-center gap-sm px-md py-sm border-b border-border-thin">
              <Search size={16} strokeWidth={1.8} className="text-text-3" />
              <Command.Input
                autoFocus
                value={query}
                onValueChange={setQuery}
                placeholder="Buscar vendas, clientes, produtos…"
                className="flex-1 bg-transparent text-body-md text-text-1 placeholder:text-text-4 focus:outline-none border-0"
              />
              <kbd className="hidden sm:inline-flex items-center gap-xs text-caption text-text-4 border border-border-thin px-xs">
                Esc
              </kbd>
            </div>
            <Command.List className="max-h-[420px] overflow-y-auto scrollbar-thin p-xs">
              <Command.Empty className="p-md text-body-sm text-text-3 text-center">
                Nenhum resultado.
              </Command.Empty>
              <Command.Group heading="Navegação" className="text-label-caps text-text-3 px-sm py-xs">
                {sugestoes.map((item) => (
                  <Command.Item
                    key={item.href}
                    value={`${item.label} ${item.href}`}
                    onSelect={() => go(item.href)}
                    className={cn(
                      "flex items-center gap-sm px-sm py-sm text-body-md text-text-2 cursor-pointer data-[selected=true]:bg-surface-2 data-[selected=true]:text-text-1",
                    )}
                  >
                    <item.icon size={16} strokeWidth={1.8} className="text-text-3" />
                    <span>{item.label}</span>
                    <span className="ml-auto text-caption text-text-4">{item.href}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>
          </Command>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
