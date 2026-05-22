import { Badge } from "@/components/ui/badge";
import {
  VENDA_STATUS_LABEL,
  VENDA_STATUS_TONE,
  PRODUCAO_STATUS_LABEL,
  FINANCEIRO_STATUS_LABEL,
  FINANCEIRO_STATUS_TONE,
} from "@/lib/constants";
import type {
  FinanceiroStatus,
  ProducaoStatus,
  VendaStatus,
} from "@/types/database.types";

const PRODUCAO_TONE: Record<
  ProducaoStatus,
  "neutral" | "warning" | "success" | "muted"
> = {
  aguardando_inicio: "neutral",
  em_producao: "warning",
  controle_qualidade: "warning",
  pronto: "success",
  expedicao: "success",
  entregue: "muted",
};

export function VendaStatusBadge({ status }: { status: VendaStatus }) {
  return (
    <Badge tone={VENDA_STATUS_TONE[status]}>{VENDA_STATUS_LABEL[status]}</Badge>
  );
}

export function ProducaoStatusBadge({ status }: { status: ProducaoStatus }) {
  return (
    <Badge tone={PRODUCAO_TONE[status]}>{PRODUCAO_STATUS_LABEL[status]}</Badge>
  );
}

export function FinanceiroStatusBadge({ status }: { status: FinanceiroStatus }) {
  return (
    <Badge tone={FINANCEIRO_STATUS_TONE[status]}>
      {FINANCEIRO_STATUS_LABEL[status]}
    </Badge>
  );
}
