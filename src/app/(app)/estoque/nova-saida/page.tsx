"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Hero } from "@/components/sections/Hero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/feedback/Toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NovaSaidaPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 300));
    toast.success("Saída registrada.");
    setSubmitting(false);
    router.push("/estoque/movimentacoes");
  }

  return (
    <div className="flex flex-col gap-2xl max-w-2xl">
      <Hero
        eyebrow="Almoxarifado"
        titulo="Nova saída"
        descricao="Saída de produto, motivo e responsável."
      />
      <form onSubmit={onSubmit} className="flex flex-col gap-md">
        <div className="flex flex-col gap-xs">
          <Label htmlFor="item">Produto ou material</Label>
          <Input id="item" required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div className="flex flex-col gap-xs">
            <Label htmlFor="qtd">Quantidade</Label>
            <Input id="qtd" type="number" min={1} step="0.01" required />
          </div>
          <div className="flex flex-col gap-xs">
            <Label>Origem</Label>
            <Select defaultValue="venda">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="venda">Venda</SelectItem>
                <SelectItem value="producao">Produção</SelectItem>
                <SelectItem value="devolucao">Devolução</SelectItem>
                <SelectItem value="perda">Perda</SelectItem>
                <SelectItem value="ajuste_manual">Ajuste manual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-col gap-xs">
          <Label htmlFor="motivo">Observações</Label>
          <Textarea id="motivo" rows={3} />
        </div>
        <div className="flex items-center justify-end gap-sm">
          <Button variant="secondary" type="button" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Salvando…" : "Registrar saída"}
          </Button>
        </div>
      </form>
    </div>
  );
}
