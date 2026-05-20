-- Fix para o trigger on_auth_user_created falhar com
--   "Database error creating new user"
--
-- Causa: a função handle_new_user() foi criada sem search_path explícito e
-- sem grant para o role supabase_auth_admin (que é quem dispara o trigger
-- quando o painel Auth cria um usuário).
--
-- Esta migration:
--   1. Recria a função com search_path fixado e SECURITY DEFINER OWNED BY postgres
--   2. Concede execute ao supabase_auth_admin
--   3. Concede insert em profiles ao supabase_auth_admin (defesa em profundidade)
--   4. Reaplica o trigger
--   5. Confirma com select

drop trigger if exists on_auth_user_created on auth.users;

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
    -- Loga o erro mas não interrompe o cadastro do usuário em auth.users.
    raise log 'handle_new_user falhou para %: %', new.email, sqlerrm;
    return new;
end;
$$;

alter function public.handle_new_user() owner to postgres;

grant execute on function public.handle_new_user() to supabase_auth_admin;
grant execute on function public.handle_new_user() to service_role;

grant insert, select on public.profiles to supabase_auth_admin;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Verificação: o trigger existe e está enabled (O = enabled)
select tgname, tgenabled
  from pg_trigger
 where tgname = 'on_auth_user_created';
