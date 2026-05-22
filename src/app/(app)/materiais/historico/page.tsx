"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowLeft, History, Search } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { KPICard } from "@/components/sections/KPICard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PeriodoFilter,
  periodoInicial,
  type PeriodoValue,
} from "@/components/financeiro/PeriodoFilter";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { EmptyState } from "@/components/feedback/EmptyState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { useDebounce } from "@/hooks/useDebounce";
import {
  useMateriais,
  useMovimentacoesMaterial,
  type MovimentacaoRow,
} from "@/lib/queries/materiais";
import { formatCurrency, formatDateTime } from "@/lib/utils";

const TIPO_LABEL: Record<"entrada" | "saida" | "ajuste", string> = {
  entrada: "Entrada",
  saida: "Saída",
  ajuste: "Ajuste",
};

const ORIGEM_LABEL: Record<string, string> = {
  compra: "Compra",
  venda: "Venda",
  producao: "Produção",
  devolucao: "Devolução",
  ajuste_manual: "Ajuste manual",
  perda: "Perda",
};

export default function MateriaisHistoricoPage() {
  const [periodo, setPeriodo] = useState<PeriodoValue>(() => periodoInicial("mes"));
  const [tipo, setTipo] = useState<"todos" | "entrada" | "saida" | "ajuste">(
    "todos",
  );
  const [materialId, setMaterialId] = useState<string>("todos");
  const [busca, setBusca] = useState("");
  const buscaDebounced = useDebounce(busca, 250);

  const materiais = useMateriais();
  const movimentacoes = useMovimentacoesMaterial({
    inicio: periodo.inicio,
    fim: periodo.fim,
    tipo,
    materialId,
    busca: buscaDebounced,
  });

  const lista = movimentacoes.data ?? [];
  const totais = lista.reduce(
    (acc, m) => {
      if (m.tipo === "entrada") {
        acc.entradasQtd += Number(m.quantidade);
        acc.entradasValor += Number(m.quantidade) * Number(m.valor_unitario ?? 0);
      } else if (m.tipo === "saida") {
        acc.saidasQtd += Number(m.quantidade);
        acc.saidasValor += Number(m.quantidade) * Number(m.valor_unitario ?? 0);
      }
      return acc;
    },
    { entradasQtd: 0, entradasValor: 0, saidasQtd: 0, saidasValor: 0 },
  );

  const columns: DataTableColumn<MovimentacaoRow>[] = [
    {
      key: "data",
      label: "Data",
      render: (m) => formatDateTime(m.created_at),
      csv: (m) => formatDateTime(m.created_at),
    },
    {
      key: "material",
      label: "Material",
      render: (m) => m.material?.nome ?? "—",
      csv: (m) => m.material?.nome ?? "",
    },
    {
      key: "tipo",
      label: "Tipo",
      render: (m) =>
        m.tipo === "entrada" ? (
          <Badge tone="success">
            <ArrowDown size={10} strokeWidth={2} />
            {TIPO_LABEL[m.tipo]}
          </Badge>
        ) : m.tipo === "saida" ? (
          <Badge tone="error">
            <ArrowUp size={10} strokeWidth={2} />
            {TIPO_LABEL[m.tipo]}
          </Badge>
        ) : (
          <Badge tone="muted">{TIPO_LABEL[m.tipo]}</Badge>
        ),
      csv: (m) => TIPO_LABEL[m.tipo],
    },
    {
      key: "origem",
      label: "Origem",
      render: (m) => ORIGEM_LABEL[m.origem] ?? m.origem,
      csv: (m) => ORIGEM_LABEL[m.origem] ?? m.origem,
      hideOnMobile: true,
    },
    {
      key: "quantidade",
      label: "Qtd.",
      align: "right",
      render: (m) => (
        <span className="tabular-nums text-text-1">
          {Number(m.quantidade).toLocaleString("pt-BR")}{" "}
          {m.material?.unidade ?? ""}
        </span>
      ),
      csv: (m) =>
        `${Number(m.quantidade).toLocaleString("pt-BR")} ${m.material?.unidade ?? ""}`,
    },
    {
      key: "valor_unitario",
      label: "Valor un.",
      align: "right",
      render: (m) =>
        m.valor_unitario != null ? formatCurrency(Number(m.valor_unitario)) : "—",
      csv: (m) =>
        m.valor_unitario != null ? formatCurrency(Number(m.valor_unitario)) : "",
      hideOnMobile: true,
    },
    {
      key: "responsavel",
      label: "Responsável",
      render: (m) => m.responsavel?.nome ?? "—",
      csv: (m) => m.responsavel?.nome ?? "",
      hideOnMobile: true,
    },
    {
      key: "observacoes",
      label: "Observações",
      render: (m) => m.observacoes ?? "—",
      csv: (m) => m.observacoes ?? "",
      hideOnMobile: true,
    },
  ];

  return (
    <div className="flex flex-col gap-2xl">
      <Link
        href="/materiais"
        className="inline-flex items-center gap-xs text-body-sm text-text-3 hover:text-accent self-start"
      >
        <ArrowLeft size={14} strokeWidth={1.8} />
        Voltar a materiais
      </Link>

      <Hero
        eyebrow="Insumos"
        titulo="Histórico"
        descricao="Entradas, saídas e ajustes de materiais. Filtre por período, tipo ou busque pelo nome."
      />

      <section className="grid grid-cols-2 md:grid-cols-4 gap-md">
        <KPICard
          label="Entradas (qtd.)"
          valor={totais.entradasQtd}
          icone={<ArrowDown size={16} strokeWidth={1.8} />}
        />
        <KPICard
          label="Entradas (R$)"
          valor={totais.entradasValor}
          formato="moeda"
        />
        <KPICard
          label="Saídas (qtd.)"
          valor={totais.saidasQtd}
          icone={<ArrowUp size={16} strokeWidth={1.8} />}
        />
        <KPICard
          label="Saídas (R$)"
          valor={totais.saidasValor}
          formato="moeda"
        />
      </section>

      <div className="flex flex-col gap-md md:flex-row md:items-end">
        <PeriodoFilter value={periodo} onChange={setPeriodo} />
      </div>

      <div className="flex flex-col gap-md md:flex-row md:items-end md:flex-wrap">
        <div className="flex flex-col gap-xs flex-1 md:max-w-md">
          <label htmlFor="busca" className="text-label-caps text-text-3">
            Buscar material
          </label>
          <div className="relative">
            <Search
              size={16}
              strokeWidth={1.8}
              className="absolute left-sm top-1/2 -translate-y-1/2 text-text-4 pointer-events-none"
            />
            <Input
              id="busca"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Nome do material ou observação"
              className="pl-xl"
            />
          </div>
        </div>
        <div className="flex flex-col gap-xs">
          <label className="text-label-caps text-text-3">Tipo</label>
          <Select
            value={tipo}
            onValueChange={(v) =>
              setTipo(v as "todos" | "entrada" | "saida" | "ajuste")
            }
          >
            <SelectTrigger className="min-w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="entrada">Entradas</SelectItem>
              <SelectItem value="saida">Saídas</SelectItem>
              <SelectItem value="ajuste">Ajustes</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-xs">
          <label className="text-label-caps text-text-3">Material</label>
          <Select value={materialId} onValueChange={setMaterialId}>
            <SelectTrigger className="min-w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {(materiais.data ?? []).map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {movimentacoes.isLoading ? (
        <LoadingState linhas={6} />
      ) : lista.length === 0 ? (
        <EmptyState
          icone={History}
          titulo="Nenhuma movimentação no período."
          descricao="Ajuste o filtro ou registre uma nova entrada / saída na tela de materiais."
        />
      ) : (
        <DataTable
          columns={columns}
          data={lista}
          rowKey={(m) => m.id}
          exportName="historico-materiais"
        />
      )}
    </div>
  );
}
