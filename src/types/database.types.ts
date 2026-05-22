// Tipos placeholder gerados manualmente.
// Vão ser substituídos por:
//   npx supabase gen types typescript --project-id <id> > src/types/database.types.ts
// após o projeto Supabase dedicado ser criado.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Papel = "admin" | "gestor" | "vendedor" | "financeiro" | "producao";

export type VendaStatus =
  | "aguardando_producao"
  | "em_producao"
  | "controle_qualidade"
  | "pronto"
  | "expedicao"
  | "entregue"
  | "cancelada"
  | "assistencia";

export type VendaTipo = "orcamento" | "venda";

export type KanbanVendaColuna = "orcamento" | "fechado" | "entregue" | "assistencia";

export type ProducaoStatus =
  | "aguardando_inicio"
  | "em_producao"
  | "controle_qualidade"
  | "pronto"
  | "expedicao"
  | "entregue";

export type LeadStatus =
  | "lead"
  | "qualificado"
  | "proposta"
  | "ganho"
  | "perdido";

export type FinanceiroStatus = "pendente" | "pago" | "atrasado" | "cancelado";

export type EstoqueTipo = "entrada" | "saida" | "ajuste";
export type EstoqueOrigem =
  | "compra"
  | "venda"
  | "producao"
  | "devolucao"
  | "ajuste_manual"
  | "perda";

export type InteracaoTipo =
  | "ligacao"
  | "whatsapp"
  | "email"
  | "visita"
  | "reuniao"
  | "outro";

export interface Empresa {
  id: string;
  nome: string;
  cnpj: string | null;
  logo_url: string | null;
  endereco: Json | null;
  ativa: boolean;
  created_at: string;
  updated_at: string;
}

export interface PermissoesExtras {
  modulos_extras?: string[];
  acoes_extras?: Record<string, string[]>;
}

export interface Profile {
  id: string;
  empresa_id: string | null;
  nome: string;
  email: string;
  telefone: string | null;
  cargo: string | null;
  papel: Papel;
  ativo: boolean;
  avatar_url: string | null;
  permissoes_extras: PermissoesExtras | null;
  created_at: string;
  updated_at: string;
}

export interface Produto {
  id: string;
  empresa_id: string;
  nome: string;
  descricao: string | null;
  categoria: string | null;
  ativo: boolean;
  imagem_principal_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProdutoVariante {
  id: string;
  produto_id: string;
  nome: string;
  sku: string | null;
  atributos: Json | null;
  preco_venda: number | null;
  custo: number | null;
  estoque_minimo: number;
  estoque_atual: number;
  ativo: boolean;
  imagem_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Material {
  id: string;
  empresa_id: string;
  nome: string;
  unidade: string;
  categoria: string | null;
  estoque_minimo: number;
  estoque_atual: number;
  custo_medio: number | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Fornecedor {
  id: string;
  empresa_id: string;
  nome: string;
  cnpj: string | null;
  contato: Json | null;
  ativo: boolean;
  created_at: string;
}

export interface Cliente {
  id: string;
  empresa_id: string;
  nome: string;
  cpf_cnpj: string | null;
  email: string | null;
  telefone: string | null;
  endereco: Json | null;
  observacoes: string | null;
  origem: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  empresa_id: string;
  cliente_id: string | null;
  status: LeadStatus;
  valor_estimado: number | null;
  produto_interesse: string | null;
  vendedor_id: string | null;
  observacoes: string | null;
  data_proximo_contato: string | null;
  motivo_perda: string | null;
  created_at: string;
  updated_at: string;
}

export interface Interacao {
  id: string;
  cliente_id: string | null;
  lead_id: string | null;
  tipo: InteracaoTipo;
  conteudo: string;
  usuario_id: string;
  data: string;
  anexo_url: string | null;
}

export interface Venda {
  id: string;
  empresa_id: string;
  numero: number;
  cliente_id: string;
  vendedor_id: string;
  tipo: VendaTipo;
  status: VendaStatus;
  valor_total: number;
  desconto: number;
  forma_pagamento: string | null;
  parcelas: number;
  comissao_percentual: number | null;
  comissao_valor: number | null;
  data_venda: string;
  data_prevista_producao: string | null;
  data_prevista_entrega: string;
  data_chegada_loja: string | null;
  data_entrega_real: string | null;
  endereco_entrega: Json | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface VendaItem {
  id: string;
  venda_id: string;
  produto_variante_id: string | null;
  produto_descricao: string | null;
  quantidade: number;
  valor_unitario: number;
  observacoes: Json | string | null;
  foto_modelo_url: string | null;
  foto_tecido_url: string | null;
  imagem_url: string | null;
}

export interface GoogleCalendarToken {
  id: string;
  usuario_id: string;
  empresa_id: string | null;
  access_token: string | null;
  refresh_token: string;
  expires_at: string | null;
  scope: string | null;
  calendar_id: string;
  ultimo_sync_em: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgendaEvento {
  id: string;
  empresa_id: string;
  venda_id: string | null;
  usuario_id: string;
  google_event_id: string | null;
  titulo: string;
  inicio: string;
  fim: string | null;
  status_sync: "pendente" | "sincronizado" | "erro";
  ultimo_erro: string | null;
  created_at: string;
  updated_at: string;
}

export interface Producao {
  id: string;
  venda_id: string;
  venda_item_id: string;
  status: ProducaoStatus;
  responsavel_id: string | null;
  data_inicio_prevista: string | null;
  data_inicio_real: string | null;
  data_fim_prevista: string | null;
  data_fim_real: string | null;
  prioridade: number;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface EstoqueMovimentacao {
  id: string;
  empresa_id: string;
  tipo: EstoqueTipo;
  origem: EstoqueOrigem;
  produto_variante_id: string | null;
  material_id: string | null;
  quantidade: number;
  valor_unitario: number | null;
  responsavel_id: string;
  venda_id: string | null;
  observacoes: string | null;
  anexo_url: string | null;
  created_at: string;
}

export interface CategoriaFinanceira {
  id: string;
  empresa_id: string;
  nome: string;
  tipo: "entrada" | "saida";
  cor: string | null;
  ativa: boolean;
}

export interface LancamentoFinanceiro {
  id: string;
  empresa_id: string;
  tipo: "entrada" | "saida";
  categoria_id: string | null;
  descricao: string;
  valor: number;
  data_competencia: string;
  data_vencimento: string | null;
  data_pagamento: string | null;
  status: FinanceiroStatus;
  forma_pagamento: string | null;
  venda_id: string | null;
  vendedor_comissao_id: string | null;
  responsavel_id: string;
  anexo_url: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  empresa_id: string | null;
  usuario_id: string | null;
  modulo: string;
  acao: string;
  entidade: string;
  entidade_id: string | null;
  dados_antes: Json | null;
  dados_depois: Json | null;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface Anexo {
  id: string;
  empresa_id: string;
  entidade: string;
  entidade_id: string;
  nome_original: string;
  url: string;
  tamanho_bytes: number | null;
  mime_type: string | null;
  usuario_id: string;
  created_at: string;
}

export interface Comentario {
  id: string;
  entidade: string;
  entidade_id: string;
  conteudo: string;
  usuario_id: string;
  mencoes: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface Notificacao {
  id: string;
  usuario_id: string;
  empresa_id: string | null;
  tipo: string;
  titulo: string;
  mensagem: string | null;
  link: string | null;
  lida: boolean;
  prioridade: "baixa" | "normal" | "alta" | "critica";
  created_at: string;
}

export interface TokenPublico {
  id: string;
  vendedor_id: string;
  empresa_id: string;
  token: string;
  descricao: string | null;
  ativo: boolean;
  expira_em: string | null;
  ultimo_uso_em: string | null;
  total_usos: number;
  created_at: string;
}

type TableShape<R> = {
  Row: R;
  Insert: Partial<R>;
  Update: Partial<R>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      empresas: TableShape<Empresa>;
      profiles: TableShape<Profile>;
      produtos: TableShape<Produto>;
      produto_variantes: TableShape<ProdutoVariante>;
      materiais: TableShape<Material>;
      fornecedores: TableShape<Fornecedor>;
      clientes: TableShape<Cliente>;
      leads: TableShape<Lead>;
      interacoes: TableShape<Interacao>;
      vendas: TableShape<Venda>;
      venda_itens: TableShape<VendaItem>;
      producoes: TableShape<Producao>;
      estoque_movimentacoes: TableShape<EstoqueMovimentacao>;
      categorias_financeiras: TableShape<CategoriaFinanceira>;
      lancamentos_financeiros: TableShape<LancamentoFinanceiro>;
      audit_logs: TableShape<AuditLog>;
      anexos: TableShape<Anexo>;
      comentarios: TableShape<Comentario>;
      notificacoes: TableShape<Notificacao>;
      tokens_publicos: TableShape<TokenPublico>;
    };
    Views: Record<never, never>;
    Functions: {
      auth_papel: { Args: Record<string, never>; Returns: string };
      auth_empresa: { Args: Record<string, never>; Returns: string };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}
