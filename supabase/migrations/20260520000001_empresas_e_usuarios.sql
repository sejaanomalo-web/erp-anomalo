-- Migration 001: Empresas e usuários
-- Multi-tenancy preparado, profiles estende auth.users.

create extension if not exists "pgcrypto";

create table empresas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cnpj text,
  logo_url text,
  endereco jsonb,
  ativa boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  empresa_id uuid references empresas on delete restrict,
  nome text not null,
  email text not null,
  telefone text,
  cargo text,
  papel text not null check (papel in ('admin', 'gestor', 'vendedor', 'financeiro', 'producao')),
  ativo boolean default true,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index profiles_empresa_idx on profiles(empresa_id);
create index profiles_email_idx on profiles(email);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, email, nome, papel)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nome', new.email),
    coalesce(new.raw_user_meta_data->>'papel', 'vendedor')
  )
  on conflict (id) do nothing;
  return new;
exception
  when others then
    raise log 'handle_new_user falhou para %: %', new.email, sqlerrm;
    return new;
end;
$$;

alter function public.handle_new_user() owner to postgres;

grant execute on function public.handle_new_user() to supabase_auth_admin;
grant execute on function public.handle_new_user() to service_role;
grant insert, select on public.profiles to supabase_auth_admin;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger empresas_set_updated_at
  before update on empresas
  for each row execute function set_updated_at();

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();
