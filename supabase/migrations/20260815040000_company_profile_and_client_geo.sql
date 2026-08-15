-- Seed de dados reais — parte 1/2: schema. Dois acréscimos genuinamente necessários (não
-- justificam mais do que isto):
--
-- 1. clients.city/state — todo cliente real fornecido tem cidade/estado, e não havia coluna
--    (mesmo padrão já usado em `leads.city`/`leads.state`, migration `20260815010000`).
-- 2. company_profile — dados da própria Procreating (nome, cidade, metas). Não existia NENHUMA
--    tabela pra isso; `/configuracoes/empresa` é um "Coming Soon" esperando exatamente isto.
--    Tabela de 1 linha (settings), a maioria dos campos NULL de propósito — só o que foi
--    informado é preenchido; CNPJ/endereço/regime tributário/impostos ficam NULL até existir
--    fonte real, nunca inferidos.

alter table public.clients
  add column city text,
  add column state text;

create table public.company_profile (
  id uuid primary key default gen_random_uuid(),
  name text,
  trade_name text,
  legal_name text,
  cnpj text,
  city text,
  state text,
  founded_at date,
  address text,
  zip_code text,
  email text,
  phone text,
  website text,
  instagram text,
  tax_regime text,
  avg_tax_rate_pct numeric(5, 2),
  annual_revenue_goal numeric(12, 2),
  monthly_profit_goal numeric(12, 2),
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.company_profile enable row level security;
create policy company_profile_all_authenticated on public.company_profile for all to authenticated using (true) with check (true);
