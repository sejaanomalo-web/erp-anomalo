"use client";

import { Plus } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/EmptyState";
import { TrendingUp } from "lucide-react";

export default function EntradasPage() {
  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Financeiro"
        titulo="Entradas"
        descricao="Receitas registradas no período."
        acoes={
          <Button>
            <Plus size={14} strokeWidth={1.8} />
            Novo lançamento
          </Button>
        }
      />
      <EmptyState
        icone={TrendingUp}
        titulo="Nenhuma entrada ainda."
        descricao="As receitas aparecem aqui após o Supabase estar conectado."
      />
    </div>
  );
}
