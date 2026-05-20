"use client";

import { Plus, Building2 } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/EmptyState";

export default function FornecedoresPage() {
  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Insumos"
        titulo="Fornecedores"
        descricao="Cadastro com histórico de compras por fornecedor."
        acoes={
          <Button>
            <Plus size={14} strokeWidth={1.8} />
            Novo fornecedor
          </Button>
        }
      />
      <EmptyState
        icone={Building2}
        titulo="Nenhum fornecedor cadastrado."
        descricao="Cadastre fornecedores para vincular às movimentações de estoque."
      />
    </div>
  );
}
