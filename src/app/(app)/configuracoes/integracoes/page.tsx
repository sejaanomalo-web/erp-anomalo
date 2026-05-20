"use client";

import { Plug } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { EmptyState } from "@/components/feedback/EmptyState";

export default function IntegracoesPage() {
  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Sistema"
        titulo="Integrações"
        descricao="Webhooks, SMTP customizado e monitoramento."
      />
      <EmptyState
        icone={Plug}
        titulo="Nenhuma integração ativa."
        descricao="Resend (e-mail) e Sentry (erros) vêm configurados via variáveis de ambiente."
      />
    </div>
  );
}
