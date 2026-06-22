"use client";

import { useState } from "react";
import { Plus, Landmark } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Hero } from "@/components/sections/Hero";
import { FinanceiroNav } from "@/components/financeiro/FinanceiroNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/EmptyState";
import { toast } from "@/components/feedback/Toast";
import { ContaDrawer } from "@/components/financeiro/ContaDrawer";
import {
  useSaldoPorConta,
  useExcluirConta,
  TIPO_CONTA_ROTULO,
  type ContaRow,
} from "@/lib/queries/financeiro";
import { mensagemErroSupabase } from "@/lib/errors";

export default function ContasPage() {
  const saldos = useSaldoPorConta();
  const excluir = useExcluirConta();
  const [open, setOpen] = useState(false);
  const [editar, setEditar] = useState<ContaRow | null>(null);

  const lista = saldos.data ?? [];

  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Financeiro · Contas"
        titulo="Contas"
        descricao="Banco, caixa, cartões e investimentos. Saldo atual = inicial + receitas realizadas − despesas realizadas."
        acoes={
          <Button
            onClick={() => {
              setEditar(null);
              setOpen(true);
            }}
          >
            <Plus size={16} /> Nova conta
          </Button>
        }
      />

      <FinanceiroNav />

      {lista.length === 0 ? (
        <EmptyState
          icone={Landmark}
          titulo="Nenhuma conta"
          descricao="Cadastre suas contas bancárias e caixas."
          acao={
            <Button
              onClick={() => {
                setEditar(null);
                setOpen(true);
              }}
            >
              Nova conta
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {lista.map((s) => (
            <Card
              key={s.conta.id}
              hover
              className={cn(
                "p-lg flex flex-col gap-2 cursor-pointer",
                !s.conta.ativa && "opacity-60",
              )}
              onClick={() => {
                setEditar(s.conta);
                setOpen(true);
              }}
            >
              <span className="text-caption text-text-3">
                {TIPO_CONTA_ROTULO[s.conta.tipo]}
              </span>
              <p className="text-h4 text-text-1">{s.conta.nome}</p>
              <p
                className={cn(
                  "text-h2 tabular-nums",
                  s.saldo_atual >= 0 ? "text-text-1" : "text-error",
                )}
              >
                {formatCurrency(s.saldo_atual)}
              </p>
              <p className="text-caption text-text-3">
                Saldo inicial: {formatCurrency(s.conta.saldo_inicial)}
              </p>
              <div
                className="mt-2 flex justify-end gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditar(s.conta);
                    setOpen(true);
                  }}
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={excluir.isPending}
                  onClick={async () => {
                    if (!confirm(`Excluir a conta "${s.conta.nome}"?`)) return;
                    try {
                      await excluir.mutateAsync(s.conta.id);
                      toast.success("Conta excluída.");
                    } catch (err) {
                      toast.error(
                        mensagemErroSupabase(
                          err,
                          "Não foi possível excluir. A conta pode estar em uso.",
                        ),
                      );
                    }
                  }}
                >
                  Excluir
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ContaDrawer open={open} onOpenChange={setOpen} editar={editar} />
    </div>
  );
}
