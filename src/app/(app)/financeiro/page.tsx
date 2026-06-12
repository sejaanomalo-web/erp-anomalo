"use client";

import { DollarSign, ArrowUpRight, ArrowDownRight, Scale, Wallet, Receipt } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Hero } from "@/components/sections/Hero";
import { FinanceiroNav } from "@/components/financeiro/FinanceiroNav";
import { GraficoFluxoCaixa } from "@/components/financeiro/GraficoFluxoCaixa";
import { EmptyState } from "@/components/feedback/EmptyState";
import { usePeriodo } from "@/hooks/usePeriodo";
import { formatCurrency } from "@/lib/utils";
import {
  useResumoFinanceiro,
  useSaldoPorConta,
  useFluxoCaixaAnual,
  useVencimentosAbertos,
  TIPO_CONTA_ROTULO,
} from "@/lib/queries/financeiro";

const fmtData = (iso: string) => (iso ? iso.split("-").reverse().join("/") : "");

export default function FinanceiroPage() {
  const { periodo } = usePeriodo();
  const resumo = useResumoFinanceiro(periodo.de, periodo.ate);
  const saldos = useSaldoPorConta();
  const fluxo = useFluxoCaixaAnual(periodo.ano);
  const vencimentos = useVencimentosAbertos(6);

  const r = resumo.data;
  const saldoTotal = (saldos.data ?? []).reduce((s, x) => s + x.saldo_atual, 0);

  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Financeiro"
        titulo={`Caixa · ${periodo.rotulo}`}
        descricao="Receitas, despesas, recorrentes e fluxo de caixa da Aton."
      />

      <FinanceiroNav />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
        <Card className="p-lg flex flex-col gap-md">
          <div className="flex items-start justify-between">
            <span className="text-body-sm text-text-3">Saldo total</span>
            <span className="rounded-full bg-[rgba(22,163,74,0.12)] p-2 text-success">
              <DollarSign size={16} />
            </span>
          </div>
          <span className={"text-display tabular-nums " + (saldoTotal >= 0 ? "text-text-1" : "text-error")}>
            {formatCurrency(saldoTotal)}
          </span>
          <span className="text-body-sm text-text-3">{(saldos.data?.length ?? 0)} conta(s)</span>
        </Card>

        <Card className="p-lg flex flex-col gap-md">
          <div className="flex items-start justify-between">
            <span className="text-body-sm text-text-3">Receitas</span>
            <span className="rounded-full bg-[rgba(22,163,74,0.12)] p-2 text-success">
              <ArrowUpRight size={16} />
            </span>
          </div>
          <span className="text-display tabular-nums text-text-1">
            {formatCurrency(r?.total_receitas ?? 0)}
          </span>
          <span className="text-body-sm text-text-3">
            {(r?.receitas_previstas ?? 0) > 0
              ? `+ ${formatCurrency(r!.receitas_previstas)} previsto`
              : "Nenhuma receita realizada"}
          </span>
        </Card>

        <Card className="p-lg flex flex-col gap-md">
          <div className="flex items-start justify-between">
            <span className="text-body-sm text-text-3">Despesas</span>
            <span className="rounded-full bg-[rgba(239,68,68,0.12)] p-2 text-error">
              <ArrowDownRight size={16} />
            </span>
          </div>
          <span className="text-display tabular-nums text-text-1">
            {formatCurrency(r?.total_despesas ?? 0)}
          </span>
          <span className="text-body-sm text-text-3">
            {(r?.despesas_previstas ?? 0) > 0
              ? `+ ${formatCurrency(r!.despesas_previstas)} previsto`
              : "Sem despesas"}
          </span>
        </Card>

        <Card className="p-lg flex flex-col gap-md">
          <div className="flex items-start justify-between">
            <span className="text-body-sm text-text-3">Resultado</span>
            <span className="rounded-full bg-[rgba(201,149,58,0.12)] p-2 text-accent">
              <Scale size={16} />
            </span>
          </div>
          <span className={"text-display tabular-nums " + ((r?.resultado ?? 0) >= 0 ? "text-text-1" : "text-error")}>
            {formatCurrency(r?.resultado ?? 0)}
          </span>
          <span className="text-body-sm text-text-3">{r?.qtd_lancamentos ?? 0} lançamentos</span>
        </Card>
      </div>

      <Card className="p-lg flex flex-col gap-lg">
        <div className="flex flex-col gap-1">
          <span className="text-label-caps text-text-3">Fluxo de caixa · {periodo.ano}</span>
          <h3 className="text-h3 text-text-1">Receitas, despesas e resultado mensal</h3>
        </div>
        <GraficoFluxoCaixa dados={fluxo.data ?? []} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Card className="p-lg flex flex-col gap-md">
          <h3 className="text-h4 text-text-1">Saldo por conta</h3>
          {(saldos.data ?? []).length === 0 ? (
            <EmptyState
              icone={Wallet}
              titulo="Nenhuma conta"
              descricao="Cadastre uma conta para acompanhar o saldo."
            />
          ) : (
            (saldos.data ?? []).map((s) => (
              <div
                key={s.conta.id}
                className="flex justify-between border-b border-border-thin py-2"
              >
                <div>
                  <p className="text-text-1">{s.conta.nome}</p>
                  <p className="text-caption text-text-3">{TIPO_CONTA_ROTULO[s.conta.tipo]}</p>
                </div>
                <span
                  className={"text-body-md tabular-nums " + (s.saldo_atual >= 0 ? "text-success" : "text-error")}
                >
                  {formatCurrency(s.saldo_atual)}
                </span>
              </div>
            ))
          )}
        </Card>

        <Card className="p-lg flex flex-col gap-md">
          <h3 className="text-h4 text-text-1">Vencimentos em aberto</h3>
          {(vencimentos.data ?? []).length === 0 ? (
            <EmptyState icone={Receipt} titulo="Nada a vencer" />
          ) : (
            (vencimentos.data ?? []).map((l) => (
              <div key={l.id} className="flex justify-between border-b border-border-thin py-2">
                <div>
                  <p className="text-text-1">{l.descricao}</p>
                  <p className="text-caption text-text-3">
                    {fmtData(l.data_vencimento || l.data_competencia)} · {l.categoria?.nome ?? "Sem categoria"}
                  </p>
                </div>
                <span
                  className={"tabular-nums " + (l.tipo === "entrada" ? "text-success" : "text-error")}
                >
                  {l.tipo === "saida" ? "− " : ""}
                  {formatCurrency(l.valor)}
                </span>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
}
