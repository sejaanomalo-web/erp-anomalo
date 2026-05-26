"use client";

import { use, useState } from "react";
import { AnomaloMark } from "@/components/brand/AnomaloMark";
import { GoldDivider } from "@/components/brand/GoldDivider";
import { Eyebrow } from "@/components/brand/Eyebrow";
import { Button } from "@/components/ui/button";
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
import { formatCurrency } from "@/lib/utils";

interface PublicVendaForm {
  cliente: string;
  cliente_email: string;
  produto: string;
  variante: string;
  quantidade: number;
  valor_unitario: number;
  desconto: number;
  forma_pagamento: string;
  parcelas: number;
  data_prevista_entrega: string;
  endereco: string;
  observacoes: string;
}

const initial: PublicVendaForm = {
  cliente: "",
  cliente_email: "",
  produto: "",
  variante: "",
  quantidade: 1,
  valor_unitario: 0,
  desconto: 0,
  forma_pagamento: "pix",
  parcelas: 1,
  data_prevista_entrega: "",
  endereco: "",
  observacoes: "",
};

export default function FormularioPublicoPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [submetido, setSubmetido] = useState<{ numero: number } | null>(null);

  const steps: FormStep<PublicVendaForm>[] = [
    {
      id: "cliente",
      titulo: "Cliente",
      validate: (v) => (v.cliente.trim().length < 2 ? "Informe o cliente." : null),
      render: ({ values, setValues }) => (
        <div className="flex flex-col gap-md">
          <div className="flex flex-col gap-xs">
            <Label htmlFor="cliente">Nome</Label>
            <Input
              id="cliente"
              value={values.cliente}
              onChange={(e) => setValues({ ...values, cliente: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-xs">
            <Label htmlFor="cliente_email">E-mail (opcional)</Label>
            <Input
              id="cliente_email"
              type="email"
              value={values.cliente_email}
              onChange={(e) =>
                setValues({ ...values, cliente_email: e.target.value })
              }
            />
          </div>
        </div>
      ),
    },
    {
      id: "produto",
      titulo: "Produto",
      validate: (v) => {
        if (!v.produto.trim()) return "Informe o produto.";
        if (!v.variante.trim()) return "Informe a variante.";
        return null;
      },
      render: ({ values, setValues }) => (
        <div className="flex flex-col gap-md">
          <div className="flex flex-col gap-xs">
            <Label htmlFor="produto">Produto</Label>
            <Input
              id="produto"
              value={values.produto}
              onChange={(e) => setValues({ ...values, produto: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-xs">
            <Label htmlFor="variante">Variante</Label>
            <Input
              id="variante"
              value={values.variante}
              onChange={(e) => setValues({ ...values, variante: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-xs max-w-[160px]">
            <Label htmlFor="qtd">Quantidade</Label>
            <Input
              id="qtd"
              type="number"
              min={1}
              value={values.quantidade}
              onChange={(e) =>
                setValues({ ...values, quantidade: Number(e.target.value) })
              }
            />
          </div>
        </div>
      ),
    },
    {
      id: "valores",
      titulo: "Valores",
      validate: (v) => (v.valor_unitario <= 0 ? "Informe o valor unitário." : null),
      render: ({ values, setValues }) => {
        const total = values.valor_unitario * values.quantidade - values.desconto;
        return (
          <div className="flex flex-col gap-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
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
            </div>
            <div className="solid-surface p-md flex items-center justify-between">
              <span className="text-label-caps text-text-3">Total</span>
              <span className="text-h3 tabular-nums text-text-1">
                {formatCurrency(total)}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
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
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="cartao">Cartão</SelectItem>
                    <SelectItem value="boleto">Boleto</SelectItem>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
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
          </div>
        );
      },
    },
    {
      id: "entrega",
      titulo: "Entrega",
      validate: (v) =>
        !v.data_prevista_entrega ? "Informe a data prevista." : null,
      render: ({ values, setValues }) => (
        <div className="flex flex-col gap-md">
          <div className="flex flex-col gap-xs">
            <Label htmlFor="data">Data prevista</Label>
            <Input
              id="data"
              type="date"
              value={values.data_prevista_entrega}
              onChange={(e) =>
                setValues({ ...values, data_prevista_entrega: e.target.value })
              }
            />
          </div>
          <div className="flex flex-col gap-xs">
            <Label htmlFor="endereco">Endereço</Label>
            <Textarea
              id="endereco"
              rows={3}
              value={values.endereco}
              onChange={(e) => setValues({ ...values, endereco: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-xs">
            <Label htmlFor="obs">Observações</Label>
            <Textarea
              id="obs"
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
  ];

  if (submetido) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-md py-2xl">
        <div className="w-full max-w-md flex flex-col gap-lg">
          <div className="flex items-center gap-2 text-text-1 font-semibold text-base tracking-[0.08em]">
            <AnomaloMark size={18} className="text-accent" decorative={false} />
            TꓥTO ESTOFADOS
          </div>
          <div className="flex flex-col gap-sm">
            <Eyebrow>Venda registrada</Eyebrow>
            <h1 className="text-h1 text-text-1">Obrigado.</h1>
            <GoldDivider className="mt-xs" />
            <p className="text-body-md text-text-3">
              Sua venda recebeu o número{" "}
              <span className="text-text-1 tabular-nums">#{submetido.numero}</span>.
              Vamos avançar internamente e te avisar sobre os próximos passos.
            </p>
          </div>
          <Button onClick={() => setSubmetido(null)}>Cadastrar outra venda</Button>
        </div>
        <AnomaloMark />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-md py-2xl">
      <div className="mx-auto w-full max-w-xl flex flex-col gap-lg">
        <div className="flex items-center justify-between gap-sm">
          <div className="flex items-center gap-2 text-text-1 font-semibold text-base tracking-[0.08em]">
            <AnomaloMark size={18} className="text-accent" decorative={false} />
            TꓥTO ESTOFADOS
          </div>
          <span className="text-caption text-text-4">
            link · {token.slice(0, 6)}…
          </span>
        </div>
        <div className="flex flex-col gap-sm">
          <Eyebrow>Cadastro</Eyebrow>
          <h1 className="text-h1 text-text-1">Nova venda</h1>
          <GoldDivider className="mt-xs" />
          <p className="text-body-md text-text-3">
            Preencha os passos abaixo. Rascunho salvo automaticamente.
          </p>
        </div>
        <MultiStepForm
          steps={steps}
          initialValues={initial}
          autoSaveKey={`formulario-publico:${token}`}
          textoFinal="Enviar venda"
          onComplete={async () => {
            await new Promise((r) => setTimeout(r, 400));
            // TODO: chamar API server-side validando o token e gravando a venda.
            const numero = Math.floor(2000 + Math.random() * 9999);
            setSubmetido({ numero });
          }}
        />
      </div>
      <AnomaloMark />
    </div>
  );
}
