"use client";

import { useMemo, useState } from "react";
import { Plus, Boxes, ArrowDown, ArrowUp, Pencil } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { KPICard } from "@/components/sections/KPICard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { EmptyState } from "@/components/feedback/EmptyState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { toast } from "@/components/feedback/Toast";
import { formatCurrency } from "@/lib/utils";
import {
  useMateriais,
  useSalvarMaterial,
  useMovimentarMaterial,
  type MaterialRow,
} from "@/lib/queries/materiais";

const UNIDADES = ["m", "m²", "m³", "kg", "un", "rolo", "par"];

interface NovoMaterial {
  id?: string;
  nome: string;
  unidade: string;
  categoria: string;
  estoque_minimo: number;
  estoque_atual: number;
  custo_medio: number;
}

const emptyMaterial: NovoMaterial = {
  nome: "",
  unidade: "m",
  categoria: "",
  estoque_minimo: 0,
  estoque_atual: 0,
  custo_medio: 0,
};

interface NovoMovimento {
  material_id: string;
  tipo: "entrada" | "saida";
  quantidade: number;
  valor_unitario: number;
  observacoes: string;
}

const emptyMovimento: NovoMovimento = {
  material_id: "",
  tipo: "entrada",
  quantidade: 0,
  valor_unitario: 0,
  observacoes: "",
};

export default function MateriaisPage() {
  const materiais = useMateriais();
  const salvar = useSalvarMaterial();
  const movimentar = useMovimentarMaterial();
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<NovoMaterial>(emptyMaterial);
  const [movOpen, setMovOpen] = useState(false);
  const [mov, setMov] = useState<NovoMovimento>(emptyMovimento);

  const totalCritico = useMemo(
    () =>
      (materiais.data ?? []).filter(
        (m) => Number(m.estoque_atual) <= Number(m.estoque_minimo),
      ).length,
    [materiais.data],
  );

  const columns: DataTableColumn<MaterialRow>[] = [
    { key: "nome", label: "Material", render: (m) => m.nome, csv: (m) => m.nome },
    {
      key: "categoria",
      label: "Categoria",
      render: (m) => <span className="text-text-3">{m.categoria ?? "—"}</span>,
      csv: (m) => m.categoria ?? "",
      hideOnMobile: true,
    },
    {
      key: "estoque_atual",
      label: "Atual",
      align: "right",
      render: (m) => (
        <span className="tabular-nums text-text-1">
          {Number(m.estoque_atual).toLocaleString("pt-BR")} {m.unidade}
        </span>
      ),
      csv: (m) => `${m.estoque_atual} ${m.unidade}`,
    },
    {
      key: "estoque_minimo",
      label: "Mínimo",
      align: "right",
      render: (m) => (
        <span className="tabular-nums text-text-3">
          {Number(m.estoque_minimo).toLocaleString("pt-BR")} {m.unidade}
        </span>
      ),
      csv: (m) => `${m.estoque_minimo} ${m.unidade}`,
      hideOnMobile: true,
    },
    {
      key: "custo_medio",
      label: "Custo médio",
      align: "right",
      render: (m) =>
        m.custo_medio != null ? formatCurrency(Number(m.custo_medio)) : "—",
      csv: (m) => (m.custo_medio != null ? formatCurrency(Number(m.custo_medio)) : ""),
      hideOnMobile: true,
    },
    {
      key: "status",
      label: "Status",
      render: (m) =>
        Number(m.estoque_atual) <= Number(m.estoque_minimo) ? (
          <Badge tone="error">Crítico</Badge>
        ) : (
          <Badge tone="success">Ok</Badge>
        ),
      csv: (m) =>
        Number(m.estoque_atual) <= Number(m.estoque_minimo) ? "Crítico" : "Ok",
    },
    {
      key: "acoes",
      label: "",
      render: (m) => (
        <Button
          variant="ghost"
          size="iconSm"
          aria-label="Editar"
          onClick={(e) => {
            e.stopPropagation();
            setForm({
              id: m.id,
              nome: m.nome,
              unidade: m.unidade,
              categoria: m.categoria ?? "",
              estoque_minimo: Number(m.estoque_minimo),
              estoque_atual: Number(m.estoque_atual),
              custo_medio: Number(m.custo_medio ?? 0),
            });
            setFormOpen(true);
          }}
        >
          <Pencil size={14} strokeWidth={1.8} />
        </Button>
      ),
      hideOnMobile: true,
    },
  ];

  async function onSubmitMaterial(e: React.FormEvent) {
    e.preventDefault();
    if (form.nome.trim().length < 2) return;
    try {
      await salvar.mutateAsync({
        id: form.id,
        nome: form.nome,
        unidade: form.unidade,
        categoria: form.categoria || null,
        estoque_minimo: form.estoque_minimo,
        estoque_atual: form.estoque_atual,
        custo_medio: form.custo_medio || null,
      });
      toast.success(form.id ? "Material atualizado." : "Material cadastrado.");
      setFormOpen(false);
      setForm(emptyMaterial);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao salvar.");
    }
  }

  async function onSubmitMovimento(e: React.FormEvent) {
    e.preventDefault();
    if (!mov.material_id || mov.quantidade <= 0) return;
    try {
      await movimentar.mutateAsync({
        material_id: mov.material_id,
        tipo: mov.tipo,
        origem: mov.tipo === "entrada" ? "compra" : "producao",
        quantidade: mov.quantidade,
        valor_unitario: mov.valor_unitario || null,
        observacoes: mov.observacoes || null,
      });
      toast.success(
        mov.tipo === "entrada" ? "Entrada registrada." : "Saída registrada.",
      );
      setMovOpen(false);
      setMov(emptyMovimento);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha na movimentação.");
    }
  }

  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Insumos"
        titulo="Materiais"
        descricao="Estoque de matérias-primas. Mantenha o mínimo coberto para não parar a produção."
        acoes={
          <div className="flex items-center gap-sm flex-wrap">
            <Button
              variant="secondary"
              onClick={() => {
                setMov({ ...emptyMovimento, tipo: "saida" });
                setMovOpen(true);
              }}
            >
              <ArrowUp size={14} strokeWidth={1.8} />
              Saída
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setMov({ ...emptyMovimento, tipo: "entrada" });
                setMovOpen(true);
              }}
            >
              <ArrowDown size={14} strokeWidth={1.8} />
              Entrada
            </Button>
            <Button
              onClick={() => {
                setForm(emptyMaterial);
                setFormOpen(true);
              }}
            >
              <Plus size={14} strokeWidth={1.8} />
              Novo material
            </Button>
          </div>
        }
      />

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-md">
        <KPICard
          label="Cadastrados"
          valor={materiais.data?.length ?? 0}
          icone={<Boxes size={16} strokeWidth={1.8} />}
        />
        <KPICard
          label="Em nível crítico"
          valor={totalCritico}
          icone={<ArrowUp size={16} strokeWidth={1.8} />}
        />
        <KPICard
          label="Saudáveis"
          valor={(materiais.data?.length ?? 0) - totalCritico}
        />
      </section>

      {materiais.isLoading ? (
        <LoadingState linhas={6} />
      ) : (materiais.data?.length ?? 0) === 0 ? (
        <EmptyState
          icone={Boxes}
          titulo="Nenhum material cadastrado."
          descricao="Cadastre os insumos que vocês usam (tecidos, espuma, madeira, ferragens)."
          acao={
            <Button
              onClick={() => {
                setForm(emptyMaterial);
                setFormOpen(true);
              }}
            >
              <Plus size={14} strokeWidth={1.8} />
              Novo material
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={materiais.data ?? []}
          rowKey={(m) => m.id}
          exportName="materiais"
        />
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {form.id ? "Editar material" : "Novo material"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmitMaterial} className="flex flex-col gap-md">
            <div className="flex flex-col gap-xs">
              <Label htmlFor="material_nome">Nome</Label>
              <Input
                id="material_nome"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                required
                placeholder="Ex: Suede grafite"
              />
            </div>
            <div className="grid grid-cols-2 gap-md">
              <div className="flex flex-col gap-xs">
                <Label>Unidade</Label>
                <Select
                  value={form.unidade}
                  onValueChange={(v) => setForm({ ...form, unidade: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIDADES.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-xs">
                <Label htmlFor="material_categoria">Categoria</Label>
                <Input
                  id="material_categoria"
                  value={form.categoria}
                  onChange={(e) =>
                    setForm({ ...form, categoria: e.target.value })
                  }
                  placeholder="Tecido, espuma…"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-md">
              <div className="flex flex-col gap-xs">
                <Label htmlFor="material_atual">Estoque atual</Label>
                <Input
                  id="material_atual"
                  type="number"
                  step="0.01"
                  min={0}
                  value={form.estoque_atual}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      estoque_atual: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="flex flex-col gap-xs">
                <Label htmlFor="material_min">Estoque mínimo</Label>
                <Input
                  id="material_min"
                  type="number"
                  step="0.01"
                  min={0}
                  value={form.estoque_minimo}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      estoque_minimo: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="flex flex-col gap-xs max-w-[200px]">
              <Label htmlFor="material_custo">Custo médio (opcional)</Label>
              <Input
                id="material_custo"
                type="number"
                step="0.01"
                min={0}
                value={form.custo_medio}
                onChange={(e) =>
                  setForm({ ...form, custo_medio: Number(e.target.value) })
                }
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setFormOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={salvar.isPending}>
                {salvar.isPending ? "Salvando…" : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={movOpen} onOpenChange={setMovOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {mov.tipo === "entrada" ? "Entrada de material" : "Saída de material"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmitMovimento} className="flex flex-col gap-md">
            <div className="flex flex-col gap-xs">
              <Label>Material</Label>
              <Select
                value={mov.material_id}
                onValueChange={(v) => setMov({ ...mov, material_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  {(materiais.data ?? []).map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.nome} ({m.unidade})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-md">
              <div className="flex flex-col gap-xs">
                <Label htmlFor="mov_qtd">Quantidade</Label>
                <Input
                  id="mov_qtd"
                  type="number"
                  step="0.01"
                  min={0}
                  value={mov.quantidade}
                  onChange={(e) =>
                    setMov({ ...mov, quantidade: Number(e.target.value) })
                  }
                />
              </div>
              <div className="flex flex-col gap-xs">
                <Label htmlFor="mov_valor">Valor unitário (opcional)</Label>
                <Input
                  id="mov_valor"
                  type="number"
                  step="0.01"
                  min={0}
                  value={mov.valor_unitario}
                  onChange={(e) =>
                    setMov({ ...mov, valor_unitario: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="flex flex-col gap-xs">
              <Label htmlFor="mov_obs">Observações</Label>
              <Input
                id="mov_obs"
                value={mov.observacoes}
                onChange={(e) =>
                  setMov({ ...mov, observacoes: e.target.value })
                }
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setMovOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={movimentar.isPending}>
                {movimentar.isPending
                  ? "Registrando…"
                  : mov.tipo === "entrada"
                    ? "Registrar entrada"
                    : "Registrar saída"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
