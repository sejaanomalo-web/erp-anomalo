"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { MESES, parsePeriodo, type ModoPeriodo } from "@/lib/periodo";

// Lê e escreve o período global na URL (?modo&de&ate&mes&ano). Mudar o
// período faz router.replace, o que atualiza searchParams e refaz as queries
// que dependem de periodo.de/ate (via queryKey) sem recarregar o shell.
export function usePeriodo() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const periodo = useMemo(() => parsePeriodo(searchParams), [searchParams]);

  const push = useCallback(
    (sp: URLSearchParams) => {
      router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
    },
    [pathname, router],
  );

  const setModo = useCallback(
    (modo: ModoPeriodo) => {
      const sp = new URLSearchParams(searchParams.toString());
      sp.set("modo", modo);
      if (modo === "mes") {
        sp.delete("de");
        sp.delete("ate");
        sp.set("mes", MESES[periodo.mes - 1]);
        sp.set("ano", String(periodo.ano));
      } else if (modo === "dia") {
        sp.delete("ate");
        sp.delete("mes");
        sp.delete("ano");
        sp.set("de", periodo.de);
      } else {
        sp.delete("mes");
        sp.delete("ano");
        sp.set("de", periodo.de);
        sp.set("ate", periodo.ate);
      }
      push(sp);
    },
    [searchParams, periodo, push],
  );

  const setMesAno = useCallback(
    (mes: number, ano: number) => {
      const sp = new URLSearchParams(searchParams.toString());
      sp.set("modo", "mes");
      sp.delete("de");
      sp.delete("ate");
      sp.set("mes", MESES[mes - 1]);
      sp.set("ano", String(ano));
      push(sp);
    },
    [searchParams, push],
  );

  const setDia = useCallback(
    (de: string) => {
      const sp = new URLSearchParams(searchParams.toString());
      sp.set("modo", "dia");
      sp.delete("ate");
      sp.delete("mes");
      sp.delete("ano");
      sp.set("de", de);
      push(sp);
    },
    [searchParams, push],
  );

  const setIntervalo = useCallback(
    (de: string, ate: string) => {
      const sp = new URLSearchParams(searchParams.toString());
      sp.set("modo", "intervalo");
      sp.delete("mes");
      sp.delete("ano");
      sp.set("de", de);
      sp.set("ate", ate);
      push(sp);
    },
    [searchParams, push],
  );

  return { periodo, setModo, setMesAno, setDia, setIntervalo };
}
