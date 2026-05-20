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
