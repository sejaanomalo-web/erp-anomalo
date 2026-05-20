"use client";

import {
  ArrowRight,
  Hammer,
  Package,
  ShoppingCart,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Hero } from "@/components/sections/Hero";
import { KPICard } from "@/components/sections/KPICard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { VendaStatusBadge } from "@/components/tables/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  useDashboardAlertas,
  useDashboardKpis,
  useFaturamentoSerie,
  useProximasEntregas,
} from "@/lib/queries/dashboard";

export default function DashboardPage() {
  const kpis = useDashboardKpis();
  const faturamento = useFaturamentoSerie();
  const proximas = useProximasEntregas();
  const alertas = useDashboardAlertas();

  return (
    <div className="flex flex-col gap-3xl">
      <Hero
        eyebrow="Visão geral"
        titulo="Dashboard"
        descricao="Resumo do que está em jogo agora."
      />

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-md">
        {kpis.isLoading ? (
          <>
            <Skeleton className="h-[160px]" />
            <Skeleton className="h-[160px]" />
            <Skeleton className="h-[160px]" />
            <Skeleton className="h-[160px]" />
          </>
        ) : (
          <>
            <KPICard
              label="Faturamento do mês"
              valor={kpis.data?.faturamentoMes ?? 0}
              formato="moeda"
              icone={<Wallet size={16} strokeWidth={1.8} />}
            />
            <KPICard
              label="Vendas em produção"
              valor={kpis.data?.vendasEmProducao ?? 0}
              icone={<Hammer size={16} strokeWidth={1.8} />}
            />
            <KPICard
              label="A entregar"
              valor={kpis.data?.vendasAEntregar ?? 0}
              icone={<ShoppingCart size={16} strokeWidth={1.8} />}
            />
            <KPICard
              label="Estoque crítico"
              valor={kpis.data?.estoqueCritico ?? 0}
              icone={<Package size={16} strokeWidth={1.8} />}
            />
          </>
        )}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-md">
        <Card className="lg:col-span-2 p-lg flex flex-col gap-md">
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-xs">
              <span className="text-label-caps text-text-3">Faturamento</span>
              <span className="text-h3 text-text-1">Últimos 12 meses</span>
            </div>
            <Link
              href="/financeiro"
              className="text-body-sm text-text-3 hover:text-accent inline-flex items-center gap-xs"
            >
              Ver financeiro
              <ArrowRight size={14} strokeWidth={1.8} />
            </Link>
          </div>
          <div className="h-72 w-full">
            {faturamento.isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={faturamento.data ?? []}>
                  <CartesianGrid
                    vertical={false}
                    stroke="rgba(255,255,255,0.04)"
                    strokeDasharray="2 4"
                  />
                  <XAxis
                    dataKey="mes"
                    stroke="var(--text-3)"
                    fontSize={11}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="var(--text-3)"
                    fontSize={11}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) =>
                      new Intl.NumberFormat("pt-BR", {
                        notation: "compact",
                        compactDisplay: "short",
                      }).format(v as number)
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--surface-3)",
                      border: "1px solid var(--border-thin)",
                      borderRadius: 0,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "var(--text-3)" }}
                    formatter={(v) => formatCurrency(Number(v))}
                  />
                  <Line
                    type="monotone"
                    dataKey="valor"
                    stroke="var(--accent)"
                    strokeWidth={2}
                    dot={{
                      r: 3,
                      fill: "var(--accent)",
                      stroke: "var(--surface-1)",
                      strokeWidth: 2,
                    }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-lg flex flex-col gap-md">
          <div className="flex items-center justify-between">
            <span className="text-label-caps text-text-3">Alertas</span>
            <span className="text-body-sm text-text-3 tabular-nums">
              {alertas.data?.length ?? 0}
            </span>
          </div>
          {alertas.isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (alertas.data?.length ?? 0) === 0 ? (
            <p className="text-body-sm text-text-3">Nada urgente no momento.</p>
          ) : (
            <ul className="flex flex-col gap-sm">
              {alertas.data?.map((alerta) => (
                <li
                  key={alerta.id}
                  className="border-l-2 pl-sm flex flex-col gap-xxs"
                  style={{
                    borderColor:
                      alerta.severidade === "error"
                        ? "var(--error)"
                        : "var(--warning)",
                  }}
                >
                  <div className="flex items-center justify-between gap-sm">
                    <span className="text-body-md text-text-1">
                      {alerta.titulo}
                    </span>
                    <Badge tone={alerta.severidade}>{alerta.severidade}</Badge>
                  </div>
                  <span className="text-body-sm text-text-3">
                    {alerta.descricao}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <section className="flex flex-col gap-md">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-xs">
            <span className="text-label-caps text-text-3">Próximas entregas</span>
            <h2 className="text-h2 text-text-1">Próximas entregas</h2>
          </div>
          <Link
            href="/vendas/calendario"
            className="text-body-sm text-text-3 hover:text-accent inline-flex items-center gap-xs"
          >
            Ver calendário
            <ArrowRight size={14} strokeWidth={1.8} />
          </Link>
        </div>
        {proximas.isLoading ? (
          <div className="flex gap-md overflow-x-auto -mx-md px-md pb-xs">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 min-w-[280px] w-[280px]" />
            ))}
          </div>
        ) : (proximas.data?.length ?? 0) === 0 ? (
          <Card className="p-lg">
            <p className="text-body-sm text-text-3">
              Nenhuma entrega pendente.
            </p>
          </Card>
        ) : (
          <div className="flex gap-md overflow-x-auto scrollbar-thin -mx-md px-md pb-xs">
            {proximas.data?.map((entrega) => (
              <Link
                key={entrega.id}
                href={`/vendas/${entrega.id}`}
                className="solid-surface solid-surface-hover p-md min-w-[280px] w-[280px] shrink-0 flex flex-col gap-sm"
              >
                <div className="flex items-center justify-between gap-sm">
                  <span className="text-label-caps text-text-3">
                    #{entrega.numero}
                  </span>
                  <VendaStatusBadge status={entrega.status} />
                </div>
                <span className="text-body-md text-text-1">{entrega.cliente}</span>
                <span className="text-caption text-text-4 mt-auto">
                  Entrega {formatDate(entrega.data_prevista_entrega)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Card className="p-lg flex flex-col gap-md">
          <span className="text-label-caps text-text-3">Atalhos</span>
          <div className="grid grid-cols-2 gap-sm">
            {[
              { href: "/vendas/nova", label: "Nova venda" },
              { href: "/estoque/nova-entrada", label: "Entrada de estoque" },
              { href: "/financeiro/entradas", label: "Lançar receita" },
              { href: "/crm/clientes", label: "Clientes" },
            ].map((atalho) => (
              <Link
                key={atalho.href}
                href={atalho.href}
                className="solid-surface solid-surface-hover p-md text-body-md text-text-1 flex items-center justify-between gap-sm"
              >
                {atalho.label}
                <ArrowRight size={14} strokeWidth={1.8} className="text-text-3" />
              </Link>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
