"use client";

import { MessageSquareText } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { EmptyState } from "@/components/feedback/EmptyState";

export default function InteracoesPage() {
  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Relacionamento"
        titulo="Interações"
        descricao="Timeline de ligações, WhatsApp, e-mails, visitas e reuniões."
      />
      <EmptyState
        icone={MessageSquareText}
        titulo="Nenhuma interação cadastrada."
        descricao="Toda interação registrada no perfil de cliente ou lead aparece aqui."
      />
    </div>
  );
}
