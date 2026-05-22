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
