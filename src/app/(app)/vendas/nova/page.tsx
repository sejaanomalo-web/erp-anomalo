"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PhotoUpload } from "@/components/forms/PhotoUpload";
import { toast } from "@/components/feedback/Toast";
import { formatCurrency } from "@/lib/utils";
import { FORMAS_PAGAMENTO } from "@/lib/constants";
import { useCriarVenda } from "@/lib/queries/vendas";
import { useMeuPerfil, useVendedores } from "@/lib/queries/profiles";
import type { VendaTipo } from "@/types/database.types";

interface VendaForm {
  cliente_nome: string;
  cliente_telefone: string;
  cliente_cpf_cnpj: string;
  cliente_endereco: string;
  produto_descricao: string;
  observacoes_produto: string;
  foto_modelo_url: string | null;
  foto_tecido_url: string | null;
  quantidade: number;
  valor_unitario: number;
  desconto: number;
  taxa: number;
  forma_pagamento: string;
  parcelas: number;
  vendedor_id: string;
  data_venda: string;
  data_prevista_entrega: string;
  observacoes_venda: string;
  tipo: VendaTipo;
}

const initial: VendaForm = {
  cliente_nome: "",
  cliente_telefone: "",
  cliente_cpf_cnpj: "",
  cliente_endereco: "",
  produto_descricao: "",
  observacoes_produto: "",
  foto_modelo_url: null,
  foto_tecido_url: null,
  quantidade: 1,
  valor_unitario: 0,
  desconto: 0,
  taxa: 0,
  forma_pagamento: "pix",
  parcelas: 1,
  vendedor_id: "",
  data_venda: new Date().toISOString().slice(0, 10),
  data_prevista_entrega: "",
  observacoes_venda: "",
  tipo: "venda",
};

function calcTotal(v: VendaForm) {
  return Math.max(
    0,
    v.valor_unitario * v.quantidade - v.desconto - v.taxa,
  );
}

export default function NovaVendaPage() {
  const router = useRouter();
  const criarVenda = useCriarVenda();
  const perfil = useMeuPerfil();
  const vendedores = useVendedores();

  const steps: FormStep<VendaForm>[] = [
    {
      id: "cliente",
      titulo: "Comprador",
      descricao: "O cliente é registrado direto na venda, sem cadastro prévio.",
      validate: (v) => {
        if (v.cliente_nome.trim().length < 2)
          return "Informe o nome do cliente.";
        const tel = v.cliente_telefone.replace(/\D/g, "");
        if (tel.length < 8) return "Telefone obrigatório.";
        return null;
      },
      render: ({ values, setValues }) => (
        <div className="flex flex-col gap-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <Label htmlFor="cliente_nome">Nome do cliente</Label>
              <Input
                id="cliente_nome"
                value={values.cliente_nome}
                onChange={(e) =>
                  setValues({ ...values, cliente_nome: e.target.value })
                }
                placeholder="Nome ou razão social"
              />
            </div>
            <div className="flex flex-col gap-xs">
              <Label htmlFor="cliente_telefone">Telefone</Label>
              <Input
                id="cliente_telefone"
                type="tel"
                inputMode="tel"
                value={values.cliente_telefone}
                onChange={(e) =>
                  setValues({ ...values, cliente_telefone: e.target.value })
                }
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <Label htmlFor="cliente_cpf_cnpj">CPF ou CNPJ (opcional)</Label>
              <Input
                id="cliente_cpf_cnpj"
                value={values.cliente_cpf_cnpj}
                onChange={(e) =>
                  setValues({ ...values, cliente_cpf_cnpj: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-xs">
              <Label htmlFor="cliente_endereco">Endereço (opcional)</Label>
              <Input
                id="cliente_endereco"
                value={values.cliente_endereco}
                onChange={(e) =>
                  setValues({ ...values, cliente_endereco: e.target.value })
                }
                placeholder="Rua, número, complemento, cidade"
              />
            </div>
          </div>
          <p className="text-caption text-text-4">
            Este cliente fica salvo no CRM automaticamente após a venda.
          </p>
        </div>
      ),
    },
    {
      id: "produto",
      titulo: "Produto",
      descricao:
        "Descreva o produto vendido. As fotos servem para a equipe de produção.",
      validate: (v) => {
        if (v.produto_descricao.trim().length < 2)
          return "Descreva o produto.";
        if (v.quantidade < 1) return "Quantidade mínima é 1.";
        return null;
      },
      render: ({ values, setValues }) => (
        <div className="flex flex-col gap-md">
          <div className="flex flex-col gap-xs">
            <Label htmlFor="produto_descricao">Descrição do produto</Label>
            <Input
              id="produto_descricao"
              value={values.produto_descricao}
              onChange={(e) =>
                setValues({ ...values, produto_descricao: e.target.value })
              }
              placeholder="Sofá 3 lugares retrátil, tecido suede grafite, 2,40m"
            />
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <PhotoUpload
              label="Foto do modelo"
              pasta="modelo"
              value={values.foto_modelo_url}
              onChange={(url) =>
                setValues({ ...values, foto_modelo_url: url })
              }
              hint="Ajuda a equipe de produção a confirmar a peça."
            />
            <PhotoUpload
              label="Foto do tecido"
              pasta="tecido"
              value={values.foto_tecido_url}
              onChange={(url) =>
                setValues({ ...values, foto_tecido_url: url })
              }
              hint="Garante que a referência de tecido fica registrada."
            />
          </div>

          <div className="flex flex-col gap-xs">
            <Label htmlFor="observacoes_produto">Observações</Label>
            <Textarea
              id="observacoes_produto"
              rows={3}
              value={values.observacoes_produto}
              onChange={(e) =>
                setValues({ ...values, observacoes_produto: e.target.value })
              }
              placeholder="Detalhes de costura, almofadas extras, costura contrastante, etc."
            />
          </div>
        </div>
      ),
    },
    {
      id: "valores",
      titulo: "Valores e condição",
      descricao:
        "Preço, desconto, taxa (ex.: cartão), forma de pagamento e vendedor responsável.",
      validate: (v) => {
        if (v.valor_unitario <= 0) return "Informe o valor unitário.";
        if (!v.vendedor_id) return "Selecione o vendedor responsável.";
        return null;
      },
      render: ({ values, setValues }) => {
        const total = calcTotal(values);
        return (
          <div className="flex flex-col gap-md">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
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
                <Label htmlFor="taxa">Taxa</Label>
                <Input
                  id="taxa"
                  type="number"
                  min={0}
                  step="0.01"
                  value={values.taxa}
                  onChange={(e) =>
                    setValues({ ...values, taxa: Number(e.target.value) })
                  }
                />
                <span className="text-caption text-text-4">
                  Ex.: máquina de cartão, juros.
                </span>
              </div>
              <div className="flex flex-col gap-xs">
                <Label>Total</Label>
                <span className="h-10 inline-flex items-center text-h3 tabular-nums text-text-1">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
              <div className="flex flex-col gap-xs">
                <Label>Forma de pagamento</Label>
                <Select
                  value={values.forma_pagamento}
                  onValueChange={(v) =>
                    setValues({ ...values, forma_pagamento: v })
                  }
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
                <Label htmlFor="parcelas">Parcelas</Label>
                <Input
                  id="parcelas"
                  type="number"
                  min={1}
                  max={48}
                  value={values.parcelas}
                  onChange={(e) =>
                    setValues({ ...values, parcelas: Number(e.target.value) })
                  }
                />
              </div>
              <div className="flex flex-col gap-xs">
                <Label>Vendedor responsável</Label>
                <Select
                  value={values.vendedor_id}
                  onValueChange={(v) =>
                    setValues({ ...values, vendedor_id: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        vendedores.isLoading
                          ? "Carregando…"
                          : (vendedores.data?.length ?? 0) === 0
                            ? "Nenhum cadastrado"
                            : "Selecionar"
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
          </div>
        );
      },
    },
    {
      id: "prazos",
      titulo: "Prazos e entrega",
      descricao:
        "Data do cadastro e data prevista de entrega ao cliente.",
      validate: (v) =>
        !v.data_prevista_entrega
          ? "Defina a data prevista de entrega."
          : null,
      render: ({ values, setValues }) => (
        <div className="flex flex-col gap-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <Label htmlFor="data_venda">Data do cadastro</Label>
              <Input
                id="data_venda"
                type="date"
                value={values.data_venda}
                onChange={(e) =>
                  setValues({ ...values, data_venda: e.target.value })
                }
              />
              <span className="text-caption text-text-4">
                Dia em que você está registrando esta venda.
              </span>
            </div>
            <div className="flex flex-col gap-xs">
              <Label htmlFor="data_prevista_entrega">
                Data prevista de entrega
              </Label>
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
              <span className="text-caption text-text-4">
                Combinado com o cliente para a entrega final.
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-xs">
            <Label htmlFor="observacoes_venda">
              Observações da venda (opcional)
            </Label>
            <Textarea
              id="observacoes_venda"
              rows={2}
              value={values.observacoes_venda}
              onChange={(e) =>
                setValues({ ...values, observacoes_venda: e.target.value })
              }
            />
          </div>
        </div>
      ),
    },
    {
      id: "revisao",
      titulo: "Revisão",
      descricao:
        "Confirme se é orçamento ou venda fechada antes de registrar.",
      render: ({ values, setValues }) => {
        const total = calcTotal(values);
        const vendedorNome =
          vendedores.data?.find((v) => v.id === values.vendedor_id)?.nome ??
          "—";
        const linhas: [string, string][] = [
          ["Cliente", values.cliente_nome || "—"],
          ["Telefone", values.cliente_telefone || "—"],
          ["Produto", values.produto_descricao || "—"],
          ["Quantidade", String(values.quantidade)],
          ["Valor unitário", formatCurrency(values.valor_unitario)],
          ["Desconto", formatCurrency(values.desconto)],
          ["Taxa", formatCurrency(values.taxa)],
          ["Total", formatCurrency(total)],
          [
            "Forma",
            `${values.forma_pagamento}${values.parcelas > 1 ? ` · ${values.parcelas}x` : ""}`,
          ],
          ["Vendedor", vendedorNome],
          ["Data do cadastro", values.data_venda],
          ["Entrega prevista", values.data_prevista_entrega || "—"],
        ];
        return (
          <div className="flex flex-col gap-md">
            <fieldset className="flex flex-col gap-sm">
              <legend className="text-label-caps text-text-3 mb-xs">
                Esta venda é
              </legend>
              <RadioGroup
                value={values.tipo}
                onValueChange={(v) =>
                  setValues({ ...values, tipo: v as VendaTipo })
                }
                className="grid grid-cols-1 md:grid-cols-2 gap-sm"
              >
                <label
                  htmlFor="tipo-orcamento"
                  className={`solid-surface solid-surface-hover p-md cursor-pointer flex items-start gap-sm ${values.tipo === "orcamento" ? "border-accent-strong" : ""}`}
                >
                  <RadioGroupItem
                    id="tipo-orcamento"
                    value="orcamento"
                    className="mt-1"
                  />
                  <div className="flex flex-col gap-xxs">
                    <span className="text-body-md text-text-1">Orçamento</span>
                    <span className="text-body-sm text-text-3">
                      Negociação em aberto. Não vira produção ainda.
                    </span>
                  </div>
                </label>
                <label
                  htmlFor="tipo-venda"
                  className={`solid-surface solid-surface-hover p-md cursor-pointer flex items-start gap-sm ${values.tipo === "venda" ? "border-accent-strong" : ""}`}
                >
                  <RadioGroupItem
                    id="tipo-venda"
                    value="venda"
                    className="mt-1"
                  />
                  <div className="flex flex-col gap-xxs">
                    <span className="text-body-md text-text-1">
                      Venda fechada
                    </span>
                    <span className="text-body-sm text-text-3">
                      Cria produção automaticamente.
                    </span>
                  </div>
                </label>
              </RadioGroup>
            </fieldset>

            <dl className="solid-surface divide-y divide-border-thin">
              {linhas.map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-start justify-between gap-md px-md py-sm"
                >
                  <dt className="text-label-caps text-text-3">{k}</dt>
                  <dd className="text-body-md text-text-1 text-right">
                    {v || "—"}
                  </dd>
                </div>
              ))}
            </dl>

            {(values.foto_modelo_url || values.foto_tecido_url) && (
              <div className="grid grid-cols-2 gap-md">
                {values.foto_modelo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={values.foto_modelo_url}
                    alt="Modelo"
                    className="w-full aspect-[4/3] object-cover border border-border-thin"
                  />
                )}
                {values.foto_tecido_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={values.foto_tecido_url}
                    alt="Tecido"
                    className="w-full aspect-[4/3] object-cover border border-border-thin"
                  />
                )}
              </div>
            )}
          </div>
        );
      },
    },
  ];

  // Default do vendedor: usuário logado (uma vez)
  // - Não usamos useEffect global do MultiStepForm porque ele controla seu próprio state.
  //   Em vez disso, fazemos `initialValues` ser dinâmico via key remontando o form.
  const initialValues: VendaForm = {
    ...initial,
    vendedor_id: perfil.data?.id ?? "",
  };

  return (
    <NovaVendaInner
      key={perfil.data?.id ?? "loading"}
      initial={initialValues}
      steps={steps}
      onSubmit={async (values) => {
        const valorTotal = calcTotal(values);
        const result = await criarVenda.mutateAsync({
          cliente_inline: {
            nome: values.cliente_nome.trim(),
            telefone: values.cliente_telefone.trim(),
            cpf_cnpj: values.cliente_cpf_cnpj.trim() || null,
            endereco: values.cliente_endereco.trim() || null,
          },
          vendedor_id: values.vendedor_id || null,
          tipo: values.tipo,
          valor_total: valorTotal,
          desconto: values.desconto,
          taxa: values.taxa,
          forma_pagamento: values.forma_pagamento,
          parcelas: values.parcelas,
          data_venda: values.data_venda,
          data_prevista_entrega: values.data_prevista_entrega,
          observacoes: values.observacoes_venda || null,
          itens: [
            {
              produto_descricao: values.produto_descricao.trim(),
              quantidade: values.quantidade,
              valor_unitario: values.valor_unitario,
              observacoes: values.observacoes_produto || null,
              foto_modelo_url: values.foto_modelo_url,
              foto_tecido_url: values.foto_tecido_url,
            },
          ],
        });
        toast.success(
          values.tipo === "orcamento"
            ? "Orçamento registrado."
            : "Venda registrada.",
          { description: `Número #${result.numero}.` },
        );
        router.push(`/vendas/${result.id}`);
      }}
    />
  );
}

// Wrapper apenas para que o MultiStepForm seja remontado quando o perfil carregar,
// permitindo o defaultValue do vendedor_id ser aplicado.
function NovaVendaInner({
  initial: initialValues,
  steps,
  onSubmit,
}: {
  initial: VendaForm;
  steps: FormStep<VendaForm>[];
  onSubmit: (values: VendaForm) => Promise<void>;
}) {
  // Inferir o componente sem ciclo de import
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {}, []);

  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Operação"
        titulo="Nova venda"
        descricao="Cadastro em cinco passos. O cliente entra direto no CRM."
      />
      <div className="max-w-3xl">
        <MultiStepForm
          steps={steps}
          initialValues={initialValues}
          autoSaveKey="erp-anomalo:nova-venda-v3"
          textoFinal="Registrar"
          onComplete={onSubmit}
        />
      </div>
    </div>
  );
}
