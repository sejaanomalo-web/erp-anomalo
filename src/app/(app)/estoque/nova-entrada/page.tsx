"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Hero } from "@/components/sections/Hero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/feedback/Toast";

export default function NovaEntradaPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 300));
    toast.success("Entrada registrada.");
    setSubmitting(false);
    router.push("/estoque/movimentacoes");
  }

  return (
    <div className="flex flex-col gap-2xl max-w-2xl">
      <Hero
        eyebrow="Almoxarifado"
        titulo="Nova entrada"
        descricao="Produto, quantidade e motivo."
      />
      <form onSubmit={onSubmit} className="flex flex-col gap-md">
        <div className="flex flex-col gap-xs">
          <Label htmlFor="item">Produto ou material</Label>
          <Input id="item" required placeholder="Buscar por nome ou SKU" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div className="flex flex-col gap-xs">
            <Label htmlFor="qtd">Quantidade</Label>
            <Input id="qtd" type="number" min={1} step="0.01" required />
          </div>
          <div className="flex flex-col gap-xs">
            <Label htmlFor="custo">Valor unitário</Label>
            <Input id="custo" type="number" min={0} step="0.01" />
          </div>
        </div>
        <div className="flex flex-col gap-xs">
          <Label htmlFor="motivo">Motivo</Label>
          <Textarea id="motivo" rows={3} placeholder="Compra fornecedor X, devolução, etc." />
        </div>
        <div className="flex items-center justify-end gap-sm">
          <Button variant="secondary" type="button" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Salvando…" : "Registrar entrada"}
          </Button>
        </div>
      </form>
    </div>
  );
}
