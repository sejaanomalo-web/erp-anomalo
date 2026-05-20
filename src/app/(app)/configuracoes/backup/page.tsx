"use client";

import { Download, HardDrive } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AUDIT_LOG_RETENTION_YEARS } from "@/lib/constants";

export default function BackupPage() {
  return (
    <div className="flex flex-col gap-2xl max-w-2xl">
      <Hero
        eyebrow="Sistema"
        titulo="Backup"
        descricao="Export manual e política de retenção."
      />
      <Card className="p-lg flex flex-col gap-md">
        <div className="flex items-start gap-md">
          <span className="h-10 w-10 flex items-center justify-center bg-surface-2 border border-border-thin">
            <HardDrive size={18} strokeWidth={1.8} className="text-text-2" />
          </span>
          <div className="flex flex-col gap-xs">
            <span className="text-body-md text-text-1">
              Export completo da empresa em JSON
            </span>
            <span className="text-body-sm text-text-3">
              Inclui clientes, vendas, produção, financeiro, materiais e estoque.
              Atende ao direito de portabilidade da LGPD.
            </span>
          </div>
        </div>
        <div className="flex justify-end">
          <Button>
            <Download size={14} strokeWidth={1.8} />
            Baixar export
          </Button>
        </div>
      </Card>
      <Card className="p-lg flex flex-col gap-sm">
        <span className="text-label-caps text-text-3">Retenção</span>
        <span className="text-body-md text-text-1">
          Audit log: {AUDIT_LOG_RETENTION_YEARS} anos.
        </span>
        <span className="text-body-sm text-text-3">
          Dados operacionais ficam no Supabase enquanto a empresa estiver ativa.
        </span>
      </Card>
    </div>
  );
}
