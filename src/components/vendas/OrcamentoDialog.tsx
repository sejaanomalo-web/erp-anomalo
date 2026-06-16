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
import { toast } from "@/components/feedback/Toast";
import { useMeuPerfil, useVendedores } from "@/lib/queries/profiles";
import { useCriarOrcamento } from "@/lib/queries/orcamentos";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormState {
  cliente_nome: string;
  telefone: string;
  endereco: string;
  dia: string;
  horario: string;
  vendedor_id: string;
  observacoes: string;
}

function emptyState(): FormState {
  return {
    cliente_nome: "",
    telefone: "",
    endereco: "",
    dia: new Date().toISOString().slice(0, 10),
    horario: "09:00",
    vendedor_id: "",
    observacoes: "",
  };
}

export function OrcamentoDialog({ open, onOpenChange }: Props) {
  const [form, setForm] = useState<FormState>(emptyState());
  const perfil = useMeuPerfil();
  const vendedores = useVendedores();
  const criar = useCriarOrcamento();

  const podeEscolherVendedor =
    perfil.data?.papel === "admin" || perfil.data?.papel === "gestor";

  useEffect(() => {
    if (open) {
      setForm({ ...emptyState(), vendedor_id: perfil.data?.id ?? "" });
    }
  }, [open, perfil.data?.id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      form.cliente_nome.trim().length < 2 ||
      form.telefone.replace(/\D/g, "").length < 8 ||
      !form.dia ||
      !form.horario
    ) {
      toast.error("Preencha nome, telefone, dia e horário.");
      return;
    }
    try {
      const resp = await criar.mutateAsync({
        cliente_nome: form.cliente_nome.trim(),
        telefone: form.telefone.trim(),
        endereco: form.endereco.trim() || "",
        dia: form.dia,
        horario: form.horario,
        // Só envia vendedor explícito quem pode escolher; senão o servidor usa o autor.
        vendedor_id: podeEscolherVendedor ? form.vendedor_id || null : null,
        observacoes: form.observacoes.trim() || "",
      });

      if (resp.agenda_status === "sincronizado") {
        toast.success("Orçamento agendado e enviado ao Google Agenda.");
      } else if (resp.agenda_status === "erro") {
        toast.success(
          "Orçamento agendado. A sincronização com o Google falhou; tente em /agenda.",
        );
      } else {
        toast.success(
          resp.google_conectado
            ? "Orçamento agendado."
            : "Orçamento agendado. Conecte o Google Agenda em /agenda para sincronizar.",
        );
      }

      setForm(emptyState());
      onOpenChange(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Falha ao registrar orçamento.",
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo orçamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-md">
          <div className="flex flex-col gap-xs">
            <Label htmlFor="cliente_nome">Nome do cliente</Label>
            <Input
              id="cliente_nome"
              value={form.cliente_nome}
              onChange={(e) =>
                setForm({ ...form, cliente_nome: e.target.value })
              }
              placeholder="Nome completo"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <Label htmlFor="dia">Dia</Label>
              <Input
                id="dia"
                type="date"
                value={form.dia}
                onChange={(e) => setForm({ ...form, dia: e.target.value })}
                required
              />
            </div>
            <div className="flex flex-col gap-xs">
              <Label htmlFor="horario">Horário</Label>
              <Input
                id="horario"
                type="time"
                value={form.horario}
                onChange={(e) => setForm({ ...form, horario: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-xs">
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              type="tel"
              value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
              placeholder="(00) 00000-0000"
              required
            />
          </div>

          <div className="flex flex-col gap-xs">
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              value={form.endereco}
              onChange={(e) => setForm({ ...form, endereco: e.target.value })}
              placeholder="Rua, número, bairro, cidade"
            />
          </div>

          {podeEscolherVendedor ? (
            <div className="flex flex-col gap-xs">
              <Label>Vendedor</Label>
              <Select
                value={form.vendedor_id}
                onValueChange={(v) => setForm({ ...form, vendedor_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o vendedor" />
                </SelectTrigger>
                <SelectContent>
                  {(vendedores.data ?? []).map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="flex flex-col gap-xs">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              rows={2}
              value={form.observacoes}
              onChange={(e) =>
                setForm({ ...form, observacoes: e.target.value })
              }
              placeholder="Opcional"
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
              {criar.isPending ? "Agendando…" : "Agendar orçamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
