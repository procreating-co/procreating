-- Redesign do Dashboard executivo — duas peças de dado que faltavam pra não inventar número.

-- 1. Meta mensal de faturamento da empresa. Não existia (só meta POR ESTRATÉGIA em
-- strategies.revenue_goal) — uma linha por mês-calendário (dia 1) preserva a meta que valia num
-- mês passado mesmo que a meta futura mude. Sem linha pro mês corrente, o Dashboard mostra
-- "meta não definida" em vez de inventar um número.
create table public.revenue_goals (
  id uuid primary key default gen_random_uuid(),
  month date not null unique,
  amount numeric(12, 2) not null,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.revenue_goals enable row level security;
create policy revenue_goals_all_authenticated on public.revenue_goals for all to authenticated using (true) with check (true);

-- 2. Probabilidade por etapa do pipeline, pra "Weighted Pipeline" — nullable, SEM default
-- nenhum (nunca chuto 20%/50%/etc. por etapa). Enquanto não for preenchida (UI de edição fica
-- pra depois, fora do escopo desta fase), o cálculo mostra "not enough data".
alter table public.pipeline_stages
  add column probability numeric(5, 2) check (probability is null or (probability >= 0 and probability <= 100));
