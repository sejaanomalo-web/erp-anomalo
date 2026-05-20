"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titulo: string;
  descricao: string;
  variant?: "default" | "destructive";
  onConfirm: () => void | Promise<void>;
  textoConfirmar?: string;
  palavraConfirmacao?: string;
  carregando?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  titulo,
  descricao,
  variant = "default",
  onConfirm,
  textoConfirmar = "Confirmar",
  palavraConfirmacao,
  carregando,
}: ConfirmDialogProps) {
  const [palavra, setPalavra] = useState("");
  const habilitado = palavraConfirmacao
    ? palavra.trim().toUpperCase() === palavraConfirmacao.toUpperCase()
    : true;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setPalavra("");
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>{descricao}</DialogDescription>
        </DialogHeader>
        {palavraConfirmacao ? (
          <div className="flex flex-col gap-xs mt-md">
            <Label htmlFor="confirm-word">
              Digite {palavraConfirmacao} para confirmar
            </Label>
            <Input
              id="confirm-word"
              autoComplete="off"
              value={palavra}
              onChange={(e) => setPalavra(e.target.value)}
            />
          </div>
        ) : null}
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={carregando}
          >
            Cancelar
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={() => onConfirm()}
            disabled={!habilitado || carregando}
          >
            {carregando ? "Aguarde…" : textoConfirmar}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
