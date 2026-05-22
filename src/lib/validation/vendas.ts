import { z } from "zod";

export const itemVendaSchema = z.object({
  produto_descricao: z.string().min(1, "Descreva o produto."),
  produto_variante_id: z.string().uuid().nullable().optional(),
  quantidade: z.number().int().min(1, "Quantidade mínima é 1."),
  valor_unitario: z.number().min(0),
  observacoes: z.string().nullable().optional(),
  foto_modelo_url: z.string().url().nullable().optional(),
  foto_tecido_url: z.string().url().nullable().optional(),
});

export const clienteInlineSchema = z.object({
  nome: z.string().min(2, "Nome do cliente é obrigatório."),
  telefone: z.string().min(8, "Telefone obrigatório."),
  cpf_cnpj: z.string().nullable().optional(),
  endereco: z.string().nullable().optional(),
});

export const criarVendaSchema = z
  .object({
    cliente_id: z.string().uuid().nullable().optional(),
    cliente_inline: clienteInlineSchema.nullable().optional(),
    tipo: z.enum(["orcamento", "venda"]).default("venda"),
    valor_total: z.number().min(0),
    desconto: z.number().min(0).default(0),
    forma_pagamento: z.string().nullable().optional(),
    parcelas: z.number().int().min(1).max(48).default(1),
    data_venda: z.string(),
    data_prevista_entrega: z.string(),
    data_prevista_producao: z.string().nullable().optional(),
    observacoes: z.string().nullable().optional(),
    itens: z.array(itemVendaSchema).min(1, "Inclua ao menos um item."),
  })
  .refine(
    (v) => Boolean(v.cliente_id) || Boolean(v.cliente_inline),
    "Informe um cliente existente ou cadastre inline.",
  );

export type CriarVendaInput = z.infer<typeof criarVendaSchema>;
export type ClienteInline = z.infer<typeof clienteInlineSchema>;
