-- Migration 008: Notificações in-app e tokens públicos por vendedor

create table notificacoes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references profiles not null,
  empresa_id uuid references empresas,
  tipo text not null,
  titulo text not null,
  mensagem text,
  link text,
  lida boolean default false,
  prioridade text default 'normal' check (prioridade in ('baixa', 'normal', 'alta', 'critica')),
  created_at timestamptz default now()
);

create index notificacoes_usuario_idx on notificacoes(usuario_id, lida, created_at desc);

create table tokens_publicos (
  id uuid primary key default gen_random_uuid(),
  vendedor_id uuid references profiles not null,
  empresa_id uuid references empresas not null,
  token text unique not null default encode(gen_random_bytes(24), 'hex'),
  descricao text,
  ativo boolean default true,
  expira_em timestamptz,
  ultimo_uso_em timestamptz,
  total_usos integer default 0,
  created_at timestamptz default now()
);

create index tokens_vendedor_idx on tokens_publicos(vendedor_id, ativo);
create unique index tokens_token_unique on tokens_publicos(token);
