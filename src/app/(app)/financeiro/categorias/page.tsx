"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { FinanceiroNav } from "@/components/financeiro/FinanceiroNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/feedback/Toast";
import { CategoriaDrawer } from "@/components/financeiro/CategoriaDrawer";
import {
  useCategoriasFinanceiras,
  useExcluirCategoria,
  type CategoriaRow,
  type TipoFin,
} from "@/lib/queries/financeiro";
import { mensagemErroSupabase } from "@/lib/errors";

export default function CategoriasPage() {
  const receitas = useCategoriasFinanceiras("entrada");
  const despesas = useCategoriasFinanceiras("saida");
  const excluir = useExcluirCategoria();

  const [open, setOpen] = useState(false);
  const [editar, setEditar] = useState<CategoriaRow | null>(null);
  const [tipoNovo, setTipoNovo] = useState<TipoFin>("saida");

  function nova(tipo: TipoFin) {
    setEditar(null);
    setTipoNovo(tipo);
    setOpen(true);
  }

  function renderBloco(titulo: string, lista: CategoriaRow[]) {
    return (
      <Card className="p-lg flex flex-col gap-md">
        <div className="flex items-center justify-between">
          <h3 className="text-label-caps text-text-3">
            {titulo} · {lista.length}
          </h3>
        </div>
        {lista.length === 0 ? (
          <p className="text-body-sm text-text-3">Nenhuma categoria.</p>
        ) : (
          lista.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between border-b border-border-thin py-2"
            >
              <button
                className="flex items-center gap-3 text-left"
                onClick={() => {
                  setEditar(c);
                  setOpen(true);
                }}
              >
                <span
                  className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: c.cor ?? "#8a93a3" }}
                />
                <span className="text-body-md text-text-1">{c.nome}</span>
              </button>
              <Button
                size="iconSm"
                variant="ghost"
                onClick={async () => {
                  if (confirm("Excluir categoria?")) {
                    try {
                      await excluir.mutateAsync(c.id);
                      toast.success("Excluída.");
                    } catch (e) {
                      toast.error(
                        mensagemErroSupabase(
                          e,
                          "Não foi possível excluir a categoria.",
                        ),
                      );
                    }
                  }
                }}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))
        )}
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Financeiro · Categorias"
        titulo="Categorias"
        descricao="Organize lançamentos por categoria para DRE e relatórios."
        acoes={
          <Button onClick={() => nova("saida")}>
            <Plus size={16} /> Nova categoria
          </Button>
        }
      />
      <FinanceiroNav />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        {renderBloco("Receitas", receitas.data ?? [])}
        {renderBloco("Despesas", despesas.data ?? [])}
      </div>
      <CategoriaDrawer
        open={open}
        onOpenChange={setOpen}
        editar={editar}
        tipoInicial={tipoNovo}
      />
    </div>
  );
}
