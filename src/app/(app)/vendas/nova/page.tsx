"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Hero } from "@/components/sections/Hero";
import { MultiStepForm, type FormStep } from "@/components/forms/MultiStepForm";
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
import { toast } from "@/components/feedback/Toast";
import { formatCurrency } from "@/lib/utils";
import { COMISSAO_DEFAULT_PERCENT } from "@/lib/constants";
import { useClientes, useCriarCliente } from "@/lib/queries/clientes";
import { useProdutoVariantes } from "@/lib/queries/produtos";
import { useCriarVenda } from "@/lib/queries/vendas";

interface VendaForm {
  cliente_id: string;
  cliente_novo_nome: string;
  cliente_novo_email: string;
  produto_variante_id: string;
  quantidade: number;
  customizacoes: string;
  valor_unitario: number;
  desconto: number;
  forma_pagamento: "pix" | "cartao" | "boleto" | "dinheiro" | "transferencia";
  parcelas: number;
  data_venda: string;
  data_prevista_entrega: string;
  observacoes: string;
}

const initial: VendaForm = {
  cliente_id: "",
  cliente_novo_nome: "",
  cliente_novo_email: "",
  produto_variante_id: "",
  quantidade: 1,
  customizacoes: "",
  valor_unitario: 0,
  desconto: 0,
  forma_pagamento: "pix",
  parcelas: 1,
  data_venda: new Date().toISOString().slice(0, 10),
  data_prevista_entrega: "",
  observacoes: "",
};

export default function NovaVendaPage() {
  const router = useRouter();
  const clientes = useClientes();
  const variantes = useProdutoVariantes();
  const criarCliente = useCriarCliente();
  const criarVenda = useCriarVenda();

  const variantePorId = useMemo(() => {
    const map = new Map<
      string,
      { id: string; nome: string; produto: string; preco: number }
    >();
    for (const v of variantes.data ?? []) {
      map.set(v.id, {
        id: v.id,
        nome: v.nome,
        produto: v.produto?.nome ?? "",
        preco: Number(v.preco_venda ?? 0),
      });
    }
    return map;
  }, [variantes.data]);

  const steps: FormStep<VendaForm>[] = [
    {
      id: "cliente",
      titulo: "Comprador",
      descricao: "Selecione um cliente existente ou cadastre novo.",
      validate: (v) => {
        if (v.cliente_id) return null;
        if (v.cliente_novo_nome.trim().length < 2)
          return "Selecione um cliente ou informe nome para criar.";
        return null;
      },
      render: ({ values, setValues }) => (
        <div className="flex flex-col gap-md">
          <div className="flex flex-col gap-xs">
            <Label>Cliente existente</Label>
            <Select
              value={values.cliente_id}
              onValueChange={(v) =>
                setValues({
                  ...values,
                  cliente_id: v,
                  cliente_novo_nome: "",
                  cliente_novo_email: "",
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  clientes.isLoading
                    ? "Carregando…"
                    : clientes.data?.length
                      ? "Selecionar"
                      : "Nenhum cliente cadastrado"
                } />
              </SelectTrigger>
              <SelectContent>
                {(clientes.data ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-label-caps text-text-3">ou cadastrar novo</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <Label htmlFor="cliente_novo_nome">Nome</Label>
              <Input
                id="cliente_novo_nome"
                value={values.cliente_novo_nome}
                onChange={(e) =>
                  setValues({
                    ...values,
                    cliente_novo_nome: e.target.value,
                    cliente_id: "",
                  })
                }
              />
            </div>
            <div className="flex flex-col gap-xs">
              <Label htmlFor="cliente_novo_email">E-mail (opcional)</Label>
              <Input
                id="cliente_novo_email"
                type="email"
                value={values.cliente_novo_email}
                onChange={(e) =>
                  setValues({ ...values, cliente_novo_email: e.target.value })
                }
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "produto",
      titulo: "Produto",
      descricao: "Variante e quantidade.",
      validate: (v) => {
        if (!v.produto_variante_id) return "Escolha uma variante.";
        if (v.quantidade < 1) return "Quantidade mínima é 1.";
        return null;
      },
      render: ({ values, setValues }) => (
        <div className="flex flex-col gap-md">
          <div className="flex flex-col gap-xs">
            <Label>Variante</Label>
            <Select
              value={values.produto_variante_id}
              onValueChange={(v) => {
                const variante = variantePorId.get(v);
                setValues({
                  ...values,
                  produto_variante_id: v,
                  valor_unitario:
                    values.valor_unitario || (variante?.preco ?? 0),
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  variantes.isLoading
                    ? "Carregando…"
                    : variantes.data?.length
                      ? "Selecionar variante"
                      : "Nenhuma variante cadastrada"
                } />
              </SelectTrigger>
              <SelectContent>
                {(variantes.data ?? []).map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.produto?.nome} · {v.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-xs max-w-[160px]">
            <Label htmlFor="quantidade">Quantidade</Label>
            <Input
              id="quantidade"
              type="number"
              min={1}
              value={values.quantidade}
              onChange={(e) =>
                setValues({ ...values, quantidade: Number(e.target.value) })
              }
            />
          </div>
          <div className="flex flex-col gap-xs">
            <Label htmlFor="customizacoes">Personalizações</Label>
            <Textarea
              id="customizacoes"
              rows={3}
              value={values.customizacoes}
              onChange={(e) =>
                setValues({ ...values, customizacoes: e.target.value })
              }
              placeholder="Costura contrastante, almofadas extras, etc."
            />
          </div>
        </div>
      ),
    },
    {
      id: "valores",
      titulo: "Valores e condição",
      descricao: "Preço, desconto e forma de pagamento.",
      validate: (v) =>
        v.valor_unitario <= 0 ? "Informe o valor unitário." : null,
      render: ({ values, setValues }) => {
        const total = values.valor_unitario * values.quantidade - values.desconto;
        const comissao = (Math.max(0, total) * COMISSAO_DEFAULT_PERCENT) / 100;
        return (
          <div className="flex flex-col gap-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
              <div className="flex flex-col gap-xs">
                <Label htmlFor="valor_unitario">Valor unitário</Label>
                <Input
                  id="valor_unitario"
                  type="number"
                  min={0}
                  step="0.01"
                  value={values.valor_unitario}
                  onChange={(e) =>
                    setValues({
                      ...values,
                      valor_unitario: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="flex flex-col gap-xs">
                <Label htmlFor="desconto">Desconto</Label>
                <Input
                  id="desconto"
                  type="number"
                  min={0}
                  step="0.01"
                  value={values.desconto}
                  onChange={(e) =>
                    setValues({ ...values, desconto: Number(e.target.value) })
                  }
                />
              </div>
              <div className="flex flex-col gap-xs">
                <Label>Total</Label>
                <span className="h-10 inline-flex items-center text-h3 tabular-nums text-text-1">
                  {formatCurrency(Math.max(0, total))}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="flex flex-col gap-xs">
                <Label>Forma de pagamento</Label>
                <Select
                  value={values.forma_pagamento}
                  onValueChange={(v) =>
                    setValues({
                      ...values,
                      forma_pagamento: v as VendaForm["forma_pagamento"],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="cartao">Cartão</SelectItem>
                    <SelectItem value="boleto">Boleto</SelectItem>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-xs max-w-[160px]">
                <Label htmlFor="parcelas">Parcelas</Label>
                <Input
                  id="parcelas"
                  type="number"
                  min={1}
                  max={24}
                  value={values.parcelas}
                  onChange={(e) =>
                    setValues({ ...values, parcelas: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="solid-surface p-md flex items-center justify-between gap-md">
              <div className="flex flex-col gap-xxs">
                <span className="text-label-caps text-text-3">
                  Comissão estimada
                </span>
                <span className="text-body-sm text-text-3">
                  {COMISSAO_DEFAULT_PERCENT}% sobre {formatCurrency(Math.max(0, total))}
                </span>
              </div>
              <span className="text-h3 text-accent tabular-nums">
                {formatCurrency(comissao)}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      id: "prazos",
      titulo: "Prazos e entrega",
      descricao: "Datas e observações.",
      validate: (v) =>
        !v.data_prevista_entrega ? "Defina a data prevista de entrega." : null,
      render: ({ values, setValues }) => (
        <div className="flex flex-col gap-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <Label htmlFor="data_venda">Data da venda</Label>
              <Input
                id="data_venda"
                type="date"
                value={values.data_venda}
                onChange={(e) =>
                  setValues({ ...values, data_venda: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-xs">
              <Label htmlFor="data_prevista_entrega">Entrega prevista</Label>
              <Input
                id="data_prevista_entrega"
                type="date"
                value={values.data_prevista_entrega}
                onChange={(e) =>
                  setValues({
                    ...values,
                    data_prevista_entrega: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="flex flex-col gap-xs">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              rows={2}
              value={values.observacoes}
              onChange={(e) =>
                setValues({ ...values, observacoes: e.target.value })
              }
            />
          </div>
        </div>
      ),
    },
    {
      id: "revisao",
      titulo: "Revisão",
      descricao: "Confira antes de confirmar.",
      render: ({ values }) => {
        const total = values.valor_unitario * values.quantidade - values.desconto;
        const variante = variantePorId.get(values.produto_variante_id);
        const clienteSelecionado =
          clientes.data?.find((c) => c.id === values.cliente_id)?.nome ??
          values.cliente_novo_nome;
        const linhas: [string, string][] = [
          ["Cliente", clienteSelecionado || "—"],
          ["Produto", variante ? `${variante.produto} · ${variante.nome}` : "—"],
          ["Quantidade", String(values.quantidade)],
          ["Valor unitário", formatCurrency(values.valor_unitario)],
          ["Desconto", formatCurrency(values.desconto)],
          ["Total", formatCurrency(Math.max(0, total))],
          [
            "Forma",
            `${values.forma_pagamento}${values.parcelas > 1 ? ` · ${values.parcelas}x` : ""}`,
          ],
          ["Data venda", values.data_venda],
          ["Entrega", values.data_prevista_entrega],
        ];
        return (
          <dl className="solid-surface divide-y divide-border-thin">
            {linhas.map(([k, v]) => (
              <div
                key={k}
                className="flex items-start justify-between gap-md px-md py-sm"
              >
                <dt className="text-label-caps text-text-3">{k}</dt>
                <dd className="text-body-md text-text-1 text-right">{v || "—"}</dd>
              </div>
            ))}
          </dl>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Operação"
        titulo="Nova venda"
        descricao="Cadastro em cinco passos. Rascunho salvo automaticamente."
      />
      <div className="max-w-3xl">
        <MultiStepForm
          steps={steps}
          initialValues={initial}
          autoSaveKey="erp-anomalo:nova-venda"
          textoFinal="Confirmar venda"
          onComplete={async (values) => {
            let clienteId = values.cliente_id;
            if (!clienteId) {
              const novo = await criarCliente.mutateAsync({
                nome: values.cliente_novo_nome.trim(),
                email: values.cliente_novo_email.trim() || null,
              });
              clienteId = novo.id;
            }
            const valorItens = values.valor_unitario * values.quantidade;
            const result = await criarVenda.mutateAsync({
              cliente_id: clienteId,
              valor_total: Math.max(0, valorItens - values.desconto),
              desconto: values.desconto,
              forma_pagamento: values.forma_pagamento,
              parcelas: values.parcelas,
              data_venda: values.data_venda,
              data_prevista_entrega: values.data_prevista_entrega,
              observacoes: values.observacoes || null,
              itens: [
                {
                  produto_variante_id: values.produto_variante_id,
                  quantidade: values.quantidade,
                  valor_unitario: values.valor_unitario,
                  customizacoes: values.customizacoes || null,
                },
              ],
            });
            toast.success("Venda registrada.", {
              description: `Número #${result.numero}.`,
            });
            router.push(`/vendas/${result.id}`);
          }}
        />
      </div>
    </div>
  );
}
