-- Bootstrap inicial: cria a primeira empresa (Aton Estofados) e promove o
-- primeiro usuário a admin. Execute APÓS criar o usuário no painel
-- Authentication > Users do Supabase.
--
-- Ordem:
--   1. Crie um usuário em https://supabase.com/dashboard/project/uftcvphallyncbvmtabt/auth/users
--      (botão "Add user" > "Create new user" > preencha e-mail e senha).
--   2. O trigger on_auth_user_created cria automaticamente um profile com
--      papel='vendedor' e nome = e-mail.
--   3. Rode este SQL no SQL Editor para criar a Aton e promover o usuário.

-- 1) Cria a primeira empresa (Aton Estofados) se ainda não existir
with nova as (
  insert into empresas (nome, cnpj, ativa)
  select 'Aton Estofados', null, true
  where not exists (
    select 1 from empresas where nome = 'Aton Estofados'
  )
  returning id
)
select * from nova;

-- 2) Promove o usuário ao papel admin e vincula à Aton
--    SUBSTITUA o e-mail abaixo pelo e-mail real do admin (o que você criou no passo 1).
update profiles
   set papel = 'admin',
       empresa_id = (select id from empresas where nome = 'Aton Estofados' limit 1),
       nome = coalesce(nullif(nome, email), nome)
 where email = 'sejaanomalo@gmail.com';  -- TROQUE pelo e-mail correto

-- 3) Confirme
select id, email, nome, papel, empresa_id, ativo
  from profiles
 where email = 'sejaanomalo@gmail.com';
