"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/feedback/Toast";
import { FORMAS_PAGAMENTO } from "@/lib/constants";
import {
  useCategoriasFinanceiras,
  useCriarLancamento,
} from "@/lib/queries/financeiro";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipoInicial: "entrada" | "saida";
  /**
   * Quando true, o tipo é travado em `tipoInicial` e o toggle Receita/Despesa
   * fica oculto. Default true — uso típico vem de /entradas ou /saidas onde
   * o tipo é dado pelo contexto.
   */
  lockTipo?: boolean;
}

interface FormState {
  tipo: "entrada" | "saida";
  descricao: string;
  valor: number;
  data_competencia: string;
  data_vencimento: string;
  forma_pagamento: string;
  categoria_id: string;
  status: "pendente" | "pago";
  observacoes: string;
}

function emptyState(tipoInicial: "entrada" | "saida"): FormState {
  return {
    tipo: tipoInicial,
    descricao: "",
    valor: 0,
    data_competencia: new Date().toISOString().slice(0, 10),
    data_vencimento: "",
    forma_pagamento: "pix",
    categoria_id: "",
    status: "pendente",
    observacoes: "",
  };
}

export function LancamentoDialog({
  open,
  onOpenChange,
  tipoInicial,
  lockTipo = true,
}: Props) {
  const [form, setForm] = useState<FormState>(emptyState(tipoInicial));
  const categorias = useCategoriasFinanceiras(form.tipo);
  const criar = useCriarLancamento();

  // Quando o dialog reabre, força tipoInicial para corresponder ao contexto
  // de onde foi aberto (evita "vazar" o tipo entre /entradas e /saidas).
  React.useEffect(() => {
    if (open) {
      setForm((cur) => ({ ...cur, tipo: tipoInicial }));
    }
  }, [open, tipoInicial]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.descricao.trim().length < 2 || form.valor <= 0) return;
    try {
      await criar.mutateAsync({
        tipo: form.tipo,
        descricao: form.descricao.trim(),
        valor: form.valor,
        data_competencia: form.data_competencia,
        data_vencimento: form.data_vencimento || null,
        forma_pagamento: form.forma_pagamento || null,
        categoria_id: form.categoria_id || null,
        status: form.status,
        observacoes: form.observacoes.trim() || null,
      });
      toast.success(
        form.tipo === "entrada"
          ? "Receita registrada."
          : "Despesa registrada.",
      );
      setForm(emptyState(tipoInicial));
      onOpenChange(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Falha ao salvar lançamento.",
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {form.tipo === "entrada" ? "Nova receita" : "Nova despesa"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-md">
          {!lockTipo ? (
            <div className="flex items-center gap-xs">
              <Button
                type="button"
                size="sm"
                variant={form.tipo === "entrada" ? "default" : "secondary"}
                onClick={() =>
                  setForm({ ...form, tipo: "entrada", categoria_id: "" })
                }
              >
                Receita
              </Button>
              <Button
                type="button"
                size="sm"
                variant={form.tipo === "saida" ? "default" : "secondary"}
                onClick={() =>
                  setForm({ ...form, tipo: "saida", categoria_id: "" })
                }
              >
                Despesa
              </Button>
            </div>
          ) : null}
          <div className="flex flex-col gap-xs">
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              value={form.descricao}
              onChange={(e) =>
                setForm({ ...form, descricao: e.target.value })
              }
              required
              placeholder="Ex: Venda 1234, Aluguel, Fornecedor X"
            />
          </div>
          <div className="grid grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <Label htmlFor="valor">Valor</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                min={0}
                value={form.valor}
                onChange={(e) =>
                  setForm({ ...form, valor: Number(e.target.value) })
                }
                required
              />
            </div>
            <div className="flex flex-col gap-xs">
              <Label>Forma de pagamento</Label>
              <Select
                value={form.forma_pagamento}
                onValueChange={(v) =>
                  setForm({ ...form, forma_pagamento: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FORMAS_PAGAMENTO.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <Label htmlFor="data_competencia">Competência</Label>
              <Input
                id="data_competencia"
                type="date"
                value={form.data_competencia}
                onChange={(e) =>
                  setForm({ ...form, data_competencia: e.target.value })
                }
                required
              />
            </div>
            <div className="flex flex-col gap-xs">
              <Label htmlFor="data_vencimento">Vencimento</Label>
              <Input
                id="data_vencimento"
                type="date"
                value={form.data_vencimento}
                onChange={(e) =>
                  setForm({ ...form, data_vencimento: e.target.value })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <Label>Categoria (opcional)</Label>
              <Select
                value={form.categoria_id}
                onValueChange={(v) => setForm({ ...form, categoria_id: v })}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      categorias.isLoading
                        ? "Carregando…"
                        : (categorias.data?.length ?? 0) === 0
                          ? "Sem categorias"
                          : "Selecionar"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {(categorias.data ?? []).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-xs">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm({ ...form, status: v as "pendente" | "pago" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-xs">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              rows={2}
              value={form.observacoes}
              onChange={(e) =>
                setForm({ ...form, observacoes: e.target.value })
              }
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={criar.isPending}>
              {criar.isPending ? "Salvando…" : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
