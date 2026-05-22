"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { KPICard } from "@/components/sections/KPICard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LoadingState } from "@/components/feedback/LoadingState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { UserCog } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { useVendedor } from "@/lib/queries/vendedoresAdmin";
import { initials, formatCurrency, formatDate } from "@/lib/utils";
import { VENDA_TIPO_LABEL, VENDA_TIPO_TONE } from "@/lib/constants";

interface AgrupadoProduto {
  produto: string;
  quantidade: number;
  vendas: number;
  valor: number;
}

export default function VendedorDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading, error } = useVendedor(id);

  const porProduto: AgrupadoProduto[] = useMemo(() => {
    if (!data) return [];
    const map = new Map<string, AgrupadoProduto>();
    for (const it of data.itens) {
      const key = (it.produto_descricao ?? "Sem descrição").trim();
      const cur = map.get(key) ?? {
        produto: key,
        quantidade: 0,
        vendas: 0,
        valor: 0,
      };
      cur.quantidade += it.quantidade;
      cur.vendas += 1;
      cur.valor += it.quantidade * it.valor_unitario;
      map.set(key, cur);
    }
    return [...map.values()].sort((a, b) => b.valor - a.valor);
  }, [data]);

  if (isLoading) return <LoadingState linhas={6} />;
  if (error || !data) {
    return (
      <div className="solid-surface p-lg flex flex-col gap-xs">
        <span className="text-label-caps text-error">Erro</span>
        <p className="text-body-md text-text-1">
          {error instanceof Error ? error.message : "Vendedor não encontrado."}
        </p>
      </div>
    );
  }

  const colunasProdutos: DataTableColumn<AgrupadoProduto>[] = [
    {
      key: "produto",
      label: "Produto",
      render: (p) => <span className="text-text-1">{p.produto}</span>,
      csv: (p) => p.produto,
    },
    {
      key: "quantidade",
      label: "Qtd. total",
      align: "right",
      render: (p) => p.quantidade,
      csv: (p) => String(p.quantidade),
    },
    {
      key: "vendas",
      label: "Itens em vendas",
      align: "right",
      render: (p) => p.vendas,
      csv: (p) => String(p.vendas),
      hideOnMobile: true,
    },
    {
      key: "valor",
      label: "Valor total",
      align: "right",
      render: (p) => formatCurrency(p.valor),
      csv: (p) => formatCurrency(p.valor),
    },
  ];

  const colunasItens: DataTableColumn<(typeof data.itens)[number]>[] = [
    {
      key: "numero",
      label: "Venda",
      render: (it) => (
        <Link
          href={`/vendas/${it.id}`}
          className="text-accent hover:underline"
        >
          #{it.numero}
        </Link>
      ),
      csv: (it) => `#${it.numero}`,
    },
    {
      key: "data_venda",
      label: "Data",
      render: (it) => formatDate(it.data_venda),
      csv: (it) => formatDate(it.data_venda),
    },
    {
      key: "produto",
      label: "Produto",
      render: (it) => it.produto_descricao ?? "—",
      csv: (it) => it.produto_descricao ?? "",
    },
    {
      key: "quantidade",
      label: "Qtd.",
      align: "right",
      render: (it) => it.quantidade,
      csv: (it) => String(it.quantidade),
    },
    {
      key: "valor",
      label: "Valor un.",
      align: "right",
      render: (it) => formatCurrency(it.valor_unitario),
      csv: (it) => formatCurrency(it.valor_unitario),
      hideOnMobile: true,
    },
    {
      key: "tipo",
      label: "Tipo",
      render: (it) => (
        <Badge tone={VENDA_TIPO_TONE[it.tipo]}>{VENDA_TIPO_LABEL[it.tipo]}</Badge>
      ),
      csv: (it) => VENDA_TIPO_LABEL[it.tipo],
      hideOnMobile: true,
    },
  ];

  return (
    <div className="flex flex-col gap-2xl">
      <Link
        href="/vendedores"
        className="inline-flex items-center gap-xs text-body-sm text-text-3 hover:text-accent self-start"
      >
        <ArrowLeft size={14} strokeWidth={1.8} />
        Voltar à equipe
      </Link>

      <div className="flex items-center gap-md">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="text-h4">
            {initials(data.perfil.nome)}
          </AvatarFallback>
        </Avatar>
        <Hero
          eyebrow={data.perfil.papel}
          titulo={data.perfil.nome}
          descricao={data.perfil.email}
        />
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-md">
        <KPICard label="Vendas fechadas" valor={data.agregado.totalVendas} />
        <KPICard
          label="Orçamentos abertos"
          valor={data.agregado.totalOrcamentos}
        />
        <KPICard
          label="Valor fechado"
          valor={data.agregado.valorFechado}
          formato="moeda"
        />
        <KPICard
          label="Comissão acumulada"
          valor={data.agregado.comissaoTotal}
          formato="moeda"
        />
      </section>

      <section className="flex flex-col gap-md">
        <span className="text-label-caps text-text-3">Produtos vendidos</span>
        {porProduto.length === 0 ? (
          <EmptyState
            icone={UserCog}
            titulo="Sem vendas registradas."
            descricao="Quando este vendedor registrar a primeira venda, aparece aqui."
          />
        ) : (
          <DataTable
            columns={colunasProdutos}
            data={porProduto}
            rowKey={(p) => p.produto}
            exportName={`vendedor-${data.perfil.nome}-produtos`}
          />
        )}
      </section>

      <section className="flex flex-col gap-md">
        <span className="text-label-caps text-text-3">Histórico de itens</span>
        {data.itens.length === 0 ? (
          <Card className="p-lg">
            <p className="text-body-sm text-text-3">
              Nenhum item vendido por este vendedor ainda.
            </p>
          </Card>
        ) : (
          <DataTable
            columns={colunasItens}
            data={data.itens}
            rowKey={(it) => it.id}
            exportName={`vendedor-${data.perfil.nome}-itens`}
          />
        )}
      </section>
    </div>
  );
}
