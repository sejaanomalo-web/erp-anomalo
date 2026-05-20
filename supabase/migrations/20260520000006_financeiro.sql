-- Migration 006: Financeiro (categorias e lançamentos)

create table categorias_financeiras (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid references empresas not null,
  nome text not null,
  tipo text not null check (tipo in ('entrada', 'saida')),
  cor text,
  ativa boolean default true,
  unique (empresa_id, nome, tipo)
);

create index categorias_fin_empresa_idx on categorias_financeiras(empresa_id, tipo);

create table lancamentos_financeiros (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid references empresas not null,
  tipo text not null check (tipo in ('entrada', 'saida')),
  categoria_id uuid references categorias_financeiras,
  descricao text not null,
  valor numeric(12,2) not null,
  data_competencia date not null,
  data_vencimento date,
  data_pagamento date,
  status text not null default 'pendente' check (status in ('pendente', 'pago', 'atrasado', 'cancelado')),
  forma_pagamento text,
  venda_id uuid references vendas,
  vendedor_comissao_id uuid references profiles,
  responsavel_id uuid references profiles not null,
  anexo_url text,
  observacoes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index lancamentos_empresa_idx on lancamentos_financeiros(empresa_id, data_competencia desc);
create index lancamentos_status_idx on lancamentos_financeiros(empresa_id, status, data_vencimento);
create index lancamentos_venda_idx on lancamentos_financeiros(venda_id);

create trigger lancamentos_set_updated_at
  before update on lancamentos_financeiros
  for each row execute function set_updated_at();

-- Marca lançamentos atrasados automaticamente quando consultados (view auxiliar)
create or replace view v_lancamentos_status as
  select
    l.*,
    case
      when l.status = 'pendente'
       and l.data_vencimento is not null
       and l.data_vencimento < current_date then 'atrasado'
      else l.status
    end as status_calculado
  from lancamentos_financeiros l;
