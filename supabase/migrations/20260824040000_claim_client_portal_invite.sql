-- Bug real encontrado em teste end-to-end do fluxo de cadastro do Portal (Fase B1): depois de
-- `supabase.auth.signUp()`, o próprio usuário recém-criado tentava `insert into
-- client_portal_users` com a própria sessão — bloqueado pela RLS de propósito (só
-- `is_active_staff()` escreve em `client_portal_users`, Fase A). Correção: uma função
-- `SECURITY DEFINER` que faz o vínculo + marca o convite usado, atomicamente, mas só depois de
-- confirmar que o e-mail do convite é o MESMO e-mail autenticado de `auth.uid()` — nunca deixa a
-- sessão de uma pessoa reivindicar o convite de outra só por saber o e-mail.
create or replace function public.claim_client_portal_invite(p_email text)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_caller_email text;
  v_client_id uuid;
begin
  select email into v_caller_email from auth.users where id = auth.uid();
  if v_caller_email is null or lower(v_caller_email) <> lower(p_email) then
    return null;
  end if;

  select client_id into v_client_id
  from public.client_portal_invites
  where lower(email) = lower(p_email) and used_at is null
  limit 1;

  if v_client_id is null then
    return null;
  end if;

  insert into public.client_portal_users (client_id, auth_user_id)
  values (v_client_id, auth.uid())
  on conflict (client_id, auth_user_id) do nothing;

  update public.client_portal_invites set used_at = now() where lower(email) = lower(p_email);

  return v_client_id;
end;
$$;

revoke all on function public.claim_client_portal_invite(text) from public;
grant execute on function public.claim_client_portal_invite(text) to authenticated;
