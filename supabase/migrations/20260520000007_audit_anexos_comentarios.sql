-- Migration 007: Audit log, anexos genéricos e comentários

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid references empresas,
  usuario_id uuid references profiles,
  modulo text not null,
  acao text not null,
  entidade text not null,
  entidade_id uuid,
  dados_antes jsonb,
  dados_depois jsonb,
  ip text,
  user_agent text,
  created_at timestamptz default now()
);

create index audit_logs_empresa_idx on audit_logs(empresa_id, created_at desc);
create index audit_logs_usuario_idx on audit_logs(usuario_id, created_at desc);
create index audit_logs_entidade_idx on audit_logs(entidade, entidade_id, created_at desc);

create table anexos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid references empresas not null,
  entidade text not null,
  entidade_id uuid not null,
  nome_original text not null,
  url text not null,
  tamanho_bytes integer,
  mime_type text,
  usuario_id uuid references profiles not null,
  created_at timestamptz default now()
);

create index anexos_entidade_idx on anexos(entidade, entidade_id);
create index anexos_empresa_idx on anexos(empresa_id, created_at desc);

create table comentarios (
  id uuid primary key default gen_random_uuid(),
  entidade text not null,
  entidade_id uuid not null,
  conteudo text not null,
  usuario_id uuid references profiles not null,
  mencoes uuid[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index comentarios_entidade_idx on comentarios(entidade, entidade_id, created_at desc);
create index comentarios_usuario_idx on comentarios(usuario_id, created_at desc);

create trigger comentarios_set_updated_at
  before update on comentarios
  for each row execute function set_updated_at();
