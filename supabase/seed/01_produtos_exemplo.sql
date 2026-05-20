-- Cria 3 produtos com variantes para você conseguir testar /vendas/nova.
-- Roda depois do 00_primeiro_admin.sql.

with empresa as (
  select id from empresas where nome = 'Aton Estofados' limit 1
), prod as (
  insert into produtos (empresa_id, nome, descricao, categoria, ativo)
  select id, p.nome, p.descricao, p.categoria, true
    from empresa, (values
      ('Sofá Vênus', 'Sofá retrátil com encosto reclinável.', 'Sofá'),
      ('Poltrona Atena', 'Poltrona giratória, base em aço.', 'Poltrona'),
      ('Chaise Apollo', 'Chaise longue para sala de estar.', 'Chaise')
    ) as p(nome, descricao, categoria)
  on conflict do nothing
  returning id, nome
)
select * from prod;

-- Variantes
insert into produto_variantes (produto_id, nome, sku, preco_venda, custo, estoque_atual, estoque_minimo, ativo)
select p.id, v.nome, v.sku, v.preco_venda, v.custo, v.estoque_atual, v.estoque_minimo, true
  from produtos p
  join (values
    ('Sofá Vênus', '2 lug. retrátil suede grafite', 'SVN-2L-SDG', 4800, 2200, 4, 2),
    ('Sofá Vênus', '3 lug. retrátil suede grafite', 'SVN-3L-SDG', 6200, 2900, 3, 2),
    ('Sofá Vênus', '3 lug. retrátil linho cru', 'SVN-3L-LNC', 5800, 2700, 2, 2),
    ('Poltrona Atena', 'Couro caramelo', 'PAT-CRM', 2900, 1300, 6, 3),
    ('Poltrona Atena', 'Veludo terra', 'PAT-VLT', 2700, 1200, 8, 3),
    ('Chaise Apollo', 'Veludo terra', 'CAP-VLT', 5400, 2400, 1, 2)
  ) as v(produto_nome, nome, sku, preco_venda, custo, estoque_atual, estoque_minimo)
    on v.produto_nome = p.nome
  on conflict (sku) do nothing;

-- Categorias financeiras padrão (úteis para o módulo Financeiro)
insert into categorias_financeiras (empresa_id, nome, tipo, cor, ativa)
select e.id, c.nome, c.tipo, c.cor, true
  from empresas e, (values
    ('Vendas',           'entrada', '#16a34a'),
    ('Recebimento parcela', 'entrada', '#16a34a'),
    ('Fornecedor',       'saida',   '#eab308'),
    ('Comissão',         'saida',   '#C9953A'),
    ('Folha',            'saida',   '#ef4444'),
    ('Aluguel',          'saida',   '#5b6473'),
    ('Insumo',           'saida',   '#8a93a3')
  ) as c(nome, tipo, cor)
 where e.nome = 'Aton Estofados'
on conflict do nothing;

select count(*) as produtos from produtos;
select count(*) as variantes from produto_variantes;
select count(*) as categorias from categorias_financeiras;
