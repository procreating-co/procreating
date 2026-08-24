-- Fundação do Client Portal (Fase A, parte 1/2) — aditiva, não toca em nenhuma policy existente.
--
-- Cria as três funções `SECURITY DEFINER` e as duas tabelas novas do Portal
-- (`client_portal_users`, `client_portal_config`) intercaladas, na única ordem que compila:
-- is_active_staff() (não depende de tabela nova) → client_portal_users (a policy usa
-- is_active_staff()) → is_portal_member_of() (função `language sql` é parseada na criação, então
-- client_portal_users já precisa existir) → client_portal_config (usa as duas funções) →
-- get_client_portal_profile() (usa is_portal_member_of() e clients, ambas já existentes). Isso
-- serve de base para a parte 2 desta fase (que substitui as policies `_all_authenticated` de
-- `clients`/`contracts`/`production_projects`/`production_items` por versões que também
-- respeitam o vínculo do Portal). Ver plano completo aprovado na conversa — resumo do desenho:
--
--   auth.users
--    ├── staff  → public.users (já existe, inalterada)
--    └── client → client_portal_users → clients
--
-- `is_active_staff()` e `is_portal_member_of()` são donas por `postgres` (BYPASSRLS=true neste
-- projeto, confirmado em produção), então a query que fazem dentro de `public.users` /
-- `client_portal_users` NUNCA reentra a RLS dessas tabelas — sem risco de recursão, mesmo padrão
-- já usado por `get_team_invite`/`mark_team_invite_used` (`20260815000000_team_invites.sql`).
-- Nenhuma das três funções aceita um id de usuário como parâmetro: todas usam `auth.uid()`
-- internamente, então não há como uma sessão "perguntar" pela identidade de outra.
--
-- `get_client_portal_profile(slug)` resolve slug→cliente e checa propriedade no MESMO where —
-- não em dois passos — para nunca existir uma janela onde o id foi resolvido mas ainda não
-- validado. Só devolve as colunas não sensíveis de `clients` (aprovado explicitamente): id, name,
-- slug, status, city, state, project_stage. `document`, `created_by`, `strategy_id`, `segment`,
-- `created_at`, `updated_at` ficam de fora — o Portal nunca deve fazer `select *` direto em
-- `clients`, só chamar esta função.

-- Staff ativo: id = auth.uid() em public.users, status = 'ativo'. `role <> 'client'` é defesa
-- extra — 'client' é um valor válido no CHECK de public.users.role mas nenhuma linha usa isso
-- hoje (public.users é staff-only por desenho; usuário de Portal nunca ganha linha ali).
create or replace function public.is_active_staff()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.status = 'ativo'
      and u.role <> 'client'
  );
$$;

revoke all on function public.is_active_staff() from public;
grant execute on function public.is_active_staff() to authenticated;

-- client_portal_users precisa existir ANTES de is_portal_member_of(): funções `language sql`
-- passam por análise de parse na criação (como uma view), então a tabela referenciada no corpo
-- já tem que existir nesse ponto — diferente de uma policy, cujo texto só é validado no uso.
create table public.client_portal_users (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  auth_user_id uuid not null references auth.users (id) on delete cascade,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, auth_user_id)
);

create index client_portal_users_client_id_idx on public.client_portal_users (client_id);
create index client_portal_users_auth_user_id_idx on public.client_portal_users (auth_user_id);

alter table public.client_portal_users enable row level security;

create policy client_portal_users_staff_all on public.client_portal_users
  for all to authenticated
  using (public.is_active_staff())
  with check (public.is_active_staff());

-- Vínculo de Portal ativo do usuário logado com o client_id informado. `target_client_id` sempre
-- vem da LINHA sendo avaliada por uma policy (clients.id, contracts.client_id, ...), nunca de
-- input livre do chamador — não há vetor de impersonação aqui.
create or replace function public.is_portal_member_of(target_client_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.client_portal_users cpu
    where cpu.auth_user_id = auth.uid()
      and cpu.client_id = target_client_id
      and cpu.is_active = true
  );
$$;

revoke all on function public.is_portal_member_of(uuid) from public;
grant execute on function public.is_portal_member_of(uuid) to authenticated;

create table public.client_portal_config (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null unique references public.clients (id) on delete cascade,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.client_portal_config enable row level security;

create policy client_portal_config_staff_all on public.client_portal_config
  for all to authenticated
  using (public.is_active_staff())
  with check (public.is_active_staff());

create policy client_portal_config_portal_select_own on public.client_portal_config
  for select to authenticated
  using (public.is_portal_member_of(client_portal_config.client_id));

-- Depende de is_portal_member_of() já existir (definida acima).
create or replace function public.get_client_portal_profile(p_slug text)
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
  where c.slug = p_slug
    and public.is_portal_member_of(c.id);
$$;

revoke all on function public.get_client_portal_profile(text) from public;
grant execute on function public.get_client_portal_profile(text) to authenticated;
