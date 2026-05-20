-- Migration 010: Storage buckets e políticas

insert into storage.buckets (id, name, public)
values
  ('produtos', 'produtos', true),
  ('materiais', 'materiais', true),
  ('clientes', 'clientes', false),
  ('anexos', 'anexos', false),
  ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Helper: pega empresa do usuário a partir do path "<empresa_id>/..."
create or replace function storage_path_empresa(name text)
returns uuid as $$
  select split_part(name, '/', 1)::uuid
$$ language sql immutable;

-- produtos / materiais / avatars: leitura pública, escrita restrita por papel

create policy "storage_produtos_read" on storage.objects for select
  using (bucket_id = 'produtos');

create policy "storage_produtos_write" on storage.objects for insert with check (
  bucket_id = 'produtos'
  and auth.uid() is not null
  and storage_path_empresa(name) = auth_empresa()
  and auth_papel() in ('admin', 'gestor', 'producao')
);

create policy "storage_produtos_delete" on storage.objects for delete using (
  bucket_id = 'produtos'
  and storage_path_empresa(name) = auth_empresa()
  and auth_papel() in ('admin', 'gestor')
);

create policy "storage_materiais_read" on storage.objects for select
  using (bucket_id = 'materiais');

create policy "storage_materiais_write" on storage.objects for insert with check (
  bucket_id = 'materiais'
  and storage_path_empresa(name) = auth_empresa()
  and auth_papel() in ('admin', 'gestor', 'producao')
);

create policy "storage_avatars_read" on storage.objects for select
  using (bucket_id = 'avatars');

create policy "storage_avatars_write" on storage.objects for insert with check (
  bucket_id = 'avatars'
  and auth.uid() is not null
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "storage_avatars_update" on storage.objects for update using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- clientes / anexos: privados, leitura e escrita restrita à empresa

create policy "storage_clientes_read" on storage.objects for select using (
  bucket_id = 'clientes'
  and storage_path_empresa(name) = auth_empresa()
);

create policy "storage_clientes_write" on storage.objects for insert with check (
  bucket_id = 'clientes'
  and storage_path_empresa(name) = auth_empresa()
  and auth_papel() in ('admin', 'gestor', 'vendedor')
);

create policy "storage_anexos_read" on storage.objects for select using (
  bucket_id = 'anexos'
  and storage_path_empresa(name) = auth_empresa()
);

create policy "storage_anexos_write" on storage.objects for insert with check (
  bucket_id = 'anexos'
  and storage_path_empresa(name) = auth_empresa()
  and auth.uid() is not null
);

create policy "storage_anexos_delete" on storage.objects for delete using (
  bucket_id = 'anexos'
  and storage_path_empresa(name) = auth_empresa()
  and auth_papel() in ('admin', 'gestor')
);
