import type { Papel } from "@/types/database.types";

export type Modulo =
  | "vendas"
  | "producao"
  | "estoque"
  | "financeiro"
  | "crm"
  | "materiais"
  | "vendedores"
  | "relatorios"
  | "configuracoes";

export type Acao = "create" | "read" | "update" | "delete";

type AcaoMap = Partial<Record<Acao, boolean | "self">>;

type PapelMatrix = Record<Modulo, AcaoMap>;

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
  },
  vendedor: {
    vendas: { create: true, read: "self", update: "self" },
    producao: READ,
    estoque: READ,
    financeiro: NONE,
    crm: { create: true, read: "self", update: "self", delete: false },
    materiais: READ,
    vendedores: { read: "self" },
    relatorios: NONE,
    configuracoes: NONE,
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
  },
};

export function can(
  papel: Papel,
  modulo: Modulo,
  acao: Acao,
): boolean | "self" {
  return MATRIX[papel]?.[modulo]?.[acao] ?? false;
}

export function canAccess(papel: Papel, modulo: Modulo): boolean {
  const map = MATRIX[papel]?.[modulo] ?? {};
  return Object.values(map).some((v) => v === true || v === "self");
}
