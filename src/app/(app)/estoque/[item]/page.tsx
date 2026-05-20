"use client";

import { use } from "react";
import { ArrowLeft, Package } from "lucide-react";
import Link from "next/link";
import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { mockEstoque } from "@/lib/mocks";

export default function EstoqueDetalhePage({
  params,
}: {
  params: Promise<{ item: string }>;
}) {
  const { item } = use(params);
  const produto = mockEstoque.find((e) => e.id === item) ?? mockEstoque[0];

  return (
    <div className="flex flex-col gap-2xl">
      <Link
        href="/estoque"
        className="inline-flex items-center gap-xs text-body-sm text-text-3 hover:text-accent self-start"
      >
        <ArrowLeft size={14} strokeWidth={1.8} />
        Voltar ao estoque
      </Link>
      <Hero
        eyebrow={produto.categoria}
        titulo={produto.produto}
        descricao={`${produto.variantes} variantes ativas.`}
        acoes={
          produto.estoque_atual <= produto.estoque_minimo ? (
            <Badge tone="error">Estoque crítico</Badge>
          ) : (
            <Badge tone="success">Em dia</Badge>
          )
        }
      />
      <Tabs defaultValue="detalhes">
        <TabsList>
          <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
          <TabsTrigger value="variantes">Variantes</TabsTrigger>
          <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
          <TabsTrigger value="imagens">Imagens</TabsTrigger>
        </TabsList>
        <TabsContent value="detalhes">
          <Card className="p-lg">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="flex flex-col gap-xxs">
                <dt className="text-label-caps text-text-3">Estoque atual</dt>
                <dd className="text-h3 tabular-nums text-text-1">
                  {produto.estoque_atual}
                </dd>
              </div>
              <div className="flex flex-col gap-xxs">
                <dt className="text-label-caps text-text-3">Mínimo</dt>
                <dd className="text-h3 tabular-nums text-text-1">
                  {produto.estoque_minimo}
                </dd>
              </div>
              <div className="flex flex-col gap-xxs">
                <dt className="text-label-caps text-text-3">Categoria</dt>
                <dd className="text-body-md text-text-1">{produto.categoria}</dd>
              </div>
              <div className="flex flex-col gap-xxs">
                <dt className="text-label-caps text-text-3">Variantes</dt>
                <dd className="text-body-md text-text-1">{produto.variantes}</dd>
              </div>
            </dl>
          </Card>
        </TabsContent>
        <TabsContent value="variantes">
          <Card className="p-lg">
            <p className="text-body-md text-text-3 inline-flex items-center gap-sm">
              <Package size={16} strokeWidth={1.8} />
              Lista de variantes com estoque individual após integração com Supabase.
            </p>
          </Card>
        </TabsContent>
        <TabsContent value="movimentacoes">
          <Card className="p-lg">
            <p className="text-body-md text-text-3">
              Histórico de entradas e saídas exibido aqui.
            </p>
          </Card>
        </TabsContent>
        <TabsContent value="imagens">
          <Card className="p-lg">
            <p className="text-body-md text-text-3">
              Upload de imagens disponível após integração com Supabase Storage.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
