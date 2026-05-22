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
