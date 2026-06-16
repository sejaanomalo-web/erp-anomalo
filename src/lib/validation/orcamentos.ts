import { z } from "zod";

// Orçamento rápido: agenda uma visita/apresentação e cria a venda tipo
// "orcamento". Campos enxutos (sem produto/valor), pois o detalhamento é
// feito depois em /vendas/[id]. dia (YYYY-MM-DD) + horario (HH:MM) viram o
// evento na agenda do vendedor.
export const criarOrcamentoSchema = z.object({
  cliente_nome: z.string().trim().min(2, "Nome do cliente é obrigatório."),
  telefone: z.string().trim().min(8, "Telefone obrigatório."),
  endereco: z.string().trim().max(300).optional().or(z.literal("")),
  dia: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data válida."),
  horario: z.string().regex(/^\d{2}:\d{2}$/, "Informe um horário válido."),
  // Vendedor responsável; default = autor da requisição (resolvido no servidor).
  vendedor_id: z.string().uuid().nullable().optional(),
  observacoes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type CriarOrcamentoInput = z.infer<typeof criarOrcamentoSchema>;
