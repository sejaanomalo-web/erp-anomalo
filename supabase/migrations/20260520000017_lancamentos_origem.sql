-- Migration 017: lancamentos_financeiros.origem
-- Campo livre para registrar a origem da receita/despesa
-- (ex.: "Venda balcão", "Comissão Maria", "Aluguel galpão").

alter table lancamentos_financeiros
  add column if not exists origem text;
