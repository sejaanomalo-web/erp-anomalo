-- Migration 015: vendas.taxa
--
-- Campo separado de desconto para taxas (ex: máquina de cartão, juros)
-- que reduzem o líquido recebido. Total = valorItens - desconto - taxa.

alter table vendas
  add column if not exists taxa numeric(12,2) not null default 0;
