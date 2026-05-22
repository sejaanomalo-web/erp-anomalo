import type {
  VendaStatus,
  ProducaoStatus,
  FinanceiroStatus,
  VendaTipo,
  KanbanVendaColuna,
} from "@/types/database.types";

export const VENDA_STATUS_LABEL: Record<VendaStatus, string> = {
  aguardando_producao: "Aguardando produção",
  em_producao: "Em produção",
  controle_qualidade: "Controle de qualidade",
  pronto: "Pronto",
  expedicao: "Expedição",
  entregue: "Entregue",
  cancelada: "Cancelada",
  assistencia: "Assistência",
};

export const VENDA_STATUS_TONE: Record<
  VendaStatus,
  "neutral" | "warning" | "success" | "muted" | "error" | "accent"
> = {
  aguardando_producao: "neutral",
  em_producao: "warning",
  controle_qualidade: "warning",
  pronto: "success",
  expedicao: "success",
  entregue: "muted",
  cancelada: "error",
  assistencia: "accent",
};

export const VENDA_TIPO_LABEL: Record<VendaTipo, string> = {
  orcamento: "Orçamento",
  venda: "Venda",
};

export const VENDA_TIPO_TONE: Record<VendaTipo, "warning" | "success"> = {
  orcamento: "warning",
  venda: "success",
};

export const PRODUCAO_STATUS_LABEL: Record<ProducaoStatus, string> = {
  aguardando_inicio: "Aguardando início",
  em_producao: "Em produção",
  controle_qualidade: "Controle de qualidade",
  pronto: "Pronto",
  expedicao: "Expedição",
  entregue: "Entregue",
};

export const PRODUCAO_KANBAN_COLUMNS: { id: ProducaoStatus; titulo: string }[] = [
  { id: "aguardando_inicio", titulo: "Aguardando início" },
  { id: "em_producao", titulo: "Em produção" },
  { id: "controle_qualidade", titulo: "Controle de qualidade" },
  { id: "pronto", titulo: "Pronto" },
  { id: "expedicao", titulo: "Expedição" },
  { id: "entregue", titulo: "Entregue" },
];

export const KANBAN_VENDAS_LABEL: Record<KanbanVendaColuna, string> = {
  orcamento: "Orçamento",
  fechado: "Fechado",
  entregue: "Entregue",
  assistencia: "Assistência",
};

export const KANBAN_VENDAS_COLUMNS: { id: KanbanVendaColuna; titulo: string }[] = [
  { id: "orcamento", titulo: "Orçamento" },
  { id: "fechado", titulo: "Fechado" },
  { id: "entregue", titulo: "Entregue" },
  { id: "assistencia", titulo: "Assistência" },
];

export const FINANCEIRO_STATUS_LABEL: Record<FinanceiroStatus, string> = {
  pendente: "Pendente",
  pago: "Pago",
  atrasado: "Atrasado",
  cancelado: "Cancelado",
};

export const FINANCEIRO_STATUS_TONE: Record<
  FinanceiroStatus,
  "neutral" | "success" | "error" | "muted"
> = {
  pendente: "neutral",
  pago: "success",
  atrasado: "error",
  cancelado: "muted",
};

export const FORMAS_PAGAMENTO: { value: string; label: string }[] = [
  { value: "pix", label: "PIX" },
  { value: "cartao_credito", label: "Cartão de crédito" },
  { value: "cartao_debito", label: "Cartão de débito" },
  { value: "boleto", label: "Boleto" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "transferencia", label: "Transferência" },
  { value: "cheque", label: "Cheque" },
];

export const COMISSAO_DEFAULT_PERCENT = 5; // % sobre valor de venda
export const AUDIT_LOG_RETENTION_YEARS = 5;
export const PAGE_SIZE_DEFAULT = 25;
export const PUBLIC_TOKEN_DEFAULT_EXPIRY_DAYS = 90;
export const PUBLIC_TOKENS_MAX_PER_VENDEDOR = 3;
export const ANEXO_MAX_BYTES = 25 * 1024 * 1024; // 25MB
export const SESSION_INACTIVITY_HOURS = 8;
export const FOTO_PRODUTO_MAX_BYTES = 8 * 1024 * 1024; // 8MB por foto
export const FOTO_PRODUTO_MIME_PERMITIDOS = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

/**
 * Mapeia o estado interno (tipo + status) para a coluna do Kanban operacional.
 */
export function kanbanVendaColuna(
  tipo: VendaTipo,
  status: VendaStatus,
): KanbanVendaColuna {
  if (tipo === "orcamento") return "orcamento";
  if (status === "assistencia") return "assistencia";
  if (status === "entregue") return "entregue";
  return "fechado";
}
