// Dados de exemplo usados pelas telas enquanto o Supabase do projeto não está
// conectado. Substituir por queries reais (TanStack Query + supabase/client) a
// partir de cada `page.tsx` quando o projeto dedicado estiver provisionado.

import { addDays, subDays } from "date-fns";

const today = new Date();
const iso = (d: Date) => d.toISOString();

export const mockKPIs = {
  faturamentoMes: 184_500,
  vendasEmProducao: 12,
  vendasAEntregar: 7,
  estoqueCritico: 3,
  contasAPagarProximas: 4,
  ticketMedio: 6_500,
  conversao: 32,
};

export const mockFaturamentoSerie = Array.from({ length: 12 }).map((_, i) => ({
  mes: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][i],
  valor: 80_000 + Math.round(Math.sin(i / 1.6) * 30_000 + i * 4_500),
}));

export const mockProximasEntregas = [
  {
    id: "v-2031",
    cliente: "Mariana Lopes",
    produto: "Sofá Vênus 3 lug. suede grafite",
    data: iso(addDays(today, 2)),
    status: "pronto" as const,
  },
  {
    id: "v-2027",
    cliente: "Construtora Aurora",
    produto: "Poltrona Atena couro caramelo",
    data: iso(addDays(today, 4)),
    status: "em_producao" as const,
  },
  {
    id: "v-2025",
    cliente: "Carlos Andrade",
    produto: "Sofá retrátil 2 lug. linho cru",
    data: iso(addDays(today, 5)),
    status: "controle_qualidade" as const,
  },
  {
    id: "v-2018",
    cliente: "Estúdio Belmonte",
    produto: "Chaise Apollo veludo terra",
    data: iso(addDays(today, 7)),
    status: "expedicao" as const,
  },
];

export const mockAtividade = [
  {
    id: "1",
    tipo: "venda",
    descricao: "Venda #2031 registrada por Bruna Marques",
    data: iso(subDays(today, 0)),
  },
  {
    id: "2",
    tipo: "estoque",
    descricao: "Entrada de 28m de suede grafite (forn. Tessile)",
    data: iso(subDays(today, 1)),
  },
  {
    id: "3",
    tipo: "producao",
    descricao: "Produção #2027 entrou em controle de qualidade",
    data: iso(subDays(today, 1)),
  },
  {
    id: "4",
    tipo: "financeiro",
    descricao: "Comissão de Maio liquidada para Bruna Marques",
    data: iso(subDays(today, 2)),
  },
];

export const mockAlertas = [
  {
    id: "a1",
    severidade: "warning" as const,
    titulo: "Estoque crítico",
    descricao: "Suede grafite abaixo do mínimo (8m restantes).",
  },
  {
    id: "a2",
    severidade: "warning" as const,
    titulo: "Prazo se aproximando",
    descricao: "Venda #2025 com entrega em 2 dias e produção em CQ.",
  },
  {
    id: "a3",
    severidade: "error" as const,
    titulo: "Conta vencida",
    descricao: "Fatura Tessile #4421 vencida há 2 dias.",
  },
];

export const mockVendas = Array.from({ length: 14 }).map((_, i) => ({
  id: `v-${2031 - i}`,
  numero: 2031 - i,
  cliente: [
    "Mariana Lopes",
    "Construtora Aurora",
    "Carlos Andrade",
    "Estúdio Belmonte",
    "Joana Prado",
    "Hub Negócios LTDA",
    "Rafael Souza",
    "Imobiliária Centro Sul",
  ][i % 8],
  vendedor: ["Bruna Marques", "Diego Faria", "Larissa Castro"][i % 3],
  valor: 4_200 + i * 380,
  status: (
    [
      "aguardando_producao",
      "em_producao",
      "controle_qualidade",
      "pronto",
      "expedicao",
      "entregue",
    ] as const
  )[i % 6],
  data_venda: iso(subDays(today, i * 2)),
  data_prevista_entrega: iso(addDays(today, 7 + (i % 5))),
}));

export const mockProducoes = mockVendas.slice(0, 10).map((v, i) => ({
  id: `p-${i + 1}`,
  vendaId: v.id,
  vendaNumero: v.numero,
  cliente: v.cliente,
  produto: [
    "Sofá Vênus 3 lug.",
    "Poltrona Atena",
    "Sofá retrátil 2 lug.",
    "Chaise Apollo",
    "Sofá Mira 4 lug.",
  ][i % 5],
  responsavel: ["Time A", "Time B", "Time C"][i % 3],
  prazo: v.data_prevista_entrega,
  status: (
    [
      "aguardando_inicio",
      "em_producao",
      "controle_qualidade",
      "pronto",
      "expedicao",
      "entregue",
    ] as const
  )[i % 6],
}));

export const mockEstoque = Array.from({ length: 8 }).map((_, i) => ({
  id: `e-${i}`,
  produto: [
    "Sofá Vênus",
    "Poltrona Atena",
    "Sofá Mira",
    "Chaise Apollo",
    "Sofá Tóquio",
    "Poltrona Lyra",
    "Sofá Hera",
    "Banco Castor",
  ][i],
  variantes: 3 + (i % 4),
  estoque_atual: [12, 4, 8, 0, 16, 6, 3, 20][i],
  estoque_minimo: [6, 4, 5, 2, 8, 4, 4, 10][i],
  categoria: ["Sofá", "Poltrona", "Acessório"][i % 3],
}));

export const mockMateriais = Array.from({ length: 6 }).map((_, i) => ({
  id: `m-${i}`,
  nome: ["Suede grafite", "Linho cru", "Couro caramelo", "Espuma D33", "Madeira eucalipto", "Veludo terra"][i],
  unidade: ["m", "m", "m", "m³", "m³", "m"][i],
  estoque_atual: [8, 14, 22, 6, 12, 18][i],
  estoque_minimo: [12, 10, 18, 5, 10, 12][i],
  custo_medio: [78, 65, 220, 320, 480, 95][i],
  fornecedor: ["Tessile", "Linifício", "Couromax", "Espumar", "Madeireira Pinheiro", "Tessile"][i],
}));

export const mockClientes = Array.from({ length: 10 }).map((_, i) => ({
  id: `c-${i}`,
  nome: [
    "Mariana Lopes",
    "Construtora Aurora",
    "Carlos Andrade",
    "Estúdio Belmonte",
    "Joana Prado",
    "Hub Negócios LTDA",
    "Rafael Souza",
    "Imobiliária Centro Sul",
    "Renata Coelho",
    "Atelier Forma",
  ][i],
  cpf_cnpj: ["123.456.789-12", "12.345.678/0001-90"][i % 2],
  email: `cliente${i}@exemplo.com`,
  origem: ["Indicação", "Instagram", "Loja física", "Site"][i % 4],
  ultima_compra: iso(subDays(today, 10 + i * 4)),
}));

export const mockLeads = Array.from({ length: 10 }).map((_, i) => ({
  id: `l-${i}`,
  nome: ["Lead Aurora", "Lead Veneza", "Lead Atelier", "Lead Bali", "Lead Tóquio"][i % 5],
  valor_estimado: 3_000 + i * 800,
  vendedor: ["Bruna Marques", "Diego Faria", "Larissa Castro"][i % 3],
  proximo_contato: iso(addDays(today, i)),
  status: (["lead", "qualificado", "proposta", "ganho", "perdido"] as const)[i % 5],
}));

export const mockVendedores = [
  { id: "u-1", nome: "Bruna Marques", vendasMes: 12, comissaoMes: 6_800, ticketMedio: 5_400, conversao: 38 },
  { id: "u-2", nome: "Diego Faria", vendasMes: 9, comissaoMes: 4_300, ticketMedio: 4_900, conversao: 32 },
  { id: "u-3", nome: "Larissa Castro", vendasMes: 7, comissaoMes: 3_100, ticketMedio: 4_200, conversao: 28 },
];

export const mockFinanceiroSerie = Array.from({ length: 12 }).map((_, i) => ({
  mes: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][i],
  entradas: 60_000 + Math.round(Math.cos(i / 2) * 20_000 + i * 3_200),
  saidas: 38_000 + Math.round(Math.sin(i / 2.4) * 12_000 + i * 1_800),
}));

export const mockContasAPagar = Array.from({ length: 6 }).map((_, i) => ({
  id: `cp-${i}`,
  descricao: ["Fornecedor Tessile", "Fornecedor Couromax", "Aluguel galpão", "Comissão Bruna Marques", "Conta de luz", "Pró-labore"][i],
  valor: [4_800, 3_200, 6_500, 6_800, 1_200, 12_000][i],
  vencimento: iso(addDays(today, [-2, 1, 3, 6, 9, 15][i])),
  status: (["atrasado", "pendente", "pendente", "pendente", "pendente", "pendente"] as const)[i],
}));
