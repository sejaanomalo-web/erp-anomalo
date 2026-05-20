"use client";

import { Plus, Tag } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/EmptyState";

export default function CategoriasFinanceirasPage() {
  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Financeiro"
        titulo="Categorias"
        descricao="Estrutura customizada de categorias de entrada e saída."
        acoes={
          <Button>
            <Plus size={14} strokeWidth={1.8} />
            Nova categoria
          </Button>
        }
      />
      <EmptyState
        icone={Tag}
        titulo="Crie sua primeira categoria."
        descricao="Categorias organizam o DRE e os relatórios."
      />
    </div>
  );
}
