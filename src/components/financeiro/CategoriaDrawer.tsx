"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/feedback/Toast";
import { CategoriaRow, useSalvarCategoria, TipoFin } from "@/lib/queries/financeiro";
import { mensagemErroSupabase } from "@/lib/errors";

const CORES = ["#E6D6C8", "#16a34a", "#22c55e", "#ef4444", "#eab308", "#3b82f6", "#a855f7"];

type Props = {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  editar?: CategoriaRow | null;
  tipoInicial?: TipoFin;
};

export function CategoriaDrawer({ open, onOpenChange, editar, tipoInicial }: Props) {
  const salvar = useSalvarCategoria();

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<TipoFin>("saida");
  const [cor, setCor] = useState("#E6D6C8");
  const [ativa, setAtiva] = useState(true);

  useEffect(() => {
    if (!open) return;
    setNome(editar?.nome ?? "");
    setTipo(editar?.tipo ?? tipoInicial ?? "saida");
    setCor(editar?.cor ?? "#E6D6C8");
    setAtiva(editar?.ativa ?? true);
  }, [open, editar, tipoInicial]);

  async function handleSubmit(e: React.FormEvent) {
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
        cor,
        ativa,
        ordem: editar?.ordem ?? 0,
      });
      toast.success("Categoria salva.");
      onOpenChange(false);
    } catch (err) {
      toast.error(mensagemErroSupabase(err, "Erro ao salvar a categoria."));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editar ? "Editar categoria" : "Nova categoria"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-md">
          <div className="flex flex-col gap-2">
            <Label>Tipo</Label>
            <div className="grid grid-cols-2 gap-md">
              <Button
                type="button"
                variant={tipo === "entrada" ? "default" : "secondary"}
                onClick={() => setTipo("entrada")}
              >
                Receita
              </Button>
              <Button
                type="button"
                variant={tipo === "saida" ? "default" : "secondary"}
                onClick={() => setTipo("saida")}
              >
                Despesa
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="categoria-nome">Nome</Label>
            <Input
              id="categoria-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Cor</Label>
            <div className="flex items-center gap-md">
              {CORES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCor(c)}
                  className={`h-7 w-7 rounded-md ${
                    cor === c ? "ring-2 ring-accent ring-offset-2 ring-offset-surface-1" : ""
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={c}
                />
              ))}
              <input
                type="color"
                value={cor}
                onChange={(e) => setCor(e.target.value)}
                className="h-7 w-7 cursor-pointer rounded-md border border-border-thin bg-transparent"
                aria-label="Cor personalizada"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={salvar.isPending}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
