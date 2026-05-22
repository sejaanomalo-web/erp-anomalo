"use client";

import Link from "next/link";
import { Users, ArrowRight, MessageSquareText, Wallet } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { KPICard } from "@/components/sections/KPICard";
import { Card } from "@/components/ui/card";
import { LoadingState } from "@/components/feedback/LoadingState";
import { useClientes } from "@/lib/queries/clientes";
import { useVendas } from "@/lib/queries/vendas";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function CrmPage() {
  const clientes = useClientes();
  const vendas = useVendas();

  const totalClientes = clientes.data?.length ?? 0;
  const totalOrcamentos = (vendas.data ?? []).filter(
    (v) => v.tipo === "orcamento",
  ).length;
  const totalVendas = (vendas.data ?? []).filter((v) => v.tipo === "venda");
  const ticketMedio =
    totalVendas.length > 0
      ? totalVendas.reduce((acc, v) => acc + Number(v.valor_total), 0) /
        totalVendas.length
      : 0;

  const ultimas = (vendas.data ?? []).slice(0, 6);

  if (clientes.isLoading || vendas.isLoading) {
    return (
      <div className="flex flex-col gap-2xl">
        <Hero
          eyebrow="Relacionamento"
          titulo="CRM"
          descricao="Clientes vindos das vendas e visão de relacionamento."
        />
        <LoadingState linhas={6} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3xl">
      <Hero
        eyebrow="Relacionamento"
        titulo="CRM"
        descricao="Cada cliente entra automaticamente quando uma venda ou orçamento é registrado."
      />

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-md">
        <KPICard
          label="Clientes cadastrados"
          valor={totalClientes}
          icone={<Users size={16} strokeWidth={1.8} />}
        />
        <KPICard
          label="Orçamentos abertos"
          valor={totalOrcamentos}
          icone={<MessageSquareText size={16} strokeWidth={1.8} />}
        />
        <KPICard
          label="Vendas fechadas"
          valor={totalVendas.length}
          icone={<Wallet size={16} strokeWidth={1.8} />}
        />
        <KPICard
          label="Ticket médio"
          valor={ticketMedio}
          formato="moeda"
        />
      </section>

      <section className="flex flex-col gap-md">
        <div className="flex items-center justify-between gap-md">
          <span className="text-label-caps text-text-3">
            Últimas movimentações
          </span>
          <Link
            href="/crm/clientes"
            className="text-body-sm text-text-3 hover:text-accent inline-flex items-center gap-xs"
          >
            Ver todos os clientes
            <ArrowRight size={14} strokeWidth={1.8} />
          </Link>
        </div>
        <Card className="divide-y divide-border-thin">
          {ultimas.length === 0 ? (
            <div className="p-lg text-body-sm text-text-3">
              Nenhuma venda ou orçamento registrado ainda.
            </div>
          ) : (
            ultimas.map((venda) => (
              <Link
                href={`/vendas/${venda.id}`}
                key={venda.id}
                className="flex items-center justify-between gap-md p-md hover:bg-surface-2 transition-colors duration-fast"
              >
                <div className="flex flex-col gap-xxs min-w-0">
                  <span className="text-body-md text-text-1 truncate">
                    {venda.cliente?.nome ?? "Cliente sem nome"}
                  </span>
                  <span className="text-body-sm text-text-3">
                    {venda.tipo === "orcamento" ? "Orçamento" : "Venda"} #
                    {venda.numero} · {formatDate(venda.data_venda)}
                  </span>
                </div>
                <span className="text-body-md tabular-nums text-text-1">
                  {formatCurrency(Number(venda.valor_total))}
                </span>
              </Link>
            ))
          )}
        </Card>
      </section>
    </div>
  );
}
