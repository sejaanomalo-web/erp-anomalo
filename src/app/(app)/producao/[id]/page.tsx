"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/card";
import { ProducaoStatusBadge } from "@/components/tables/StatusBadge";
import { LoadingState } from "@/components/feedback/LoadingState";
import { useProducoes } from "@/lib/queries/producoes";
import { formatDate } from "@/lib/utils";

export default function ProducaoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: producoes, isLoading } = useProducoes();
  const prod = producoes?.find((p) => p.id === id);

  if (isLoading) return <LoadingState linhas={6} />;
  if (!prod) {
    return (
      <div className="solid-surface p-lg">
        <p className="text-body-md text-text-3">Produção não encontrada.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2xl">
      <Link
        href="/producao"
        className="inline-flex items-center gap-xs text-body-sm text-text-3 hover:text-accent self-start"
      >
        <ArrowLeft size={14} strokeWidth={1.8} />
        Voltar ao quadro
      </Link>
      <Hero
        eyebrow={`Produção · ref. #${prod.venda?.numero ?? "—"}`}
        titulo={prod.produto_descricao ?? "Sem descrição"}
        descricao={
          prod.data_fim_prevista
            ? `Responsável: ${prod.responsavel?.nome ?? "—"}. Prazo ${formatDate(prod.data_fim_prevista)}.`
            : `Responsável: ${prod.responsavel?.nome ?? "—"}.`
        }
        acoes={<ProducaoStatusBadge status={prod.status} />}
      />

      <Card className="p-lg flex flex-col gap-md">
        <div className="flex flex-col gap-xs">
          <span className="text-label-caps text-text-3">Descrição</span>
          <p className="text-body-md text-text-1 whitespace-pre-wrap">
            {prod.produto_descricao ?? "—"}
          </p>
        </div>
        {prod.observacoes ? (
          <div className="flex flex-col gap-xs pt-md border-t border-border-thin">
            <span className="text-label-caps text-text-3">Observações</span>
            <p className="text-body-md text-text-1 whitespace-pre-wrap">
              {prod.observacoes}
            </p>
          </div>
        ) : null}
      </Card>

      {(prod.foto_modelo_url || prod.foto_tecido_url) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {prod.foto_modelo_url && (
            <div className="flex flex-col gap-xs">
              <span className="text-label-caps text-text-3">Foto do modelo</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={prod.foto_modelo_url}
                alt="Modelo"
                className="w-full aspect-[4/3] object-cover border border-border-thin"
              />
            </div>
          )}
          {prod.foto_tecido_url && (
            <div className="flex flex-col gap-xs">
              <span className="text-label-caps text-text-3">Foto do tecido</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={prod.foto_tecido_url}
                alt="Tecido"
                className="w-full aspect-[4/3] object-cover border border-border-thin"
              />
            </div>
          )}
        </div>
      )}

      <p className="text-caption text-text-4">
        Esta tela não exibe dados pessoais do cliente. Vendedores e equipe de
        produção têm acesso somente aqui.
      </p>
    </div>
  );
}
