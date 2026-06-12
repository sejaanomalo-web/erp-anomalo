"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/feedback/Toast";
import {
  type ContaRow,
  useSalvarConta,
  TIPO_CONTA_ROTULO,
} from "@/lib/queries/financeiro";

type TipoConta = ContaRow["tipo"];

const hojeISO = new Date().toISOString().slice(0, 10);

const TIPOS_CONTA: TipoConta[] = [
  "banco",
  "caixa",
  "cartao_credito",
  "investimento",
];

export function ContaDrawer({
  open,
  onOpenChange,
  editar,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  editar?: ContaRow | null;
}) {
  const salvar = useSalvarConta();
  const pending = salvar.isPending;

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<TipoConta>("banco");
  const [saldoInicial, setSaldoInicial] = useState("0");
  const [dataSaldoInicial, setDataSaldoInicial] = useState(hojeISO);
  const [ativa, setAtiva] = useState(true);

  useEffect(() => {
    if (!open) return;
    if (editar) {
      setNome(editar.nome);
      setTipo(editar.tipo);
      setSaldoInicial(String(editar.saldo_inicial ?? 0));
      setDataSaldoInicial(editar.data_saldo_inicial || hojeISO);
      setAtiva(editar.ativa);
    } else {
      setNome("");
      setTipo("banco");
      setSaldoInicial("0");
      setDataSaldoInicial(hojeISO);
      setAtiva(true);
    }
  }, [open, editar]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (nome.trim().length < 2) {
      toast.error("Informe um nome com pelo menos 2 caracteres.");
      return;
    }
    try {
      await salvar.mutateAsync({
        id: editar?.id,
        nome: nome.trim(),
        tipo,
        saldo_inicial: Number(saldoInicial),
        data_saldo_inicial: dataSaldoInicial,
        ativa,
        ordem: editar?.ordem ?? 0,
      });
      toast.success("Conta salva.");
      onOpenChange(false);
    } catch {
      toast.error("Erro ao salvar a conta.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editar ? "Editar conta" : "Nova conta"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-md">
          <div className="flex flex-col gap-xs">
            <Label htmlFor="conta-nome">Nome</Label>
            <Input
              id="conta-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Banco Inter"
              required
            />
          </div>

          <div className="flex flex-col gap-xs">
            <Label htmlFor="conta-tipo">Tipo</Label>
            <Select
              value={tipo}
              onValueChange={(v) => setTipo(v as TipoConta)}
            >
              <SelectTrigger id="conta-tipo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_CONTA.map((t) => (
                  <SelectItem key={t} value={t}>
                    {TIPO_CONTA_ROTULO[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-xs">
            <Label htmlFor="conta-saldo">Saldo inicial</Label>
            <Input
              id="conta-saldo"
              type="number"
              step="0.01"
              value={saldoInicial}
              onChange={(e) => setSaldoInicial(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-xs">
            <Label htmlFor="conta-data">Data do saldo inicial</Label>
            <Input
              id="conta-data"
              type="date"
              value={dataSaldoInicial}
              onChange={(e) => setDataSaldoInicial(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-sm">
            <input
              id="conta-ativa"
              type="checkbox"
              checked={ativa}
              onChange={(e) => setAtiva(e.target.checked)}
            />
            <Label htmlFor="conta-ativa">Conta ativa</Label>
          </div>

          {editar ? (
            <p className="text-text-3 text-caption">
              Saldo atual = saldo inicial + receitas realizadas − despesas
              realizadas.
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
