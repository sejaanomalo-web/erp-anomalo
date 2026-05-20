"use client";

import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const PREFS = [
  { id: "estoque_critico", titulo: "Estoque crítico" },
  { id: "prazo_aproximando", titulo: "Prazo se aproximando" },
  { id: "conta_atrasada", titulo: "Conta atrasada" },
  { id: "venda_fechada", titulo: "Venda fechada por vendedor" },
  { id: "status_producao", titulo: "Atualização de status de produção" },
];

export default function NotificacoesPrefsPage() {
  return (
    <div className="flex flex-col gap-2xl max-w-2xl">
      <Hero
        eyebrow="Sistema"
        titulo="Notificações"
        descricao="Para cada evento, decida onde quer ser avisado."
      />
      <Card className="divide-y divide-border-thin">
        {PREFS.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-md p-md">
            <span className="text-body-md text-text-1">{p.titulo}</span>
            <div className="flex items-center gap-lg">
              <div className="flex items-center gap-xs">
                <span className="text-body-sm text-text-3">In-app</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center gap-xs">
                <span className="text-body-sm text-text-3">E-mail</span>
                <Switch />
              </div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
