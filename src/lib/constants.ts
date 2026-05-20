import type {
  VendaStatus,
  ProducaoStatus,
  LeadStatus,
  FinanceiroStatus,
} from "@/types/database.types";

export const VENDA_STATUS_LABEL: Record<VendaStatus, string> = {
  aguardando_producao: "Aguardando produção",
  em_producao: "Em produção",
  controle_qualidade: "Controle de qualidade",
  pronto: "Pronto",
  expedicao: "Expedição",
  entregue: "Entregue",
  cancelada: "Cancelada",
};

export const VENDA_STATUS_TONE: Record<VendaStatus, "neutral" | "warning" | "success" | "muted" | "error"> = {
  aguardando_producao: "neutral",
  em_producao: "warning",
  controle_qualidade: "warning",
  pronto: "success",
  expedicao: "success",
  entregue: "muted",
  cancelada: "error",
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

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  lead: "Lead",
  qualificado: "Qualificado",
  proposta: "Proposta",
  ganho: "Ganho",
  perdido: "Perdido",
};

export const LEAD_KANBAN_COLUMNS: { id: LeadStatus; titulo: string }[] = [
  { id: "lead", titulo: "Lead" },
  { id: "qualificado", titulo: "Qualificado" },
  { id: "proposta", titulo: "Proposta" },
  { id: "ganho", titulo: "Ganho" },
  { id: "perdido", titulo: "Perdido" },
];

export const FINANCEIRO_STATUS_LABEL: Record<FinanceiroStatus, string> = {
  pendente: "Pendente",
  pago: "Pago",
  atrasado: "Atrasado",
  cancelado: "Cancelado",
};

export const FINANCEIRO_STATUS_TONE: Record<FinanceiroStatus, "neutral" | "success" | "error" | "muted"> = {
  pendente: "neutral",
  pago: "success",
  atrasado: "error",
  cancelado: "muted",
};

export const COMISSAO_DEFAULT_PERCENT = 5; // % sobre valor de venda
export const AUDIT_LOG_RETENTION_YEARS = 5;
export const PAGE_SIZE_DEFAULT = 25;
export const PUBLIC_TOKEN_DEFAULT_EXPIRY_DAYS = 90;
export const PUBLIC_TOKENS_MAX_PER_VENDEDOR = 3;
export const ANEXO_MAX_BYTES = 25 * 1024 * 1024; // 25MB
export const SESSION_INACTIVITY_HOURS = 8;
