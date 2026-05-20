"use client";

import { useQuery } from "@tanstack/react-query";
import {
  startOfMonth,
  endOfMonth,
  subDays,
  format,
  subMonths,
} from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "./keys";
import type { VendaStatus } from "@/types/database.types";

export interface DashboardKpis {
  faturamentoMes: number;
  vendasEmProducao: number;
  vendasAEntregar: number;
  estoqueCritico: number;
  contasAPagarProximas: number;
  ticketMedio: number;
}

export function useDashboardKpis() {
  return useQuery({
    queryKey: queryKeys.dashboardKpis(),
    queryFn: async (): Promise<DashboardKpis> => {
      const supabase = createClient();
      const now = new Date();
      const mesInicio = startOfMonth(now).toISOString().slice(0, 10);
      const mesFim = endOfMonth(now).toISOString().slice(0, 10);
      const proximos7 = subDays(now, -7).toISOString().slice(0, 10);

      const [
        { data: vendasMes },
        { count: emProducao },
        { count: aEntregar },
        { count: estoqueCritico },
        { count: contasProximas },
      ] = await Promise.all([
        supabase
          .from("vendas")
          .select("valor_total")
          .gte("data_venda", mesInicio)
          .lte("data_venda", mesFim)
          .neq("status", "cancelada"),
        supabase
          .from("vendas")
          .select("id", { count: "exact", head: true })
          .in("status", [
            "aguardando_producao",
            "em_producao",
            "controle_qualidade",
          ] satisfies VendaStatus[]),
        supabase
          .from("vendas")
          .select("id", { count: "exact", head: true })
          .in("status", ["pronto", "expedicao"] satisfies VendaStatus[]),
        supabase
          .from("produto_variantes")
          .select("id", { count: "exact", head: true })
          .lte("estoque_atual", 0),
        supabase
          .from("lancamentos_financeiros")
          .select("id", { count: "exact", head: true })
          .eq("status", "pendente")
          .lte("data_vencimento", proximos7),
      ]);

      const valores = ((vendasMes ?? []) as { valor_total: number }[]).map(
        (v) => Number(v.valor_total ?? 0),
      );
      const faturamentoMes = valores.reduce((acc, v) => acc + v, 0);
      const ticketMedio =
        valores.length > 0 ? faturamentoMes / valores.length : 0;

      return {
        faturamentoMes,
        vendasEmProducao: emProducao ?? 0,
        vendasAEntregar: aEntregar ?? 0,
        estoqueCritico: estoqueCritico ?? 0,
        contasAPagarProximas: contasProximas ?? 0,
        ticketMedio,
      };
    },
  });
}

export interface FaturamentoMes {
  mes: string;
  valor: number;
}

export function useFaturamentoSerie() {
  return useQuery({
    queryKey: queryKeys.dashboardFaturamento(),
    queryFn: async (): Promise<FaturamentoMes[]> => {
      const supabase = createClient();
      const inicio = startOfMonth(subMonths(new Date(), 11))
        .toISOString()
        .slice(0, 10);
      const { data, error } = await supabase
        .from("vendas")
        .select("data_venda, valor_total")
        .gte("data_venda", inicio)
        .neq("status", "cancelada");
      if (error) throw error;

      const buckets = new Map<string, number>();
      for (let i = 11; i >= 0; i--) {
        const d = subMonths(new Date(), i);
        const key = format(d, "yyyy-MM");
        buckets.set(key, 0);
      }
      for (const v of (data ?? []) as {
        data_venda: string;
        valor_total: number;
      }[]) {
        const key = v.data_venda.slice(0, 7);
        buckets.set(key, (buckets.get(key) ?? 0) + Number(v.valor_total ?? 0));
      }
      return Array.from(buckets.entries()).map(([key, valor]) => ({
        mes: format(new Date(`${key}-01`), "MMM"),
        valor,
      }));
    },
  });
}

export interface ProximaEntrega {
  id: string;
  numero: number;
  cliente: string;
  data_prevista_entrega: string;
  status: VendaStatus;
}

export function useProximasEntregas() {
  return useQuery({
    queryKey: queryKeys.dashboardProximasEntregas(),
    queryFn: async (): Promise<ProximaEntrega[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("vendas")
        .select(
          "id, numero, data_prevista_entrega, status, cliente:clientes(nome)",
        )
        .not("status", "in", "(entregue,cancelada)")
        .order("data_prevista_entrega", { ascending: true })
        .limit(8);
      if (error) throw error;
      return ((data ?? []) as unknown as Array<{
        id: string;
        numero: number;
        data_prevista_entrega: string;
        status: VendaStatus;
        cliente: { nome: string } | null;
      }>).map((v) => ({
        id: v.id,
        numero: v.numero,
        cliente: v.cliente?.nome ?? "Cliente sem nome",
        data_prevista_entrega: v.data_prevista_entrega,
        status: v.status,
      }));
    },
  });
}

export interface DashboardAlerta {
  id: string;
  titulo: string;
  descricao: string;
  severidade: "warning" | "error";
}

export function useDashboardAlertas() {
  return useQuery({
    queryKey: queryKeys.dashboardAlertas(),
    queryFn: async (): Promise<DashboardAlerta[]> => {
      const supabase = createClient();
      const hoje = new Date().toISOString().slice(0, 10);
      const proximos3 = subDays(new Date(), -3).toISOString().slice(0, 10);

      const [
        { data: estoqueBaixo },
        { data: contasAtrasadas },
        { data: prazosProximos },
      ] = await Promise.all([
        supabase
          .from("produto_variantes")
          .select("id, nome, estoque_atual, estoque_minimo, produto:produtos(nome)")
          .lte("estoque_atual", 0)
          .limit(5),
        supabase
          .from("lancamentos_financeiros")
          .select("id, descricao, valor, data_vencimento")
          .eq("status", "pendente")
          .lt("data_vencimento", hoje)
          .limit(5),
        supabase
          .from("vendas")
          .select("id, numero, data_prevista_entrega, status")
          .not("status", "in", "(entregue,cancelada)")
          .lte("data_prevista_entrega", proximos3)
          .limit(5),
      ]);

      const alertas: DashboardAlerta[] = [];

      for (const v of (estoqueBaixo ?? []) as unknown as Array<{
        id: string;
        nome: string;
        estoque_atual: number;
        produto: { nome: string } | null;
      }>) {
        alertas.push({
          id: `estoque-${v.id}`,
          severidade: "warning",
          titulo: "Estoque crítico",
          descricao: `${v.produto?.nome ?? "Produto"} ${v.nome} (${v.estoque_atual} em estoque).`,
        });
      }
      for (const l of (contasAtrasadas ?? []) as Array<{
        id: string;
        descricao: string;
        valor: number;
        data_vencimento: string;
      }>) {
        alertas.push({
          id: `conta-${l.id}`,
          severidade: "error",
          titulo: "Conta vencida",
          descricao: `${l.descricao} venceu em ${l.data_vencimento}.`,
        });
      }
      for (const v of (prazosProximos ?? []) as Array<{
        id: string;
        numero: number;
        data_prevista_entrega: string;
      }>) {
        alertas.push({
          id: `prazo-${v.id}`,
          severidade: "warning",
          titulo: "Prazo se aproximando",
          descricao: `Venda #${v.numero} com entrega em ${v.data_prevista_entrega}.`,
        });
      }

      return alertas;
    },
  });
}
