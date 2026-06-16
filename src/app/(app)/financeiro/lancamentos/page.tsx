"use client";

import { useState } from "react";
import { Plus, Receipt } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { FinanceiroNav } from "@/components/financeiro/FinanceiroNav";
import { LancamentoDialog } from "@/components/financeiro/LancamentoDialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { toast } from "@/components/feedback/Toast";
import { usePeriodo } from "@/hooks/usePeriodo";
import { cn, formatCurrency } from "@/lib/utils";
import {
  useLancamentos,
  useMarcarPago,
  useExcluirLancamento,
  statusRotulo,
  type LancamentoRow,
} from "@/lib/queries/financeiro";

const fmtData = (iso: string) => (iso ? iso.split("-").reverse().join("/") : "");

const CHIPS = [
  { id: "todos", rotulo: "Todos" },
  { id: "receitas", rotulo: "Receitas" },
  { id: "despesas", rotulo: "Despesas" },
  { id: "previstos", rotulo: "Previstos" },
  { id: "realizados", rotulo: "Realizados" },
] as const;

export default function LancamentosPage() {
  const { periodo } = usePeriodo();
  const [chip, setChip] = useState<
    "todos" | "receitas" | "despesas" | "previstos" | "realizados"
  >("todos");

  const tipo =
    chip === "receitas" ? "entrada" : chip === "despesas" ? "saida" : undefined;
  const status =
    chip === "previstos" ? "pendente" : chip === "realizados" ? "pago" : undefined;

  const lancs = useLancamentos({
    inicio: periodo.de,
    fim: periodo.ate,
    tipo,
    status,
  });
  const marcar = useMarcarPago();
  const excluir = useExcluirLancamento();

  const [open, setOpen] = useState(false);
  const [editar, setEditar] = useState<LancamentoRow | null>(null);

  function novo() {
    setEditar(null);
    setOpen(true);
  }
  function editarRow(r: LancamentoRow) {
    setEditar(r);
    setOpen(true);
  }

  const linhas = lancs.data ?? [];

  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Financeiro · Lançamentos"
        titulo={`Lançamentos · ${periodo.rotulo}`}
        acoes={
          <Button onClick={novo}>
            <Plus size={16} /> Novo lançamento
          </Button>
        }
      />

      <FinanceiroNav />

      <div className="flex flex-wrap gap-2">
        {CHIPS.map((c) => (
          <button
            key={c.id}
            onClick={() => setChip(c.id)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-label-caps transition-colors",
              chip === c.id
                ? "bg-accent text-[var(--on-accent)] border-accent"
                : "border-border-thin text-text-3 hover:text-text-1",
            )}
          >
            {c.rotulo}
          </button>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        {linhas.length === 0 ? (
          <EmptyState
            icone={Receipt}
            titulo="Nenhum lançamento"
            descricao="Ajuste o período ou crie um novo lançamento."
            acao={<Button onClick={novo}>Novo lançamento</Button>}
          />
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-body-sm">
              <thead>
                <tr className="border-b border-border-thin text-left">
                  <th className="text-label-caps text-text-3 font-semibold px-lg py-md">
                    Data
                  </th>
                  <th className="text-label-caps text-text-3 font-semibold px-lg py-md">
                    Descrição
                  </th>
                  <th className="text-label-caps text-text-3 font-semibold px-lg py-md">
                    Categoria
                  </th>
                  <th className="text-label-caps text-text-3 font-semibold px-lg py-md">
                    Conta
                  </th>
                  <th className="text-label-caps text-text-3 font-semibold px-lg py-md text-right">
                    Valor
                  </th>
                  <th className="text-label-caps text-text-3 font-semibold px-lg py-md">
                    Status
                  </th>
                  <th className="text-label-caps text-text-3 font-semibold px-lg py-md" />
                </tr>
              </thead>
              <tbody>
                {linhas.map((l) => (
                  <tr
                    key={l.id}
                    className="border-b border-border-thin hover:bg-surface-2"
                  >
                    <td className="px-lg py-md whitespace-nowrap">
                      {fmtData(l.data_competencia)}
                    </td>
                    <td className="px-lg py-md">
                      <p className="text-text-1">{l.descricao}</p>
                      {l.origem ? (
                        <p className="text-caption text-text-4">{l.origem}</p>
                      ) : null}
                    </td>
                    <td className="px-lg py-md">
                      {l.categoria?.nome ?? "Sem categoria"}
                    </td>
                    <td className="px-lg py-md">{l.conta?.nome ?? "Sem conta"}</td>
                    <td
                      className={cn(
                        "px-lg py-md text-right tabular-nums whitespace-nowrap",
                        l.tipo === "saida" ? "text-error" : "text-success",
                      )}
                    >
                      {l.tipo === "saida" ? "− " : ""}
                      {formatCurrency(l.valor)}
                    </td>
                    <td className="px-lg py-md">
                      <Badge
                        tone={
                          l.status === "pago"
                            ? "success"
                            : l.status === "atrasado"
                              ? "error"
                              : l.status === "cancelado"
                                ? "muted"
                                : "warning"
                        }
                      >
                        {statusRotulo(l.status)}
                      </Badge>
                    </td>
                    <td className="px-lg py-md">
                      <div className="flex gap-1 justify-end">
                        {l.status === "pendente" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              await marcar.mutateAsync(l.id);
                              toast.success("Marcado como realizado.");
                            }}
                          >
                            Marcar pago
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => editarRow(l)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={async () => {
                            if (confirm("Excluir este lançamento?")) {
                              await excluir.mutateAsync(l.id);
                              toast.success("Excluído.");
                            }
                          }}
                        >
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <LancamentoDialog
        open={open}
        onOpenChange={setOpen}
        tipoInicial={editar?.tipo ?? "saida"}
        lockTipo={false}
        editar={editar}
      />
    </div>
  );
}
