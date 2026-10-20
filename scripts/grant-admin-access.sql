-- Libera acesso ao /admin/login para os 2 sócios (senha: procreating).
-- Rodar no Supabase Dashboard → SQL Editor (roda como `postgres`, que pode escrever em `auth`).
-- Idempotente: cria a conta se não existir; se existir, redefine a senha e confirma o e-mail.
-- Em seguida garante a linha em `public.users` (sem ela `getSession()` trata como sessão inválida).

create extension if not exists pgcrypto;

do $$
declare
  r record;
  v_id uuid;
begin
  for r in
    select * from (values
      ('martins.santiago08@gmail.com', 'Santiago'),
      ('edufraresso11@gmail.com',      'Eduardo')
    ) as t(email, name)
  loop
    select id into v_id from auth.users where lower(email) = r.email;

    if v_id is null then
      v_id := gen_random_uuid();
      insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
        confirmation_token, recovery_token, email_change_token_new, email_change
      ) values (
        '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', r.email,
        crypt('procreating', gen_salt('bf')), now(),
        '{"provider":"email","providers":["email"]}', '{}', now(), now(),
        '', '', '', ''
      );
      insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
      values (gen_random_uuid(), v_id, v_id::text, 'email',
              jsonb_build_object('sub', v_id::text, 'email', r.email, 'email_verified', true),
              now(), now(), now());
    else
      update auth.users
         set encrypted_password = crypt('procreating', gen_salt('bf')),
             email_confirmed_at = coalesce(email_confirmed_at, now()),
             banned_until = null,
             updated_at = now()
       where id = v_id;
      insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
      select gen_random_uuid(), v_id, v_id::text, 'email',
             jsonb_build_object('sub', v_id::text, 'email', r.email, 'email_verified', true),
             now(), now(), now()
      where not exists (select 1 from auth.identities where user_id = v_id and provider = 'email');
    end if;

    insert into public.users (id, name, email, role)
    values (v_id, r.name, r.email, 'owner')
    on conflict (id) do update set role = 'owner', email = excluded.email;

    update public.team_invites set used_at = coalesce(used_at, now()) where email = r.email;
  end loop;
end $$;

-- Conferência:
select u.email, u.email_confirmed_at is not null as confirmado, p.role
from auth.users u left join public.users p on p.id = u.id
where u.email in ('martins.santiago08@gmail.com', 'edufraresso11@gmail.com');
