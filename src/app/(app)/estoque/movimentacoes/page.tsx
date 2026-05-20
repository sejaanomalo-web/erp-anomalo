import { ArrowDown, ArrowUp } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Package } from "lucide-react";

export default function MovimentacoesPage() {
  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Almoxarifado"
        titulo="Movimentações"
        descricao="Histórico completo de entradas e saídas."
      />
      <div className="grid grid-cols-2 gap-md">
        <Card className="p-md flex items-center gap-md">
          <span className="h-10 w-10 inline-flex items-center justify-center bg-[rgba(22,163,74,0.12)] text-success border border-[rgba(22,163,74,0.30)]">
            <ArrowDown size={18} strokeWidth={1.8} />
          </span>
          <div className="flex flex-col">
            <span className="text-label-caps text-text-3">Entradas no mês</span>
            <span className="text-h3 tabular-nums text-text-1">0</span>
          </div>
        </Card>
        <Card className="p-md flex items-center gap-md">
          <span className="h-10 w-10 inline-flex items-center justify-center bg-[rgba(239,68,68,0.12)] text-error border border-[rgba(239,68,68,0.30)]">
            <ArrowUp size={18} strokeWidth={1.8} />
          </span>
          <div className="flex flex-col">
            <span className="text-label-caps text-text-3">Saídas no mês</span>
            <span className="text-h3 tabular-nums text-text-1">0</span>
          </div>
        </Card>
      </div>
      <EmptyState
        icone={Package}
        titulo="Sem movimentações registradas."
        descricao="Quando o Supabase estiver conectado, todas as entradas e saídas aparecem aqui."
      />
      <div className="flex justify-center">
        <Badge tone="muted">Aguardando integração</Badge>
      </div>
    </div>
  );
}
