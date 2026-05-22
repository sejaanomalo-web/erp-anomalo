-- Migration 001: Empresas e usuários
-- Multi-tenancy preparado, profiles estende auth.users.

create extension if not exists "pgcrypto";

create table empresas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cnpj text,
  logo_url text,
  endereco jsonb,
  ativa boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  empresa_id uuid references empresas on delete restrict,
  nome text not null,
  email text not null,
  telefone text,
  cargo text,
  papel text not null check (papel in ('admin', 'gestor', 'vendedor', 'financeiro', 'producao')),
  ativo boolean default true,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index profiles_empresa_idx on profiles(empresa_id);
create index profiles_email_idx on profiles(email);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, email, nome, papel)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nome', new.email),
    coalesce(new.raw_user_meta_data->>'papel', 'vendedor')
  )
  on conflict (id) do nothing;
  return new;
exception
  when others then
    raise log 'handle_new_user falhou para %: %', new.email, sqlerrm;
    return new;
end;
$$;

alter function public.handle_new_user() owner to postgres;

grant execute on function public.handle_new_user() to supabase_auth_admin;
grant execute on function public.handle_new_user() to service_role;
grant insert, select on public.profiles to supabase_auth_admin;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger empresas_set_updated_at
  before update on empresas
  for each row execute function set_updated_at();

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();
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
-- Migration 005: Estoque e movimentações

create table estoque_movimentacoes (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid references empresas not null,
  tipo text not null check (tipo in ('entrada', 'saida', 'ajuste')),
  origem text not null check (origem in ('compra', 'venda', 'producao', 'devolucao', 'ajuste_manual', 'perda')),
  produto_variante_id uuid references produto_variantes,
  material_id uuid references materiais,
  quantidade numeric(12,2) not null,
  valor_unitario numeric(12,2),
  responsavel_id uuid references profiles not null,
  venda_id uuid references vendas,
  observacoes text,
  anexo_url text,
  created_at timestamptz default now(),
  check (
    (produto_variante_id is not null and material_id is null) or
    (produto_variante_id is null and material_id is not null)
  )
);

create index estoque_mov_empresa_idx on estoque_movimentacoes(empresa_id, created_at desc);
create index estoque_mov_produto_idx on estoque_movimentacoes(produto_variante_id, created_at desc);
create index estoque_mov_material_idx on estoque_movimentacoes(material_id, created_at desc);

-- Trigger: ao registrar movimentação, atualizar estoque do item
create or replace function aplicar_movimentacao_estoque()
returns trigger as $$
declare
  delta numeric(12,2);
begin
  if new.tipo = 'entrada' then
    delta := new.quantidade;
  elsif new.tipo = 'saida' then
    delta := -new.quantidade;
  else
    -- ajuste: quantidade é o delta literal (positivo ou negativo)
    delta := new.quantidade;
  end if;

  if new.produto_variante_id is not null then
    update produto_variantes
       set estoque_atual = estoque_atual + delta
     where id = new.produto_variante_id;
  elsif new.material_id is not null then
    update materiais
       set estoque_atual = estoque_atual + delta
     where id = new.material_id;
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger estoque_mov_aplicar
  after insert on estoque_movimentacoes
  for each row execute function aplicar_movimentacao_estoque();
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
-- Migration 009: Row Level Security em todas as tabelas + helpers

alter table empresas enable row level security;
alter table profiles enable row level security;
alter table produtos enable row level security;
alter table produto_variantes enable row level security;
alter table materiais enable row level security;
alter table fornecedores enable row level security;
alter table clientes enable row level security;
alter table leads enable row level security;
alter table interacoes enable row level security;
alter table vendas enable row level security;
alter table venda_itens enable row level security;
alter table producoes enable row level security;
alter table estoque_movimentacoes enable row level security;
alter table categorias_financeiras enable row level security;
alter table lancamentos_financeiros enable row level security;
alter table audit_logs enable row level security;
alter table anexos enable row level security;
alter table comentarios enable row level security;
alter table notificacoes enable row level security;
alter table tokens_publicos enable row level security;

-- Helpers ---------------------------------------------------------------

create or replace function auth_papel()
returns text as $$
  select papel from profiles where id = auth.uid()
$$ language sql security definer stable;

create or replace function auth_empresa()
returns uuid as $$
  select empresa_id from profiles where id = auth.uid()
$$ language sql security definer stable;

create or replace function is_admin()
returns boolean as $$
  select auth_papel() = 'admin'
$$ language sql security definer stable;

create or replace function is_gestor_ou_admin()
returns boolean as $$
  select auth_papel() in ('admin', 'gestor')
$$ language sql security definer stable;

-- empresas: leitura para usuários da empresa, escrita só admin -----------

create policy "empresas_select" on empresas for select
  using (id = auth_empresa());

create policy "empresas_admin_all" on empresas for all
  using (id = auth_empresa() and is_admin())
  with check (id = auth_empresa() and is_admin());

-- profiles ---------------------------------------------------------------

create policy "profiles_select" on profiles for select using (
  id = auth.uid()
  or (auth_papel() in ('admin', 'gestor') and empresa_id = auth_empresa())
);

create policy "profiles_update_self" on profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and papel = (select papel from profiles where id = auth.uid()));

create policy "profiles_admin_all" on profiles for all
  using (is_admin() and empresa_id = auth_empresa())
  with check (is_admin() and empresa_id = auth_empresa());

-- produtos / produto_variantes / materiais / fornecedores ---------------

create policy "produtos_select" on produtos for select using (empresa_id = auth_empresa());
create policy "produtos_write" on produtos for all
  using (empresa_id = auth_empresa() and auth_papel() in ('admin', 'gestor', 'producao'))
  with check (empresa_id = auth_empresa() and auth_papel() in ('admin', 'gestor', 'producao'));

create policy "variantes_select" on produto_variantes for select using (
  exists (
    select 1 from produtos p
     where p.id = produto_variantes.produto_id and p.empresa_id = auth_empresa()
  )
);
create policy "variantes_write" on produto_variantes for all
  using (
    auth_papel() in ('admin', 'gestor', 'producao')
    and exists (
      select 1 from produtos p
       where p.id = produto_variantes.produto_id and p.empresa_id = auth_empresa()
    )
  )
  with check (
    auth_papel() in ('admin', 'gestor', 'producao')
    and exists (
      select 1 from produtos p
       where p.id = produto_variantes.produto_id and p.empresa_id = auth_empresa()
    )
  );

create policy "materiais_select" on materiais for select using (empresa_id = auth_empresa());
create policy "materiais_write" on materiais for all
  using (empresa_id = auth_empresa() and auth_papel() in ('admin', 'gestor', 'producao'))
  with check (empresa_id = auth_empresa() and auth_papel() in ('admin', 'gestor', 'producao'));

create policy "fornecedores_select" on fornecedores for select using (empresa_id = auth_empresa());
create policy "fornecedores_write" on fornecedores for all
  using (empresa_id = auth_empresa() and is_gestor_ou_admin())
  with check (empresa_id = auth_empresa() and is_gestor_ou_admin());

-- clientes ---------------------------------------------------------------

create policy "clientes_select" on clientes for select using (empresa_id = auth_empresa());

create policy "clientes_insert" on clientes for insert with check (
  empresa_id = auth_empresa()
  and auth_papel() in ('admin', 'gestor', 'vendedor')
);

create policy "clientes_update" on clientes for update using (
  empresa_id = auth_empresa()
  and auth_papel() in ('admin', 'gestor', 'vendedor')
);

create policy "clientes_delete_admin" on clientes for delete using (
  empresa_id = auth_empresa() and is_admin()
);

-- leads ------------------------------------------------------------------

create policy "leads_select" on leads for select using (
  empresa_id = auth_empresa()
  and (
    auth_papel() in ('admin', 'gestor')
    or (auth_papel() = 'vendedor' and vendedor_id = auth.uid())
  )
);

create policy "leads_insert" on leads for insert with check (
  empresa_id = auth_empresa()
  and (
    auth_papel() in ('admin', 'gestor')
    or (auth_papel() = 'vendedor' and vendedor_id = auth.uid())
  )
);

create policy "leads_update" on leads for update using (
  empresa_id = auth_empresa()
  and (
    auth_papel() in ('admin', 'gestor')
    or (auth_papel() = 'vendedor' and vendedor_id = auth.uid())
  )
);

create policy "leads_delete_admin" on leads for delete using (
  empresa_id = auth_empresa() and is_admin()
);

-- interacoes -------------------------------------------------------------

create policy "interacoes_select" on interacoes for select using (
  exists (
    select 1 from clientes c
     where c.id = interacoes.cliente_id and c.empresa_id = auth_empresa()
  )
  or exists (
    select 1 from leads l
     where l.id = interacoes.lead_id and l.empresa_id = auth_empresa()
  )
);

create policy "interacoes_insert" on interacoes for insert
  with check (usuario_id = auth.uid());

-- vendas -----------------------------------------------------------------

create policy "vendas_select" on vendas for select using (
  empresa_id = auth_empresa()
  and (
    auth_papel() in ('admin', 'gestor', 'financeiro', 'producao')
    or (auth_papel() = 'vendedor' and vendedor_id = auth.uid())
  )
);

create policy "vendas_insert" on vendas for insert with check (
  empresa_id = auth_empresa()
  and (
    auth_papel() in ('admin', 'gestor')
    or (auth_papel() = 'vendedor' and vendedor_id = auth.uid())
  )
);

create policy "vendas_update" on vendas for update using (
  empresa_id = auth_empresa() and is_gestor_ou_admin()
);

create policy "vendas_delete" on vendas for delete using (
  empresa_id = auth_empresa() and is_admin()
);

-- venda_itens ------------------------------------------------------------

create policy "venda_itens_select" on venda_itens for select using (
  exists (
    select 1 from vendas v
     where v.id = venda_itens.venda_id
       and v.empresa_id = auth_empresa()
       and (
         auth_papel() in ('admin', 'gestor', 'financeiro', 'producao')
         or (auth_papel() = 'vendedor' and v.vendedor_id = auth.uid())
       )
  )
);

create policy "venda_itens_write" on venda_itens for all
  using (
    exists (
      select 1 from vendas v
       where v.id = venda_itens.venda_id
         and v.empresa_id = auth_empresa()
         and (
           auth_papel() in ('admin', 'gestor')
           or (auth_papel() = 'vendedor' and v.vendedor_id = auth.uid())
         )
    )
  )
  with check (
    exists (
      select 1 from vendas v
       where v.id = venda_itens.venda_id
         and v.empresa_id = auth_empresa()
         and (
           auth_papel() in ('admin', 'gestor')
           or (auth_papel() = 'vendedor' and v.vendedor_id = auth.uid())
         )
    )
  );

-- producoes --------------------------------------------------------------

create policy "producoes_select" on producoes for select using (
  exists (
    select 1 from vendas v
     where v.id = producoes.venda_id and v.empresa_id = auth_empresa()
  )
);

create policy "producoes_write" on producoes for all
  using (
    auth_papel() in ('admin', 'gestor', 'producao')
    and exists (
      select 1 from vendas v
       where v.id = producoes.venda_id and v.empresa_id = auth_empresa()
    )
  )
  with check (
    auth_papel() in ('admin', 'gestor', 'producao')
    and exists (
      select 1 from vendas v
       where v.id = producoes.venda_id and v.empresa_id = auth_empresa()
    )
  );

-- estoque ----------------------------------------------------------------

create policy "estoque_select" on estoque_movimentacoes for select
  using (empresa_id = auth_empresa());

create policy "estoque_write" on estoque_movimentacoes for all
  using (
    empresa_id = auth_empresa()
    and auth_papel() in ('admin', 'gestor', 'producao')
  )
  with check (
    empresa_id = auth_empresa()
    and auth_papel() in ('admin', 'gestor', 'producao')
  );

-- financeiro -------------------------------------------------------------

create policy "categorias_fin_select" on categorias_financeiras for select
  using (empresa_id = auth_empresa());

create policy "categorias_fin_write" on categorias_financeiras for all
  using (
    empresa_id = auth_empresa()
    and auth_papel() in ('admin', 'gestor', 'financeiro')
  )
  with check (
    empresa_id = auth_empresa()
    and auth_papel() in ('admin', 'gestor', 'financeiro')
  );

create policy "lancamentos_select" on lancamentos_financeiros for select using (
  empresa_id = auth_empresa()
  and auth_papel() in ('admin', 'gestor', 'financeiro')
);

create policy "lancamentos_write" on lancamentos_financeiros for all
  using (
    empresa_id = auth_empresa()
    and auth_papel() in ('admin', 'gestor', 'financeiro')
  )
  with check (
    empresa_id = auth_empresa()
    and auth_papel() in ('admin', 'gestor', 'financeiro')
  );

-- audit_logs (somente leitura para admin/gestor, escrita via service role) -

create policy "audit_select" on audit_logs for select using (
  empresa_id = auth_empresa() and is_gestor_ou_admin()
);

-- anexos -----------------------------------------------------------------

create policy "anexos_select" on anexos for select using (empresa_id = auth_empresa());
create policy "anexos_insert" on anexos for insert with check (
  empresa_id = auth_empresa() and usuario_id = auth.uid()
);
create policy "anexos_delete" on anexos for delete using (
  empresa_id = auth_empresa() and (usuario_id = auth.uid() or is_admin())
);

-- comentarios ------------------------------------------------------------

create policy "comentarios_select" on comentarios for select using (
  exists (select 1 from profiles where id = auth.uid())
);

create policy "comentarios_insert" on comentarios for insert
  with check (usuario_id = auth.uid());

create policy "comentarios_update_self" on comentarios for update
  using (usuario_id = auth.uid());

create policy "comentarios_delete" on comentarios for delete using (
  usuario_id = auth.uid() or is_admin()
);

-- notificacoes -----------------------------------------------------------

create policy "notificacoes_select" on notificacoes for select
  using (usuario_id = auth.uid());

create policy "notificacoes_update_self" on notificacoes for update
  using (usuario_id = auth.uid());

-- tokens_publicos --------------------------------------------------------

create policy "tokens_select" on tokens_publicos for select using (
  empresa_id = auth_empresa()
  and (is_gestor_ou_admin() or vendedor_id = auth.uid())
);

create policy "tokens_write" on tokens_publicos for all
  using (empresa_id = auth_empresa() and is_gestor_ou_admin())
  with check (empresa_id = auth_empresa() and is_gestor_ou_admin());
-- Migration 010: Storage buckets e políticas

insert into storage.buckets (id, name, public)
values
  ('produtos', 'produtos', true),
  ('materiais', 'materiais', true),
  ('clientes', 'clientes', false),
  ('anexos', 'anexos', false),
  ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Helper: pega empresa do usuário a partir do path "<empresa_id>/..."
create or replace function storage_path_empresa(name text)
returns uuid as $$
  select split_part(name, '/', 1)::uuid
$$ language sql immutable;

-- produtos / materiais / avatars: leitura pública, escrita restrita por papel

create policy "storage_produtos_read" on storage.objects for select
  using (bucket_id = 'produtos');

create policy "storage_produtos_write" on storage.objects for insert with check (
  bucket_id = 'produtos'
  and auth.uid() is not null
  and storage_path_empresa(name) = auth_empresa()
  and auth_papel() in ('admin', 'gestor', 'producao')
);

create policy "storage_produtos_delete" on storage.objects for delete using (
  bucket_id = 'produtos'
  and storage_path_empresa(name) = auth_empresa()
  and auth_papel() in ('admin', 'gestor')
);

create policy "storage_materiais_read" on storage.objects for select
  using (bucket_id = 'materiais');

create policy "storage_materiais_write" on storage.objects for insert with check (
  bucket_id = 'materiais'
  and storage_path_empresa(name) = auth_empresa()
  and auth_papel() in ('admin', 'gestor', 'producao')
);

create policy "storage_avatars_read" on storage.objects for select
  using (bucket_id = 'avatars');

create policy "storage_avatars_write" on storage.objects for insert with check (
  bucket_id = 'avatars'
  and auth.uid() is not null
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "storage_avatars_update" on storage.objects for update using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- clientes / anexos: privados, leitura e escrita restrita à empresa

create policy "storage_clientes_read" on storage.objects for select using (
  bucket_id = 'clientes'
  and storage_path_empresa(name) = auth_empresa()
);

create policy "storage_clientes_write" on storage.objects for insert with check (
  bucket_id = 'clientes'
  and storage_path_empresa(name) = auth_empresa()
  and auth_papel() in ('admin', 'gestor', 'vendedor')
);

create policy "storage_anexos_read" on storage.objects for select using (
  bucket_id = 'anexos'
  and storage_path_empresa(name) = auth_empresa()
);

create policy "storage_anexos_write" on storage.objects for insert with check (
  bucket_id = 'anexos'
  and storage_path_empresa(name) = auth_empresa()
  and auth.uid() is not null
);

create policy "storage_anexos_delete" on storage.objects for delete using (
  bucket_id = 'anexos'
  and storage_path_empresa(name) = auth_empresa()
  and auth_papel() in ('admin', 'gestor')
);
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
