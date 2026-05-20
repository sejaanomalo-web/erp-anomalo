"use client";

import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MATRIX, type Modulo, type Acao } from "@/lib/permissions/matrix";
import type { Papel } from "@/types/database.types";

const PAPEIS: Papel[] = ["admin", "gestor", "financeiro", "vendedor", "producao"];
const ACOES: Acao[] = ["create", "read", "update", "delete"];
const ACAO_LABEL: Record<Acao, string> = {
  create: "C",
  read: "R",
  update: "U",
  delete: "D",
};
const MODULOS: Modulo[] = [
  "vendas",
  "producao",
  "estoque",
  "financeiro",
  "crm",
  "materiais",
  "vendedores",
  "relatorios",
  "configuracoes",
];

export default function PermissoesPage() {
  return (
    <div className="flex flex-col gap-2xl">
      <Hero
        eyebrow="Sistema"
        titulo="Permissões"
        descricao="Matriz por papel. C = criar, R = ler, U = editar, D = excluir."
      />
      <Card className="overflow-x-auto scrollbar-thin">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-thin">
              <th className="text-label-caps text-text-3 text-left px-md py-sm">
                Papel
              </th>
              {MODULOS.map((m) => (
                <th
                  key={m}
                  className="text-label-caps text-text-3 text-center px-md py-sm capitalize"
                >
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PAPEIS.map((p) => (
              <tr key={p} className="border-b border-border-thin">
                <td className="px-md py-sm text-body-md text-text-1 capitalize">
                  {p}
                </td>
                {MODULOS.map((m) => {
                  const cell = MATRIX[p]?.[m] ?? {};
                  return (
                    <td key={m} className="px-md py-sm text-center">
                      <div className="inline-flex items-center gap-xs">
                        {ACOES.map((a) => {
                          const v = cell[a];
                          return (
                            <Badge
                              key={a}
                              tone={
                                v === true
                                  ? "accent"
                                  : v === "self"
                                    ? "warning"
                                    : "muted"
                              }
                            >
                              {ACAO_LABEL[a]}
                            </Badge>
                          );
                        })}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <p className="text-body-sm text-text-3">
        <strong className="text-text-1">self</strong> significa que o usuário só vê
        os próprios registros (ex: vendedor vê apenas suas vendas e clientes).
      </p>
    </div>
  );
}
