"use client";

import { Hero } from "@/components/sections/Hero";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Receipt } from "lucide-react";

export default function ContasAReceberPage() {
  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Financeiro"
        titulo="Contas a receber"
        descricao="Vendas parceladas e títulos em aberto."
      />
      <EmptyState
        icone={Receipt}
        titulo="Nenhuma conta a receber."
        descricao="As parcelas geradas a partir de vendas aparecem aqui."
      />
    </div>
  );
}
