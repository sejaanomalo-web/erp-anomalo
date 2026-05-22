import type { Papel, PermissoesExtras, Profile } from "@/types/database.types";

export type Modulo =
  | "vendas"
  | "producao"
  | "estoque"
  | "financeiro"
  | "crm"
  | "materiais"
  | "vendedores"
  | "relatorios"
  | "configuracoes"
  | "agenda";

export type Acao = "create" | "read" | "update" | "delete";

type AcaoMap = Partial<Record<Acao, boolean | "self">>;

type PapelMatrix = Partial<Record<Modulo, AcaoMap>>;

const FULL: AcaoMap = { create: true, read: true, update: true, delete: true };
const READ: AcaoMap = { read: true };
const NONE: AcaoMap = {};

export const MATRIX: Record<Papel, PapelMatrix> = {
  admin: {
    vendas: FULL,
    producao: FULL,
    estoque: FULL,
    financeiro: FULL,
    crm: FULL,
    materiais: FULL,
    vendedores: FULL,
    relatorios: FULL,
    configuracoes: FULL,
    agenda: FULL,
  },
  gestor: {
    vendas: FULL,
    producao: FULL,
    estoque: FULL,
    financeiro: { read: true, update: true },
    crm: FULL,
    materiais: FULL,
    vendedores: { read: true, update: true },
    relatorios: FULL,
    configuracoes: READ,
    agenda: FULL,
  },
  financeiro: {
    vendas: READ,
    producao: READ,
    estoque: READ,
    financeiro: FULL,
    crm: READ,
    materiais: READ,
    vendedores: READ,
    relatorios: READ,
    configuracoes: NONE,
    agenda: READ,
  },
  // Vendedor passa a ter acesso APENAS a vendas e produção (sem PII na produção).
  // CRM, materiais, vendedores deixam de aparecer no rail para esse papel.
  vendedor: {
    vendas: { create: true, read: "self", update: "self" },
    producao: READ,
    estoque: NONE,
    financeiro: NONE,
    crm: NONE,
    materiais: NONE,
    vendedores: NONE,
    relatorios: NONE,
    configuracoes: NONE,
    agenda: { create: true, read: "self", update: "self" },
  },
  producao: {
    vendas: READ,
    producao: FULL,
    estoque: { read: true, update: true },
    financeiro: NONE,
    crm: NONE,
    materiais: READ,
    vendedores: NONE,
    relatorios: NONE,
    configuracoes: NONE,
    agenda: READ,
  },
};

/**
 * Resolve as permissões do usuário fazendo merge do papel base com
 * permissoes_extras (overrides aditivos por usuário).
 *
 * Estrutura de permissoes_extras (JSONB em profiles):
 *   {
 *     "modulos_extras": ["financeiro", "relatorios"],   // ganha "read" em cada
 *     "acoes_extras": { "vendedores": ["update"] }       // ações específicas
 *   }
 *
 * Overrides são sempre ADITIVOS: não removem permissões do papel base.
 */
export function resolveMatrix(
  papel: Papel,
  extras?: PermissoesExtras | null,
): PapelMatrix {
  const base = MATRIX[papel] ?? {};
  if (!extras || Object.keys(extras).length === 0) return base;

  const merged: PapelMatrix = JSON.parse(JSON.stringify(base));

  for (const modulo of extras.modulos_extras ?? []) {
    const m = modulo as Modulo;
    merged[m] = { ...(merged[m] ?? {}), read: true };
  }

  for (const [modulo, acoes] of Object.entries(extras.acoes_extras ?? {})) {
    const m = modulo as Modulo;
    const target: AcaoMap = { ...(merged[m] ?? {}) };
    for (const acao of acoes) target[acao as Acao] = true;
    merged[m] = target;
  }

  return merged;
}

export function can(
  papel: Papel,
  modulo: Modulo,
  acao: Acao,
  extras?: PermissoesExtras | null,
): boolean | "self" {
  const matrix = extras ? resolveMatrix(papel, extras) : MATRIX[papel] ?? {};
  return matrix[modulo]?.[acao] ?? false;
}

export function canAccess(
  papel: Papel,
  modulo: Modulo,
  extras?: PermissoesExtras | null,
): boolean {
  const matrix = extras ? resolveMatrix(papel, extras) : MATRIX[papel] ?? {};
  const map = matrix[modulo] ?? {};
  return Object.values(map).some((v) => v === true || v === "self");
}

/**
 * Lista de módulos disponíveis para escolha em telas de permissões.
 */
export const MODULOS_LISTAVEIS: { id: Modulo; label: string }[] = [
  { id: "vendas", label: "Vendas" },
  { id: "producao", label: "Produção" },
  { id: "agenda", label: "Agenda" },
  { id: "crm", label: "CRM" },
  { id: "materiais", label: "Materiais" },
  { id: "financeiro", label: "Financeiro" },
  { id: "vendedores", label: "Vendedores" },
  { id: "relatorios", label: "Relatórios" },
  { id: "configuracoes", label: "Configurações" },
];

export function permissoesDeProfile(profile: Profile | null | undefined) {
  if (!profile) return null;
  return {
    papel: profile.papel,
    extras: profile.permissoes_extras ?? null,
  };
}
