-- Motor de Listas (Comercial → Prospecção) — "Lista" vira entidade de primeira classe, não um
-- campo de texto livre. Conecta com Estratégia (`strategy_id`) e com os Leads que ela originou
-- (`leads.list_id`, novo) — permite responder "essa lista/estratégia converteu quanto?" sem
-- reconstruir nada, só filtrar por FK. `status` é o estado da campanha de prospecção em si, não
-- do lead individual (esse já tem `pipeline_stages`).

create table public.prospecting_lists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  origin text not null default 'CSV', -- 'CSV' hoje; 'XLSX'/'API'/'Scraping' — mesmo campo, sem migration nova
  strategy_id uuid references public.strategies (id),
  status text not null default 'em_prospeccao'
    check (status in ('em_prospeccao', 'pausada', 'concluida')),
  lead_count integer not null default 0, -- contagem no momento da importação, exibição rápida (não é fonte de verdade — count(*) em leads via list_id é)
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.leads add column list_id uuid references public.prospecting_lists (id);

create index prospecting_lists_strategy_id_idx on public.prospecting_lists (strategy_id);
create index leads_list_id_idx on public.leads (list_id);

alter table public.prospecting_lists enable row level security;
create policy prospecting_lists_all_authenticated on public.prospecting_lists for all to authenticated using (true) with check (true);
