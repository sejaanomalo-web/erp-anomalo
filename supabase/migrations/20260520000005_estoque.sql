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
