"use client";

import { useMemo, useState } from "react";
import { Command } from "cmdk";
import { Check, ChevronDown, Plus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "@/components/feedback/Toast";
import {
  useCategoriasFinanceiras,
  useCriarCategoriaFinanceira,
} from "@/lib/queries/financeiro";

interface Props {
  tipo: "entrada" | "saida";
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
}

/**
 * Combobox para categoria financeira:
 *  - Lista categorias existentes do tipo (entrada/saida)
 *  - Busca por texto
 *  - Quando o texto digitado não corresponde a nenhuma, mostra opção
 *    "+ Criar categoria 'X'" que cria via API e já seleciona
 */
export function CategoriaCombobox({
  tipo,
  value,
  onChange,
  placeholder = "Categoria",
}: Props) {
  const categorias = useCategoriasFinanceiras(tipo);
  const criar = useCriarCategoriaFinanceira();
  const [open, setOpen] = useState(false);
  const [busca, setBusca] = useState("");

  const lista = useMemo(() => categorias.data ?? [], [categorias.data]);
  const selecionada = lista.find((c) => c.id === value);

  const buscaTrim = busca.trim();
  const buscaLower = buscaTrim.toLowerCase();
  const matchExato = lista.some(
    (c) => c.nome.toLowerCase() === buscaLower,
  );
  const filtradas = buscaLower
    ? lista.filter((c) => c.nome.toLowerCase().includes(buscaLower))
    : lista;

  async function criarECarregar() {
    if (!buscaTrim || matchExato || criar.isPending) return;
    try {
      const nova = await criar.mutateAsync({
        nome: buscaTrim,
        tipo,
      });
      onChange(nova.id);
      setBusca("");
      setOpen(false);
      toast.success("Categoria criada.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao criar.");
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-haspopup="listbox"
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-border-medium bg-surface-1 px-3 py-2 text-body-md text-text-1 transition-colors duration-fast",
            "hover:bg-[var(--state-hover)] focus:outline-none focus:border-accent focus:shadow-[0_0_0_1px_var(--accent)]",
          )}
        >
          <span className={selecionada ? "" : "text-text-3"}>
            {selecionada ? selecionada.nome : placeholder}
          </span>
          <ChevronDown
            size={16}
            strokeWidth={1.8}
            className="opacity-60 shrink-0"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="p-0 w-[var(--radix-popover-trigger-width)] min-w-[240px]"
      >
        <Command shouldFilter={false} loop>
          <div className="border-b border-border-thin px-3 py-2">
            <Command.Input
              value={busca}
              onValueChange={setBusca}
              autoFocus
              placeholder={
                categorias.isLoading
                  ? "Carregando…"
                  : "Buscar ou criar categoria"
              }
              className="w-full bg-transparent text-body-md text-text-1 placeholder:text-text-3 focus:outline-none border-0"
            />
          </div>
          <Command.List className="max-h-[240px] overflow-y-auto scrollbar-thin p-1">
            {!buscaTrim && lista.length === 0 ? (
              <div className="px-3 py-4 text-body-sm text-text-3 text-center">
                Nenhuma categoria ainda. Digite acima para criar a primeira.
              </div>
            ) : null}

            {filtradas.map((c) => (
              <Command.Item
                key={c.id}
                value={c.nome}
                onSelect={() => {
                  onChange(c.id);
                  setBusca("");
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center justify-between gap-2 px-3 py-2 rounded-md text-body-md text-text-1 cursor-pointer",
                  "data-[selected=true]:bg-[var(--state-hover)]",
                )}
              >
                <span>{c.nome}</span>
                {value === c.id ? (
                  <Check
                    size={14}
                    strokeWidth={2}
                    className="text-accent shrink-0"
                  />
                ) : null}
              </Command.Item>
            ))}

            {buscaTrim && !matchExato ? (
              <Command.Item
                value={`__criar__${buscaTrim}`}
                onSelect={criarECarregar}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-body-md text-accent cursor-pointer mt-1 border-t border-border-thin",
                  "data-[selected=true]:bg-[var(--state-hover)]",
                )}
              >
                <Plus size={14} strokeWidth={2} />
                <span>
                  {criar.isPending
                    ? "Criando…"
                    : `Criar categoria "${buscaTrim}"`}
                </span>
              </Command.Item>
            ) : null}

            {buscaTrim && filtradas.length === 0 && matchExato ? null : null}
          </Command.List>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
