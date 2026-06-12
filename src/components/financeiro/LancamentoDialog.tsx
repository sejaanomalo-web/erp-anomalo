"use client";

import * as React from "react";
import { useEffect, useState } from "react";
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
import { CategoriaCombobox } from "@/components/financeiro/CategoriaCombobox";
import { toast } from "@/components/feedback/Toast";
import { FORMAS_PAGAMENTO } from "@/lib/constants";
import {
  useAtualizarLancamento,
  useContas,
  useCriarLancamento,
  type LancamentoRow,
} from "@/lib/queries/financeiro";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipoInicial: "entrada" | "saida";
  /**
   * Quando true, o tipo é travado em `tipoInicial` e o toggle Receita/Despesa
   * fica oculto. Default true.
   */
  lockTipo?: boolean;
  /**
   * Quando fornecido, o dialog entra em modo edição: pré-preenche os campos
   * e chama PATCH em vez de POST.
   */
  editar?: LancamentoRow | null;
}

interface FormState {
  tipo: "entrada" | "saida";
  descricao: string;
  origem: string;
  valor: number;
  data_competencia: string;
  data_vencimento: string;
  forma_pagamento: string;
  categoria_id: string;
  conta_id: string;
  status: "pendente" | "pago";
  observacoes: string;
}

function emptyState(tipoInicial: "entrada" | "saida"): FormState {
  return {
    tipo: tipoInicial,
    descricao: "",
    origem: "",
    valor: 0,
    data_competencia: new Date().toISOString().slice(0, 10),
    data_vencimento: "",
    forma_pagamento: "pix",
    categoria_id: "",
    conta_id: "",
    status: "pendente",
    observacoes: "",
  };
}

function fromRow(row: LancamentoRow): FormState {
  return {
    tipo: row.tipo,
    descricao: row.descricao ?? "",
    origem: row.origem ?? "",
    valor: Number(row.valor ?? 0),
    data_competencia: row.data_competencia,
    data_vencimento: row.data_vencimento ?? "",
    forma_pagamento: row.forma_pagamento ?? "pix",
    categoria_id: row.categoria_id ?? "",
    conta_id: row.conta_id ?? "",
    status: (row.status === "pago" ? "pago" : "pendente") as
      | "pendente"
      | "pago",
    observacoes: row.observacoes ?? "",
  };
}

export function LancamentoDialog({
  open,
  onOpenChange,
  tipoInicial,
  lockTipo = true,
  editar,
}: Props) {
  const [form, setForm] = useState<FormState>(emptyState(tipoInicial));
  const contas = useContas();
  const criar = useCriarLancamento();
  const atualizar = useAtualizarLancamento();
  const isEdit = Boolean(editar);
  const pending = criar.isPending || atualizar.isPending;

  useEffect(() => {
    if (open) {
      if (editar) {
        setForm(fromRow(editar));
      } else {
        setForm((cur) => ({ ...emptyState(tipoInicial), tipo: tipoInicial }));
      }
    }
  }, [open, tipoInicial, editar]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.descricao.trim().length < 2 || form.valor <= 0) return;
    try {
      const payload = {
        tipo: form.tipo,
        descricao: form.descricao.trim(),
        origem: form.origem.trim() || null,
        valor: form.valor,
        data_competencia: form.data_competencia,
        data_vencimento: form.data_vencimento || null,
        forma_pagamento: form.forma_pagamento || null,
        categoria_id: form.categoria_id || null,
        conta_id: form.conta_id || null,
        status: form.status,
        observacoes: form.observacoes.trim() || null,
      };

      if (isEdit && editar) {
        await atualizar.mutateAsync({ id: editar.id, ...payload });
        toast.success("Lançamento atualizado.");
      } else {
        await criar.mutateAsync(payload);
        toast.success(
          form.tipo === "entrada"
            ? "Receita registrada."
            : "Despesa registrada.",
        );
      }

      setForm(emptyState(tipoInicial));
      onOpenChange(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Falha ao salvar lançamento.",
      );
    }
  }

  const title = isEdit
    ? form.tipo === "entrada"
      ? "Editar receita"
      : "Editar despesa"
    : form.tipo === "entrada"
      ? "Nova receita"
      : "Nova despesa";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-md">
          {!lockTipo && !isEdit ? (
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                value={form.descricao}
                onChange={(e) =>
                  setForm({ ...form, descricao: e.target.value })
                }
                required
                placeholder="Ex: Venda 1234, Aluguel"
              />
            </div>
            <div className="flex flex-col gap-xs">
              <Label htmlFor="origem">Origem</Label>
              <Input
                id="origem"
                value={form.origem}
                onChange={(e) =>
                  setForm({ ...form, origem: e.target.value })
                }
                placeholder={
                  form.tipo === "entrada"
                    ? "Cliente, venda balcão, indicação…"
                    : "Fornecedor, prestador, despesa fixa…"
                }
              />
            </div>
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
              <CategoriaCombobox
                tipo={form.tipo}
                value={form.categoria_id}
                onChange={(id) => setForm({ ...form, categoria_id: id })}
                placeholder="Selecione ou crie"
              />
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
                  <SelectItem value="pendente">Previsto</SelectItem>
                  <SelectItem value="pago">Realizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <Label htmlFor="conta_id">Conta</Label>
              <select
                id="conta_id"
                className="glass-input"
                value={form.conta_id}
                onChange={(e) =>
                  setForm({ ...form, conta_id: e.target.value })
                }
              >
                <option value="">Sem conta</option>
                {(contas.data ?? [])
                  .filter((c) => c.ativa)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
              </select>
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
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando…" : isEdit ? "Salvar alterações" : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
