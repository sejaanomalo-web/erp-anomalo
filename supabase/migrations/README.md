# Migrations Supabase — ERP Anômalo

Ordem de aplicação (manter ordem cronológica do prefixo):

1. `20260520000001_empresas_e_usuarios.sql` — Empresas, profiles, trigger de novo usuário, `set_updated_at()`.
2. `20260520000002_catalogo.sql` — Produtos, variantes, materiais, fornecedores.
3. `20260520000003_clientes_e_leads.sql` — Clientes, leads, interações.
4. `20260520000004_vendas_e_producao.sql` — Vendas, itens, produções.
5. `20260520000005_estoque.sql` — Movimentações com trigger de atualização automática.
6. `20260520000006_financeiro.sql` — Categorias, lançamentos, view de status calculado.
7. `20260520000007_audit_anexos_comentarios.sql` — Audit log, anexos, comentários.
8. `20260520000008_notificacoes_e_tokens.sql` — Notificações in-app e tokens públicos.
9. `20260520000009_rls_policies.sql` — Habilita RLS e cria todas as policies por papel.
10. `20260520000010_storage_buckets.sql` — Buckets de storage e policies.

## Aplicar

Quando o projeto Supabase dedicado existir:

```bash
# via supabase CLI (recomendado)
supabase link --project-ref <project-id>
supabase db push

# ou aplicando cada arquivo manualmente no SQL editor
```

Após aplicar, gerar tipos TypeScript:

```bash
npx supabase gen types typescript --project-id <project-id> > src/types/database.types.ts
```

## Notas

- Audit log retém por padrão 5 anos. Job de limpeza fica fora destas migrations e deve ser configurado via cron Supabase em uma etapa de pós-deploy.
- Storage convenciona o path `<empresa_id>/...` para isolar tenants. As policies dependem desse padrão; respeitar ao subir arquivos no client.
- Helpers `auth_papel()`, `auth_empresa()`, `is_admin()`, `is_gestor_ou_admin()` são `security definer stable` para serem usadas dentro das policies sem overhead.
- O trigger `aplicar_movimentacao_estoque` mantém `produto_variantes.estoque_atual` e `materiais.estoque_atual` sincronizados. Não escrever direto nesses campos pela aplicação; passar sempre por `estoque_movimentacoes`.
