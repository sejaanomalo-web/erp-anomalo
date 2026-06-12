"use client";

import { useState } from "react";
import { Plus, Repeat } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { FinanceiroNav } from "@/components/financeiro/FinanceiroNav";
import { RecorrenteDrawer } from "@/components/financeiro/RecorrenteDrawer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/EmptyState";
import { toast } from "@/components/feedback/Toast";
import { usePeriodo } from "@/hooks/usePeriodo";
import { cn, formatCurrency } from "@/lib/utils";
import {
  useRecorrentes,
  useGerarRecorrentes,
  tipoRotulo,
  TIPO_CONTA_ROTULO,
  type RecorrenteRow,
} from "@/lib/queries/financeiro";

export default function RecorrentesPage() {
  const { periodo } = usePeriodo();
  const recs = useRecorrentes();
  const gerar = useGerarRecorrentes();

  const [open, setOpen] = useState(false);
  const [editar, setEditar] = useState<RecorrenteRow | null>(null);

  const lista = recs.data ?? [];

  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Financeiro · Recorrentes"
        titulo="Pagamentos recorrentes"
        descricao="Templates que geram lançamentos automaticamente (aluguel, plataformas, salários)."
        acoes={
          <>
            <Button
              variant="outline"
              disabled={gerar.isPending}
              onClick={async () => {
                const n = await gerar.mutateAsync({ mes: periodo.mes, ano: periodo.ano });
                toast.success(`${n} lançamento(s) gerado(s) em ${periodo.rotulo}.`);
              }}
            >
              Gerar lançamentos de {periodo.rotulo}
            </Button>
            <Button
              onClick={() => {
                setEditar(null);
                setOpen(true);
              }}
            >
              <Plus size={16} /> Novo recorrente
            </Button>
          </>
        }
      />

      <FinanceiroNav />

      {lista.length === 0 ? (
        <EmptyState
          icone={Repeat}
          titulo="Nenhum recorrente"
          descricao="Cadastre pagamentos que se repetem todo mês."
          acao={
            <Button
              onClick={() => {
                setEditar(null);
                setOpen(true);
              }}
            >
              Novo recorrente
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {lista.map((r) => (
            <Card
              key={r.id}
              hover
              className={cn("p-lg flex flex-col gap-2 cursor-pointer", !r.ativo && "opacity-60")}
              onClick={() => {
                setEditar(r);
                setOpen(true);
              }}
            >
              <span className="text-caption text-text-3">
                {tipoRotulo(r.tipo) === "Despesa" ? "DESPESA" : "RECEITA"} ·{" "}
                {r.periodicidade.toUpperCase()}
                {r.dia_vencimento ? ` · DIA ${r.dia_vencimento}` : ""}
              </span>
              <p className="text-h4 text-text-1">{r.nome}</p>
              <p className="text-h3 tabular-nums text-text-1">{formatCurrency(r.valor)}</p>
              <p className="text-caption text-text-3">
                {!r.ativo
                  ? "Inativo"
                  : r.fim
                    ? `Até ${r.fim.split("-").reverse().join("/")}`
                    : "Sem fim"}
              </p>
            </Card>
          ))}
        </div>
      )}

      <RecorrenteDrawer open={open} onOpenChange={setOpen} editar={editar} />
    </div>
  );
}
