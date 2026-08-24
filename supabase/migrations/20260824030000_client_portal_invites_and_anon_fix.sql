-- Fase B1 — fecha a pendência de segurança deixada pela Fase A e cria o mecanismo de convite de
-- usuário de Portal, espelhando `team_invites` (`20260815000000_team_invites.sql`) ponto a ponto:
-- staff cria o convite (aqui, ligado a um `client_id` em vez de um `role`), a pessoa se cadastra
-- sozinha em `/portal/signup` com aquele e-mail — nunca criamos a conta por ela.
--
-- 1) Pendência da Fase A: `is_active_staff()`, `is_portal_member_of()` e
--    `get_client_portal_profile()` ficaram com `EXECUTE` também para `anon` (grant automático do
--    projeto via `ALTER DEFAULT PRIVILEGES`, independente do `revoke ... from public` que a
--    migration original já tinha). Verificado como inofensivo (auth.uid() resolve NULL pra anon,
--    as 3 funções sempre respondem "não" ou 0 linhas) mas não é o desenho prometido — fechado
--    agora, antes do primeiro login real de cliente existir.
revoke execute on function public.is_active_staff() from anon;
revoke execute on function public.is_portal_member_of(uuid) from anon;
revoke execute on function public.get_client_portal_profile(text) from anon;

-- 2) client_portal_invites — mesma forma de team_invites, client_id no lugar de role.
create table public.client_portal_invites (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  email text not null unique,
  name text not null,
  invited_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  used_at timestamptz
);

create index client_portal_invites_client_id_idx on public.client_portal_invites (client_id);

alter table public.client_portal_invites enable row level security;

-- Staff gerencia convites (criar/listar/revogar) — mesmo padrão de acesso das outras tabelas do
-- Portal na Fase A, não o `USING(true)` que `team_invites` ainda usa (não é escopo desta
-- migration mexer em `team_invites`).
create policy client_portal_invites_staff_all on public.client_portal_invites
  for all to authenticated
  using (public.is_active_staff())
  with check (public.is_active_staff());

-- Sem policy pra `anon` de propósito, mesmo raciocínio de `team_invites`: a tabela inteira
-- (e-mails convidados) nunca fica listável via REST direto por quem não logou. `signUpAction` do
-- Portal roda ANTES de existir sessão e só pode checar o e-mail que a própria pessoa está
-- tentando cadastrar — é isso que as duas funções abaixo fazem (devolvem no máximo 1 linha).
create or replace function public.get_client_portal_invite(p_email text)
returns table (client_id uuid, name text, used_at timestamptz)
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select client_id, name, used_at from public.client_portal_invites where lower(email) = lower(p_email) limit 1;
$$;

revoke all on function public.get_client_portal_invite(text) from public;
grant execute on function public.get_client_portal_invite(text) to anon, authenticated;

create or replace function public.mark_client_portal_invite_used(p_email text)
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  update public.client_portal_invites set used_at = now() where lower(email) = lower(p_email);
$$;

revoke all on function public.mark_client_portal_invite_used(text) from public;
grant execute on function public.mark_client_portal_invite_used(text) to anon, authenticated;

-- 3) get_my_portal_client() — a peça que faltava na Fase A: `get_client_portal_profile(slug)`
-- exige já saber o slug; no login, a sessão só tem `auth.uid()`. Mesmo formato de retorno
-- (colunas não sensíveis de `clients`), mas resolve "qual cliente sou eu" sem parâmetro nenhum —
-- sempre `auth.uid()`, mesmo raciocínio de segurança das outras 3 funções da Fase A.
create or replace function public.get_my_portal_client()
returns table (
  id uuid,
  name text,
  slug text,
  status text,
  city text,
  state text,
  project_stage text
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select c.id, c.name, c.slug, c.status, c.city, c.state, c.project_stage
  from public.clients c
  join public.client_portal_users cpu on cpu.client_id = c.id
  where cpu.auth_user_id = auth.uid()
    and cpu.is_active = true
  limit 1;
$$;

revoke all on function public.get_my_portal_client() from public;
grant execute on function public.get_my_portal_client() to authenticated;
