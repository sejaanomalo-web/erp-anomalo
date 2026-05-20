-- Migration 003: Clientes, leads e interações

create extension if not exists pg_trgm;

create table clientes (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid references empresas not null,
  nome text not null,
  cpf_cnpj text,
  email text,
  telefone text,
  endereco jsonb,
  observacoes text,
  origem text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index clientes_empresa_idx on clientes(empresa_id);
create index clientes_cpf_cnpj_idx on clientes(empresa_id, cpf_cnpj);
create index clientes_nome_trgm_idx on clientes using gin (lower(nome) gin_trgm_ops);

create table leads (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid references empresas not null,
  cliente_id uuid references clientes on delete set null,
  status text not null check (status in ('lead', 'qualificado', 'proposta', 'ganho', 'perdido')),
  valor_estimado numeric(12,2),
  produto_interesse text,
  vendedor_id uuid references profiles,
  observacoes text,
  data_proximo_contato date,
  motivo_perda text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index leads_empresa_status_idx on leads(empresa_id, status);
create index leads_vendedor_idx on leads(vendedor_id, status);

create table interacoes (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references clientes on delete cascade,
  lead_id uuid references leads on delete cascade,
  tipo text not null check (tipo in ('ligacao', 'whatsapp', 'email', 'visita', 'reuniao', 'outro')),
  conteudo text not null,
  usuario_id uuid references profiles not null,
  data timestamptz default now(),
  anexo_url text,
  check (cliente_id is not null or lead_id is not null)
);

create index interacoes_cliente_idx on interacoes(cliente_id, data desc);
create index interacoes_lead_idx on interacoes(lead_id, data desc);
create index interacoes_usuario_idx on interacoes(usuario_id, data desc);

create trigger clientes_set_updated_at
  before update on clientes
  for each row execute function set_updated_at();

create trigger leads_set_updated_at
  before update on leads
  for each row execute function set_updated_at();
