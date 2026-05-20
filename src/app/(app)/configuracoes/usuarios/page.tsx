"use client";

import { Plus, Mail } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/EmptyState";

export default function UsuariosPage() {
  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Sistema"
        titulo="Usuários"
        descricao="Convite, papéis e status. Cada convite expira em 7 dias."
        acoes={
          <Button>
            <Plus size={14} strokeWidth={1.8} />
            Convidar usuário
          </Button>
        }
      />
      <EmptyState
        icone={Mail}
        titulo="Nenhum usuário convidado ainda."
        descricao="O primeiro admin é criado direto no Supabase. A partir do segundo, use convite."
      />
    </div>
  );
}
