-- Migration 002: Catálogo (produtos, variantes, materiais, fornecedores)

create table produtos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid references empresas not null,
  nome text not null,
  descricao text,
  categoria text,
  ativo boolean default true,
  imagem_principal_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index produtos_empresa_idx on produtos(empresa_id);
create index produtos_categoria_idx on produtos(empresa_id, categoria);

create table produto_variantes (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid references produtos on delete cascade not null,
  nome text not null,
  sku text unique,
  atributos jsonb,
  preco_venda numeric(12,2),
  custo numeric(12,2),
  estoque_minimo integer default 0,
  estoque_atual integer default 0,
  ativo boolean default true,
  imagem_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index produto_variantes_produto_idx on produto_variantes(produto_id);
create index produto_variantes_estoque_critico_idx on produto_variantes(estoque_atual) where estoque_atual <= estoque_minimo;

create table materiais (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid references empresas not null,
  nome text not null,
  unidade text not null,
  categoria text,
  estoque_minimo numeric(12,2) default 0,
  estoque_atual numeric(12,2) default 0,
  custo_medio numeric(12,2),
  ativo boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index materiais_empresa_idx on materiais(empresa_id);

create table fornecedores (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid references empresas not null,
  nome text not null,
  cnpj text,
  contato jsonb,
  ativo boolean default true,
  created_at timestamptz default now()
);

create index fornecedores_empresa_idx on fornecedores(empresa_id);

create trigger produtos_set_updated_at
  before update on produtos
  for each row execute function set_updated_at();

create trigger produto_variantes_set_updated_at
  before update on produto_variantes
  for each row execute function set_updated_at();

create trigger materiais_set_updated_at
  before update on materiais
  for each row execute function set_updated_at();
