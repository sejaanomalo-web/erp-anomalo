// Query keys centralizados para o TanStack Query. Hierarquia inspirada na
// convenção "feature/list/detail" para invalidação seletiva.

export const queryKeys = {
  dashboard: () => ["dashboard"] as const,
  dashboardKpis: () => ["dashboard", "kpis"] as const,
  dashboardFaturamento: () => ["dashboard", "faturamento"] as const,
  dashboardProximasEntregas: () => ["dashboard", "proximas-entregas"] as const,
  dashboardAlertas: () => ["dashboard", "alertas"] as const,
  dashboardAtividade: () => ["dashboard", "atividade"] as const,

  vendas: () => ["vendas"] as const,
  vendasList: (filters?: Record<string, unknown>) =>
    ["vendas", "list", filters ?? {}] as const,
  venda: (id: string) => ["vendas", "detail", id] as const,
  vendaProducoes: (id: string) => ["vendas", "detail", id, "producoes"] as const,

  clientes: () => ["clientes"] as const,
  clientesList: (filters?: Record<string, unknown>) =>
    ["clientes", "list", filters ?? {}] as const,
  cliente: (id: string) => ["clientes", "detail", id] as const,

  produtos: () => ["produtos"] as const,
  produtosList: () => ["produtos", "list"] as const,
  produto: (id: string) => ["produtos", "detail", id] as const,
  produtoVariantes: (produtoId?: string) =>
    ["produtos", "variantes", produtoId ?? "all"] as const,

  producoes: () => ["producoes"] as const,
  producoesList: () => ["producoes", "list"] as const,

  estoque: () => ["estoque"] as const,
  estoqueList: () => ["estoque", "list"] as const,
  estoqueMovimentacoes: () => ["estoque", "movimentacoes"] as const,

  vendedores: () => ["vendedores"] as const,
  vendedoresList: () => ["vendedores", "list"] as const,
  // Lista enxuta (id, nome, papel) p/ selects; key distinta da lista admin
  // para não colidir no cache do TanStack (shapes diferentes, mesma feature).
  vendedoresOptions: () => ["vendedores", "options"] as const,

  materiais: () => ["materiais"] as const,
  materiaisList: () => ["materiais", "list"] as const,

  financeiro: () => ["financeiro"] as const,
  contasAPagar: () => ["financeiro", "contas-a-pagar"] as const,
  contasAReceber: () => ["financeiro", "contas-a-receber"] as const,

  perfis: () => ["perfis"] as const,
  meuPerfil: () => ["perfis", "self"] as const,
};
