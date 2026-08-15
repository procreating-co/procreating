-- "Adicionar novo membro da equipe" (menu +) — `public.users.id` é FK obrigatória pra
-- `auth.users(id)` (ver `create table public.users`, migration inicial): não dá pra criar uma
-- linha de "membro da equipe" sem uma conta de autenticação real por trás. Antes desta migration,
-- quem podia se cadastrar em `/admin/signup` era decidido por um array hardcoded no código
-- (`PARTNER_ALLOWLIST`, `lib/admin/auth/partners.ts`) — bootstrap razoável pra "só os 2 sócios",
-- mas não dá pra crescer o time sem editar código. `team_invites` substitui o array por uma
-- tabela: Santiago convida (nome + e-mail + cargo sugeridos), a pessoa se cadastra normalmente
-- em `/admin/signup` com aquele e-mail, e o cargo/nome do convite viram o perfil real
-- (`used_at` marca quando isso acontece — convite não pode ser reaproveitado por outro e-mail).

create table public.team_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  role text not null check (role in ('owner', 'admin', 'commercial', 'marketing', 'operations', 'finance', 'production')),
  invited_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  used_at timestamptz
);

-- Os 2 sócios que já estavam no array hardcoded — preserva o acesso deles sem precisar re-convidar
-- (idempotente: `on conflict do nothing`, seguro rodar mesmo se um dos dois já tiver `public.users`).
insert into public.team_invites (email, name, role, invited_by)
select 'martins.santiago08@gmail.com', 'Santiago', 'owner', id from auth.users where email = 'martins.santiago08@gmail.com'
union all
select 'edufraresso11@gmail.com', 'Eduardo', 'owner', id from auth.users where email = 'martins.santiago08@gmail.com'
on conflict (email) do nothing;

alter table public.team_invites enable row level security;
create policy team_invites_all_authenticated on public.team_invites for all to authenticated using (true) with check (true);
-- Sem policy pra `anon` de propósito — a tabela inteira (nomes/e-mails/cargos convidados) nunca
-- fica lista via REST direto por quem não logou. `signUpAction` roda ANTES de existir sessão e
-- precisa checar SÓ o e-mail que a própria pessoa está tentando cadastrar — isso é a função
-- abaixo (`SECURITY DEFINER`, devolve no máximo 1 linha, a do e-mail pedido), não uma policy de
-- SELECT aberta.

create or replace function public.get_team_invite(p_email text)
returns table (name text, role text, used_at timestamptz)
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select name, role, used_at from public.team_invites where lower(email) = lower(p_email) limit 1;
$$;

revoke all on function public.get_team_invite(text) from public;
grant execute on function public.get_team_invite(text) to anon, authenticated;

create or replace function public.mark_team_invite_used(p_email text)
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  update public.team_invites set used_at = now() where lower(email) = lower(p_email);
$$;

revoke all on function public.mark_team_invite_used(text) from public;
grant execute on function public.mark_team_invite_used(text) to anon, authenticated;
