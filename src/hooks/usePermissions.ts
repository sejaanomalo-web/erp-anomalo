"use client";

import { useMemo } from "react";
import { useAuth } from "./useAuth";
import { can, canAccess, type Acao, type Modulo } from "@/lib/permissions/matrix";

export function usePermissions() {
  const { profile } = useAuth();
  return useMemo(() => {
    const papel = profile?.papel;
    return {
      papel,
      can: (modulo: Modulo, acao: Acao) =>
        papel ? can(papel, modulo, acao) : false,
      canAccess: (modulo: Modulo) => (papel ? canAccess(papel, modulo) : false),
    };
  }, [profile]);
}
