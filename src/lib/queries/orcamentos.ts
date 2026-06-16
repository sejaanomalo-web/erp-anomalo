"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import type { CriarOrcamentoInput } from "@/lib/validation/orcamentos";

export interface CriarOrcamentoResposta {
  id: string;
  numero: number;
  agenda_status: "sincronizado" | "pendente" | "erro";
  google_conectado: boolean;
}

export function useCriarOrcamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CriarOrcamentoInput) => {
      const res = await fetch("/api/orcamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? "Falha ao registrar orçamento.");
      }
      return (await res.json()) as CriarOrcamentoResposta;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.vendas() });
      qc.invalidateQueries({ queryKey: queryKeys.clientes() });
      qc.invalidateQueries({ queryKey: ["agenda"] });
    },
  });
}
