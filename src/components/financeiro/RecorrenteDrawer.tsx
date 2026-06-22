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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoriaCombobox } from "@/components/financeiro/CategoriaCombobox";
import { toast } from "@/components/feedback/Toast";
import {
  useContas,
  useSalvarRecorrente,
  type RecorrenteRow,
} from "@/lib/queries/financeiro";
import { mensagemErroSupabase } from "@/lib/errors";

interface Props {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  editar?: RecorrenteRow | null;
}

type TipoFin = "entrada" | "saida";
type Periodicidade = "mensal" | "anual" | "semanal";

const hojeISO = new Date().toISOString().slice(0, 10);

export function RecorrenteDrawer({ open, onOpenChange, editar }: Props) {
  const salvar = useSalvarRecorrente();
  const contas = useContas();
  const isEdit = Boolean(editar);
  const pending = salvar.isPending;

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<TipoFin>("saida");
  const [valor, setValor] = useState<number>(0);
  const [categoria_id, setCategoriaId] = useState("");
  const [conta_id, setContaId] = useState("");
  const [periodicidade, setPeriodicidade] = useState<Periodicidade>("mensal");
  const [dia_vencimento, setDiaVencimento] = useState<number>(1);
  const [inicio, setInicio] = useState(hojeISO);
  const [fim, setFim] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    if (!open) return;
    if (editar) {
      setNome(editar.nome ?? "");
      setTipo(editar.tipo);
      setValor(Number(editar.valor ?? 0));
      setCategoriaId(editar.categoria_id ?? "");
      setContaId(editar.conta_id ?? "");
      setPeriodicidade(editar.periodicidade ?? "mensal");
      setDiaVencimento(Number(editar.dia_vencimento ?? 1));
      setInicio(editar.inicio ?? hojeISO);
      setFim(editar.fim ?? "");
      setAtivo(editar.ativo ?? true);
      setObservacoes(editar.observacoes ?? "");
    } else {
      setNome("");
      setTipo("saida");
      setValor(0);
      setCategoriaId("");
      setContaId("");
      setPeriodicidade("mensal");
      setDiaVencimento(1);
      setInicio(hojeISO);
      setFim("");
      setAtivo(true);
      setObservacoes("");
    }
  }, [open, editar]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await salvar.mutateAsync({
        id: editar?.id,
        nome: nome.trim(),
        tipo,
        valor: Number(valor),
        categoria_id: categoria_id || null,
        conta_id: conta_id || null,
        periodicidade,
        dia_vencimento: Number(dia_vencimento),
        inicio,
        fim: fim || null,
        ativo,
        observacoes: observacoes.trim() || null,
      });
      toast.success("Recorrente salvo.");
      onOpenChange(false);
    } catch (err) {
      toast.error(mensagemErroSupabase(err, "Falha ao salvar recorrente."));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar recorrente" : "Novo recorrente"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-md">
          <div className="flex items-center gap-xs">
            <Button
              type="button"
              size="sm"
              variant={tipo === "entrada" ? "default" : "secondary"}
              onClick={() => {
                setTipo("entrada");
                setCategoriaId("");
              }}
            >
              Receita
            </Button>
            <Button
              type="button"
              size="sm"
              variant={tipo === "saida" ? "default" : "secondary"}
              onClick={() => {
                setTipo("saida");
                setCategoriaId("");
              }}
            >
              Despesa
            </Button>
          </div>

          <div className="flex flex-col gap-xs">
            <Label htmlFor="rec-nome">Nome</Label>
            <Input
              id="rec-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              placeholder="Ex: Aluguel, Assinatura, Mensalidade"
            />
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <Label htmlFor="rec-valor">Valor</Label>
              <Input
                id="rec-valor"
                type="number"
                step="0.01"
                min={0}
                value={valor}
                onChange={(e) => setValor(Number(e.target.value))}
                required
              />
            </div>
            <div className="flex flex-col gap-xs">
              <Label>Categoria</Label>
              <CategoriaCombobox
                tipo={tipo}
                value={categoria_id}
                onChange={setCategoriaId}
                placeholder="Selecione ou crie"
              />
            </div>
          </div>

          <div className="flex flex-col gap-xs">
            <Label htmlFor="rec-conta">Conta</Label>
            <select
              id="rec-conta"
              className="glass-input"
              value={conta_id}
              onChange={(e) => setContaId(e.target.value)}
            >
              <option value="">Sem conta</option>
              {contas.data
                ?.filter((c) => c.ativa)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <Label>Periodicidade</Label>
              <Select
                value={periodicidade}
                onValueChange={(v) =>
                  setPeriodicidade(v as Periodicidade)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                  <SelectItem value="semanal">Semanal</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-body-sm text-text-3">
                Só recorrentes mensais são materializados automaticamente.
              </p>
            </div>
            <div className="flex flex-col gap-xs">
              <Label htmlFor="rec-dia">Dia de vencimento</Label>
              <Input
                id="rec-dia"
                type="number"
                min={1}
                max={31}
                value={dia_vencimento}
                onChange={(e) => setDiaVencimento(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <Label htmlFor="rec-inicio">Início</Label>
              <Input
                id="rec-inicio"
                type="date"
                value={inicio}
                onChange={(e) => setInicio(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-xs">
              <Label htmlFor="rec-fim">Fim (opcional)</Label>
              <Input
                id="rec-fim"
                type="date"
                value={fim}
                onChange={(e) => setFim(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-xs">
            <Checkbox
              id="rec-ativo"
              checked={ativo}
              onCheckedChange={(v) => setAtivo(v === true)}
            />
            <Label htmlFor="rec-ativo">Ativo</Label>
          </div>

          <div className="flex flex-col gap-xs">
            <Label htmlFor="rec-obs">Observações</Label>
            <Textarea
              id="rec-obs"
              rows={2}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
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
              {pending ? "Salvando…" : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
