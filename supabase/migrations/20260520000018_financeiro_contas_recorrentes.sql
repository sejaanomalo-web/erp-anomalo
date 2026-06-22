-- Migration 018: Financeiro v2 — contas, recorrentes e evolução de lançamentos
--
-- Mantém o idioma do ERP (tipo entrada/saida, status pendente/pago) — a UI
-- apenas apresenta "Receita/Despesa" e "Previsto/Realizado". Adiciona contas
-- bancárias, pagamentos recorrentes (materialização mensal) e vincula
-- lançamentos a conta/recorrente. RLS por empresa do usuário (auth_empresa()).
--
-- IDEMPOTENTE: pode ser executada quantas vezes for necessário, mesmo que
-- parte já exista (triggers e policies são recriados com drop ... if exists).
-- Isto repara o caso em que esta migração não chegou a ser aplicada no banco
-- dedicado do ERP (causa das falhas "ao salvar lançamento/conta/recorrente").

-- 1. Categorias ganham ordem (cor já existe na migração 006)
alter table categorias_financeiras
  add column if not exists ordem int not null default 0;

-- 2. Contas (banco / caixa / cartão / investimento)
create table if not exists contas_financeiras (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid references empresas not null,
  nome text not null,
  tipo text not null default 'banco'
    check (tipo in ('banco', 'caixa', 'cartao_credito', 'investimento')),
  saldo_inicial numeric(12,2) not null default 0,
  data_saldo_inicial date not null default current_date,
  ativa boolean not null default true,
  ordem int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists contas_fin_empresa_idx on contas_financeiras(empresa_id);
drop trigger if exists contas_fin_set_updated_at on contas_financeiras;
create trigger contas_fin_set_updated_at
  before update on contas_financeiras
  for each row execute function set_updated_at();

-- 3. Pagamentos recorrentes (templates que geram lançamentos)
create table if not exists recorrentes_financeiros (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid references empresas not null,
  nome text not null,
  tipo text not null check (tipo in ('entrada', 'saida')),
  valor numeric(12,2) not null,
  categoria_id uuid references categorias_financeiras,
  conta_id uuid references contas_financeiras,
  periodicidade text not null default 'mensal'
    check (periodicidade in ('mensal', 'anual', 'semanal')),
  dia_vencimento int check (dia_vencimento between 1 and 31),
  inicio date not null default current_date,
  fim date,
  ativo boolean not null default true,
  ultimo_lancamento_gerado date,
  observacoes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists recorrentes_fin_empresa_idx
  on recorrentes_financeiros(empresa_id, ativo);
drop trigger if exists recorrentes_fin_set_updated_at on recorrentes_financeiros;
create trigger recorrentes_fin_set_updated_at
  before update on recorrentes_financeiros
  for each row execute function set_updated_at();

-- 4. Lançamentos: vínculo com conta e recorrente (+ origem, caso a 017 também
--    não tenha sido aplicada — add column if not exists é seguro de repetir).
alter table lancamentos_financeiros
  add column if not exists origem text,
  add column if not exists conta_id uuid references contas_financeiras,
  add column if not exists recorrente_id uuid references recorrentes_financeiros
    on delete set null;
create index if not exists lancamentos_conta_idx
  on lancamentos_financeiros(conta_id);
create index if not exists lancamentos_recorrente_idx
  on lancamentos_financeiros(recorrente_id);

-- 5. Idempotência da materialização: 1 lançamento por (recorrente, mês de competência)
--    date_trunc precisa do cast ::timestamp: sobre `date`, o Postgres escolhe a
--    variante timestamptz (apenas STABLE) e o índice exige IMMUTABLE (erro 42P17).
create unique index if not exists lancamentos_recorrente_mes_uniq
  on lancamentos_financeiros (recorrente_id, (date_trunc('month', data_competencia::timestamp)))
  where recorrente_id is not null;

-- 6. RLS das novas tabelas. Alinhado ao padrão do financeiro: leitura para a
--    empresa; escrita restrita aos papéis admin/gestor/financeiro (mesma regra
--    de lancamentos_financeiros/categorias_financeiras na migração 009).
alter table contas_financeiras enable row level security;
alter table recorrentes_financeiros enable row level security;

drop policy if exists contas_fin_select on contas_financeiras;
drop policy if exists contas_fin_write on contas_financeiras;
create policy contas_fin_select on contas_financeiras
  for select using (empresa_id = auth_empresa());
create policy contas_fin_write on contas_financeiras
  for all
  using (
    empresa_id = auth_empresa()
    and auth_papel() in ('admin', 'gestor', 'financeiro')
  )
  with check (
    empresa_id = auth_empresa()
    and auth_papel() in ('admin', 'gestor', 'financeiro')
  );

drop policy if exists recorrentes_fin_select on recorrentes_financeiros;
drop policy if exists recorrentes_fin_write on recorrentes_financeiros;
create policy recorrentes_fin_select on recorrentes_financeiros
  for select using (empresa_id = auth_empresa());
create policy recorrentes_fin_write on recorrentes_financeiros
  for all
  using (
    empresa_id = auth_empresa()
    and auth_papel() in ('admin', 'gestor', 'financeiro')
  )
  with check (
    empresa_id = auth_empresa()
    and auth_papel() in ('admin', 'gestor', 'financeiro')
  );
