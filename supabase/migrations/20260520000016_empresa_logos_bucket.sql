-- Migration 016: bucket público para logos das empresas
--
-- Convenção de path: `<empresa_id>/logo.<ext>`. Permite só admin/gestor da
-- empresa fazer upload/replace/delete. Leitura é pública para o logo poder
-- aparecer em e-mails transacionais, header, exports etc.

insert into storage.buckets (id, name, public)
values ('empresa-logos', 'empresa-logos', true)
on conflict (id) do nothing;

-- Leitura pública (logo aparece em e-mails, header, exports)
drop policy if exists "empresa_logos_read" on storage.objects;
create policy "empresa_logos_read" on storage.objects for select
  using (bucket_id = 'empresa-logos');

-- Upload: só admin/gestor da empresa, e dentro do prefixo da própria empresa
drop policy if exists "empresa_logos_write" on storage.objects;
create policy "empresa_logos_write" on storage.objects for insert
  with check (
    bucket_id = 'empresa-logos'
    and storage_path_empresa(name) = auth_empresa()
    and is_gestor_ou_admin()
  );

drop policy if exists "empresa_logos_update" on storage.objects;
create policy "empresa_logos_update" on storage.objects for update
  using (
    bucket_id = 'empresa-logos'
    and storage_path_empresa(name) = auth_empresa()
    and is_gestor_ou_admin()
  );

drop policy if exists "empresa_logos_delete" on storage.objects;
create policy "empresa_logos_delete" on storage.objects for delete
  using (
    bucket_id = 'empresa-logos'
    and storage_path_empresa(name) = auth_empresa()
    and is_gestor_ou_admin()
  );
