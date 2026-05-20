"use client";

import { FileSearch } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { EmptyState } from "@/components/feedback/EmptyState";
import { AUDIT_LOG_RETENTION_YEARS } from "@/lib/constants";

export default function AuditoriaPage() {
  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Sistema"
        titulo="Auditoria"
        descricao={`Log de ações críticas. Retenção: ${AUDIT_LOG_RETENTION_YEARS} anos.`}
      />
      <EmptyState
        icone={FileSearch}
        titulo="Sem eventos por enquanto."
        descricao="Toda criação, edição e exclusão crítica passa por aqui."
      />
    </div>
  );
}
