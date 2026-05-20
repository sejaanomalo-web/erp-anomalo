"use client";

import { Plus, Tag } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/EmptyState";

export default function CategoriasFinanceirasConfigPage() {
  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Sistema"
        titulo="Categorias financeiras"
        descricao="Mantenha a estrutura de receitas e despesas."
        acoes={
          <Button>
            <Plus size={14} strokeWidth={1.8} />
            Nova categoria
          </Button>
        }
      />
      <EmptyState
        icone={Tag}
        titulo="Nenhuma categoria criada."
        descricao="Categorias organizam o DRE e os relatórios financeiros."
      />
    </div>
  );
}
