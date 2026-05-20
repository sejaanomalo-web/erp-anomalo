"use client";

import { Plus, TrendingDown } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/EmptyState";

export default function SaidasPage() {
  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Financeiro"
        titulo="Saídas"
        descricao="Despesas registradas no período."
        acoes={
          <Button>
            <Plus size={14} strokeWidth={1.8} />
            Novo lançamento
          </Button>
        }
      />
      <EmptyState
        icone={TrendingDown}
        titulo="Nenhuma saída ainda."
        descricao="As despesas aparecem aqui após o Supabase estar conectado."
      />
    </div>
  );
}
