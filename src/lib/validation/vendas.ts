import { z } from "zod";

export const itemVendaSchema = z.object({
  produto_variante_id: z.string().uuid(),
  quantidade: z.number().int().min(1),
  valor_unitario: z.number().min(0),
  customizacoes: z.string().optional().nullable(),
});

export const criarVendaSchema = z.object({
  cliente_id: z.string().uuid("Selecione um cliente válido."),
  valor_total: z.number().min(0),
  desconto: z.number().min(0).default(0),
  forma_pagamento: z
    .enum(["pix", "cartao", "boleto", "dinheiro", "transferencia"])
    .nullable()
    .optional(),
  parcelas: z.number().int().min(1).max(24).default(1),
  data_venda: z.string(),
  data_prevista_entrega: z.string(),
  data_prevista_producao: z.string().nullable().optional(),
  observacoes: z.string().nullable().optional(),
  itens: z.array(itemVendaSchema).min(1, "Inclua ao menos um item."),
});

export type CriarVendaInput = z.infer<typeof criarVendaSchema>;
