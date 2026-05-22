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
