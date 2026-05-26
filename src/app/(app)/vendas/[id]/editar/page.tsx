"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PhotoUpload } from "@/components/forms/PhotoUpload";
import { LoadingState } from "@/components/feedback/LoadingState";
import { toast } from "@/components/feedback/Toast";
import { useAtualizarVenda, useVenda } from "@/lib/queries/vendas";
import { useVendedores } from "@/lib/queries/profiles";
import { FORMAS_PAGAMENTO } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { VendaTipo } from "@/types/database.types";

interface ItemForm {
  id?: string;
  produto_descricao: string;
  quantidade: number;
  valor_unitario: number;
  observacoes: string;
  foto_modelo_url: string | null;
  foto_tecido_url: string | null;
}

interface VendaEditForm {
  vendedor_id: string;
  tipo: VendaTipo;
  desconto: number;
  taxa: number;
  forma_pagamento: string;
  parcelas: number;
  data_venda: string;
  data_prevista_entrega: string;
  observacoes: string;
  itens: ItemForm[];
}

export default function VendaEditarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const venda = useVenda(id);
  const vendedores = useVendedores();
  const atualizar = useAtualizarVenda(id);
  const [form, setForm] = useState<VendaEditForm | null>(null);

  useEffect(() => {
    if (!venda.data || form) return;
    const v = venda.data;
    setForm({
      vendedor_id: v.vendedor_id,
      tipo: v.tipo,
      desconto: Number(v.desconto ?? 0),
      taxa: Number(v.taxa ?? 0),
      forma_pagamento: v.forma_pagamento ?? "pix",
      parcelas: v.parcelas,
      data_venda: v.data_venda,
      data_prevista_entrega: v.data_prevista_entrega,
      observacoes: v.observacoes ?? "",
      itens: (v.itens ?? []).map((it) => ({
        id: it.id,
        produto_descricao: it.produto_descricao ?? "",
        quantidade: it.quantidade,
        valor_unitario: Number(it.valor_unitario),
        observacoes:
          typeof it.observacoes === "string"
            ? it.observacoes
            : it.observacoes
              ? JSON.stringify(it.observacoes)
              : "",
        foto_modelo_url: it.foto_modelo_url,
        foto_tecido_url: it.foto_tecido_url,
      })),
    });
  }, [venda.data, form]);

  if (venda.isLoading || !form) return <LoadingState linhas={6} />;
  if (venda.error || !venda.data) {
    return (
      <div className="solid-surface p-lg flex flex-col gap-xs">
        <span className="text-label-caps text-error">Erro</span>
        <p className="text-body-md text-text-1">
          {venda.error instanceof Error
            ? venda.error.message
            : "Venda não encontrada."}
        </p>
      </div>
    );
  }

  const total = Math.max(
    0,
    form.itens.reduce(
      (acc, it) => acc + it.quantidade * it.valor_unitario,
      0,
    ) -
      form.desconto -
      form.taxa,
  );

  function setItem(idx: number, patch: Partial<ItemForm>) {
    setForm((cur) =>
      cur
        ? {
            ...cur,
            itens: cur.itens.map((it, i) => (i === idx ? { ...it, ...patch } : it)),
          }
        : cur,
    );
  }

  function addItem() {
    setForm((cur) =>
      cur
        ? {
            ...cur,
            itens: [
              ...cur.itens,
              {
                produto_descricao: "",
                quantidade: 1,
                valor_unitario: 0,
                observacoes: "",
                foto_modelo_url: null,
                foto_tecido_url: null,
              },
            ],
          }
        : cur,
    );
  }

  function removeItem(idx: number) {
    setForm((cur) =>
      cur ? { ...cur, itens: cur.itens.filter((_, i) => i !== idx) } : cur,
    );
  }

  async function salvar() {
    if (!form) return;
    if (form.itens.length === 0) {
      toast.error("Inclua ao menos um item.");
      return;
    }
    if (form.itens.some((it) => !it.produto_descricao.trim())) {
      toast.error("Cada item precisa de descrição.");
      return;
    }

    try {
      await atualizar.mutateAsync({
        vendedor_id: form.vendedor_id,
        tipo: form.tipo,
        desconto: form.desconto,
        taxa: form.taxa,
        forma_pagamento: form.forma_pagamento,
        parcelas: form.parcelas,
        data_venda: form.data_venda,
        data_prevista_entrega: form.data_prevista_entrega,
        observacoes: form.observacoes || null,
        itens: form.itens.map((it) => ({
          id: it.id,
          produto_descricao: it.produto_descricao.trim(),
          quantidade: it.quantidade,
          valor_unitario: it.valor_unitario,
          observacoes: it.observacoes.trim() || null,
          foto_modelo_url: it.foto_modelo_url,
          foto_tecido_url: it.foto_tecido_url,
        })),
      });
      toast.success("Venda atualizada.");
      router.push(`/vendas/${id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao atualizar.");
    }
  }

  return (
    <div className="flex flex-col gap-2xl max-w-4xl">
      <Link
        href={`/vendas/${id}`}
        className="inline-flex items-center gap-xs text-body-sm text-text-3 hover:text-accent self-start"
      >
        <ArrowLeft size={14} strokeWidth={1.8} />
        Voltar para a venda
      </Link>

      <Hero
        eyebrow={`Editando venda #${venda.data.numero}`}
        titulo={venda.data.cliente?.nome ?? "Cliente"}
        descricao="Ajuste valores, itens, vendedor responsável e datas."
      />

      <Card className="p-lg flex flex-col gap-md">
        <span className="text-label-caps text-text-3">Tipo</span>
        <RadioGroup
          value={form.tipo}
          onValueChange={(v) =>
            setForm({ ...form, tipo: v as VendaTipo })
          }
          className="grid grid-cols-1 md:grid-cols-2 gap-sm"
        >
          <label
            htmlFor="edit-tipo-orcamento"
            className={`solid-surface solid-surface-hover p-md cursor-pointer flex items-start gap-sm ${form.tipo === "orcamento" ? "border-accent-strong" : ""}`}
          >
            <RadioGroupItem
              id="edit-tipo-orcamento"
              value="orcamento"
              className="mt-1"
            />
            <div className="flex flex-col gap-xxs">
              <span className="text-body-md text-text-1">Orçamento</span>
              <span className="text-body-sm text-text-3">
                Negociação em aberto.
              </span>
            </div>
          </label>
          <label
            htmlFor="edit-tipo-venda"
            className={`solid-surface solid-surface-hover p-md cursor-pointer flex items-start gap-sm ${form.tipo === "venda" ? "border-accent-strong" : ""}`}
          >
            <RadioGroupItem
              id="edit-tipo-venda"
              value="venda"
              className="mt-1"
            />
            <div className="flex flex-col gap-xxs">
              <span className="text-body-md text-text-1">Venda fechada</span>
              <span className="text-body-sm text-text-3">
                Produção em andamento.
              </span>
            </div>
          </label>
        </RadioGroup>
      </Card>

      <Card className="p-lg flex flex-col gap-md">
        <span className="text-label-caps text-text-3">Valores e condição</span>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          <div className="flex flex-col gap-xs">
            <Label htmlFor="edit-desconto">Desconto</Label>
            <Input
              id="edit-desconto"
              type="number"
              min={0}
              step="0.01"
              value={form.desconto}
              onChange={(e) =>
                setForm({ ...form, desconto: Number(e.target.value) })
              }
            />
          </div>
          <div className="flex flex-col gap-xs">
            <Label htmlFor="edit-taxa">Taxa</Label>
            <Input
              id="edit-taxa"
              type="number"
              min={0}
              step="0.01"
              value={form.taxa}
              onChange={(e) =>
                setForm({ ...form, taxa: Number(e.target.value) })
              }
            />
          </div>
          <div className="flex flex-col gap-xs">
            <Label htmlFor="edit-parcelas">Parcelas</Label>
            <Input
              id="edit-parcelas"
              type="number"
              min={1}
              max={48}
              value={form.parcelas}
              onChange={(e) =>
                setForm({ ...form, parcelas: Number(e.target.value) })
              }
            />
          </div>
          <div className="flex flex-col gap-xs">
            <Label>Total</Label>
            <span className="h-10 inline-flex items-center text-h3 tabular-nums text-text-1">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div className="flex flex-col gap-xs">
            <Label>Forma de pagamento</Label>
            <Select
              value={form.forma_pagamento}
              onValueChange={(v) => setForm({ ...form, forma_pagamento: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORMAS_PAGAMENTO.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-xs">
            <Label>Vendedor responsável</Label>
            <Select
              value={form.vendedor_id}
              onValueChange={(v) => setForm({ ...form, vendedor_id: v })}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    vendedores.isLoading ? "Carregando…" : "Selecionar"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {(vendedores.data ?? []).map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="p-lg flex flex-col gap-md">
        <span className="text-label-caps text-text-3">Datas e observações</span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div className="flex flex-col gap-xs">
            <Label htmlFor="edit-data-venda">Data do cadastro</Label>
            <Input
              id="edit-data-venda"
              type="date"
              value={form.data_venda}
              onChange={(e) =>
                setForm({ ...form, data_venda: e.target.value })
              }
            />
          </div>
          <div className="flex flex-col gap-xs">
            <Label htmlFor="edit-data-entrega">Data prevista de entrega</Label>
            <Input
              id="edit-data-entrega"
              type="date"
              value={form.data_prevista_entrega}
              onChange={(e) =>
                setForm({ ...form, data_prevista_entrega: e.target.value })
              }
            />
          </div>
        </div>
        <div className="flex flex-col gap-xs">
          <Label htmlFor="edit-obs">Observações da venda</Label>
          <Textarea
            id="edit-obs"
            rows={2}
            value={form.observacoes}
            onChange={(e) =>
              setForm({ ...form, observacoes: e.target.value })
            }
          />
        </div>
      </Card>

      <div className="flex flex-col gap-md">
        <div className="flex items-center justify-between">
          <span className="text-label-caps text-text-3">Itens</span>
          <Button variant="secondary" size="sm" onClick={addItem}>
            <Plus size={14} strokeWidth={1.8} />
            Adicionar item
          </Button>
        </div>
        {form.itens.map((it, idx) => (
          <Card key={it.id ?? `novo-${idx}`} className="p-lg flex flex-col gap-md">
            <div className="flex items-center justify-between">
              <span className="text-label-caps text-text-3">
                Item {idx + 1}
              </span>
              {form.itens.length > 1 ? (
                <Button
                  variant="ghost"
                  size="iconSm"
                  aria-label="Remover item"
                  onClick={() => removeItem(idx)}
                >
                  <Trash2 size={14} strokeWidth={1.8} />
                </Button>
              ) : null}
            </div>
            <div className="flex flex-col gap-xs">
              <Label htmlFor={`it-desc-${idx}`}>Descrição do produto</Label>
              <Input
                id={`it-desc-${idx}`}
                value={it.produto_descricao}
                onChange={(e) =>
                  setItem(idx, { produto_descricao: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-md max-w-md">
              <div className="flex flex-col gap-xs">
                <Label htmlFor={`it-qtd-${idx}`}>Quantidade</Label>
                <Input
                  id={`it-qtd-${idx}`}
                  type="number"
                  min={1}
                  value={it.quantidade}
                  onChange={(e) =>
                    setItem(idx, { quantidade: Number(e.target.value) })
                  }
                />
              </div>
              <div className="flex flex-col gap-xs">
                <Label htmlFor={`it-vu-${idx}`}>Valor unitário</Label>
                <Input
                  id={`it-vu-${idx}`}
                  type="number"
                  min={0}
                  step="0.01"
                  value={it.valor_unitario}
                  onChange={(e) =>
                    setItem(idx, { valor_unitario: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <PhotoUpload
                label="Foto do modelo"
                pasta="modelo"
                value={it.foto_modelo_url}
                onChange={(url) => setItem(idx, { foto_modelo_url: url })}
              />
              <PhotoUpload
                label="Foto do tecido"
                pasta="tecido"
                value={it.foto_tecido_url}
                onChange={(url) => setItem(idx, { foto_tecido_url: url })}
              />
            </div>
            <div className="flex flex-col gap-xs">
              <Label htmlFor={`it-obs-${idx}`}>Observações</Label>
              <Textarea
                id={`it-obs-${idx}`}
                rows={2}
                value={it.observacoes}
                onChange={(e) =>
                  setItem(idx, { observacoes: e.target.value })
                }
              />
            </div>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-end gap-sm sticky bottom-md pt-md">
        <Button
          variant="secondary"
          onClick={() => router.push(`/vendas/${id}`)}
          disabled={atualizar.isPending}
        >
          Cancelar
        </Button>
        <Button onClick={salvar} disabled={atualizar.isPending}>
          {atualizar.isPending ? "Salvando…" : "Salvar alterações"}
        </Button>
      </div>
    </div>
  );
}
