-- Migration 011: tipo (orcamento/venda), observacoes, fotos modelo/tecido
--
-- Mudanças:
--   • vendas.tipo: nova coluna text com check ('orcamento','venda'), default 'venda'
--   • venda_itens.customizacoes → venda_itens.observacoes (rename)
--   • venda_itens.foto_modelo_url, foto_tecido_url: nullable text
--   • venda_itens.produto_descricao: texto livre do produto (passa a ser fonte de verdade do nome)
--   • venda_itens.produto_variante_id: passa a ser NULLABLE (o catálogo deixa de ser obrigatório)

alter table vendas
  add column if not exists tipo text not null default 'venda'
  check (tipo in ('orcamento', 'venda'));

create index if not exists vendas_tipo_idx on vendas(empresa_id, tipo, data_venda desc);

do $$
begin
  if exists (
    select 1
      from information_schema.columns
     where table_schema = 'public'
       and table_name = 'venda_itens'
       and column_name = 'customizacoes'
  ) and not exists (
    select 1
      from information_schema.columns
     where table_schema = 'public'
       and table_name = 'venda_itens'
       and column_name = 'observacoes'
  ) then
    alter table venda_itens rename column customizacoes to observacoes;
  end if;
end $$;

alter table venda_itens
  add column if not exists foto_modelo_url text,
  add column if not exists foto_tecido_url text,
  add column if not exists produto_descricao text;

-- Catálogo deixa de ser obrigatório; o texto livre vira fonte canônica.
alter table venda_itens
  alter column produto_variante_id drop not null;

-- Garante que ao menos um identificador de produto exista
alter table venda_itens
  add constraint venda_itens_produto_identificacao
  check (
    produto_variante_id is not null
    or coalesce(trim(produto_descricao), '') <> ''
  );
-- Migration 012: adiciona 'assistencia' ao check de status em vendas
--
-- O Kanban operacional usa 4 colunas:
--   orcamento (derivado de tipo='orcamento')
--   fechado   (tipo='venda' e status not in ('entregue','cancelada','assistencia'))
--   entregue  (status='entregue')
--   assistencia (novo status)

alter table vendas drop constraint if exists vendas_status_check;

alter table vendas add constraint vendas_status_check check (
  status in (
    'aguardando_producao',
    'em_producao',
    'controle_qualidade',
    'pronto',
    'expedicao',
    'entregue',
    'cancelada',
    'assistencia'
  )
);
-- Migration 013: profiles.permissoes_extras
--
-- Overrides aditivos sobre a matriz de papel. Estrutura:
--   {
--     "modulos_extras": ["financeiro", "relatorios"],
--     "acoes_extras": { "vendedores": ["update"] }
--   }
-- Aplicados via merge no client (lib/permissions/matrix.ts).

alter table profiles
  add column if not exists permissoes_extras jsonb default '{}'::jsonb;
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
