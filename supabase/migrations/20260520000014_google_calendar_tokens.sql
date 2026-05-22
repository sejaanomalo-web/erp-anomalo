-- Migration 014: tokens OAuth do Google Calendar por usuário
--
-- Sync ERP → Google: empurra entregas previstas como eventos.

create table if not exists google_calendar_tokens (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references profiles on delete cascade not null unique,
  empresa_id uuid references empresas,
  access_token text,
  refresh_token text not null,
  expires_at timestamptz,
  scope text,
  calendar_id text default 'primary',
  ultimo_sync_em timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger google_calendar_tokens_set_updated_at
  before update on google_calendar_tokens
  for each row execute function set_updated_at();

alter table google_calendar_tokens enable row level security;

create policy "google_tokens_self" on google_calendar_tokens for all
  using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());

-- Tabela de eventos sincronizados (mapeia venda → google event id)
create table if not exists agenda_eventos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid references empresas not null,
  venda_id uuid references vendas on delete cascade,
  usuario_id uuid references profiles not null,
  google_event_id text,
  titulo text not null,
  inicio timestamptz not null,
  fim timestamptz,
  status_sync text default 'pendente' check (status_sync in ('pendente', 'sincronizado', 'erro')),
  ultimo_erro text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists agenda_eventos_empresa_idx
  on agenda_eventos(empresa_id, inicio desc);

create index if not exists agenda_eventos_venda_idx
  on agenda_eventos(venda_id);

create trigger agenda_eventos_set_updated_at
  before update on agenda_eventos
  for each row execute function set_updated_at();

alter table agenda_eventos enable row level security;

create policy "agenda_select" on agenda_eventos for select
  using (empresa_id = auth_empresa());

create policy "agenda_write" on agenda_eventos for all
  using (empresa_id = auth_empresa())
  with check (empresa_id = auth_empresa() and usuario_id = auth.uid());
