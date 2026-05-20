-- Migration 004: Vendas, itens e produção

create table vendas (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid references empresas not null,
  numero serial,
  cliente_id uuid references clientes not null,
  vendedor_id uuid references profiles not null,
  status text not null default 'aguardando_producao'
    check (status in ('aguardando_producao', 'em_producao', 'controle_qualidade', 'pronto', 'expedicao', 'entregue', 'cancelada')),
  valor_total numeric(12,2) not null,
  desconto numeric(12,2) default 0,
  forma_pagamento text,
  parcelas integer default 1,
  comissao_percentual numeric(5,2),
  comissao_valor numeric(12,2),
  data_venda date not null default current_date,
  data_prevista_producao date,
  data_prevista_entrega date not null,
  data_chegada_loja date,
  data_entrega_real date,
  endereco_entrega jsonb,
  observacoes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index vendas_empresa_status_idx on vendas(empresa_id, status, data_venda desc);
create index vendas_vendedor_idx on vendas(vendedor_id, data_venda desc);
create index vendas_cliente_idx on vendas(cliente_id, data_venda desc);
create index vendas_prazo_entrega_idx on vendas(empresa_id, data_prevista_entrega) where status not in ('entregue', 'cancelada');

create table venda_itens (
  id uuid primary key default gen_random_uuid(),
  venda_id uuid references vendas on delete cascade not null,
  produto_variante_id uuid references produto_variantes not null,
  quantidade integer not null default 1,
  valor_unitario numeric(12,2) not null,
  customizacoes jsonb,
  imagem_url text
);

create index venda_itens_venda_idx on venda_itens(venda_id);

create table producoes (
  id uuid primary key default gen_random_uuid(),
  venda_id uuid references vendas not null,
  venda_item_id uuid references venda_itens not null,
  status text not null default 'aguardando_inicio'
    check (status in ('aguardando_inicio', 'em_producao', 'controle_qualidade', 'pronto', 'expedicao', 'entregue')),
  responsavel_id uuid references profiles,
  data_inicio_prevista date,
  data_inicio_real date,
  data_fim_prevista date,
  data_fim_real date,
  prioridade integer default 0,
  observacoes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index producoes_status_idx on producoes(status, prioridade desc);
create index producoes_responsavel_idx on producoes(responsavel_id, status);

create trigger vendas_set_updated_at
  before update on vendas
  for each row execute function set_updated_at();

create trigger producoes_set_updated_at
  before update on producoes
  for each row execute function set_updated_at();
