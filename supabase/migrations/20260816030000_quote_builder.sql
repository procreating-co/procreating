-- P3 — Quote Builder + catálogo de serviço. Único item que sobrou pendente da lista "fora de
-- escopo" registrada no plano do Pipeline UX (P2): motor de listas, sequências de prospecção,
-- gestos de trackpad e Command K já foram todos construídos em passes anteriores desta mesma
-- sessão (ver git log) — Timer/XP do Workspace foi explicitamente adiado pra outra fase pelo
-- usuário. Isto fecha o fluxo central Lead → proposta → Deal: hoje o valor negociado
-- (`leads.potential_value`) é um número solto, sem o detalhamento por serviço que uma proposta
-- de verdade tem.
--
-- 3 tabelas: catálogo reutilizável (nasce vazio, populado à medida que orçamentos são criados —
-- "+ novo serviço" no builder também grava aqui, pra reaproveitar da próxima vez, sem precisar
-- de uma tela de cadastro separada agora) + orçamento + itens do orçamento (preço/quantidade no
-- momento — nunca uma referência viva ao catálogo, orçamento é uma fotografia, preço de catálogo
-- muda depois e orçamentos antigos não podem mudar junto).
create table public.service_catalog (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  default_price numeric(12, 2),
  unit text,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now()
);

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  -- Um orçamento nasce preso a um lead (fluxo comercial, antes de fechar) OU a um cliente
  -- (upsell pra quem já é cliente) — nunca os dois, nunca nenhum dos dois.
  lead_id uuid references public.leads (id) on delete cascade,
  client_id uuid references public.clients (id) on delete cascade,
  title text not null,
  status text not null default 'rascunho' check (status in ('rascunho', 'enviado', 'aceito', 'recusado')),
  notes text,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quotes_exactly_one_owner check ((lead_id is not null)::int + (client_id is not null)::int = 1)
);

create table public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes (id) on delete cascade,
  service_name text not null,
  description text,
  quantity numeric(10, 2) not null default 1,
  unit_price numeric(12, 2) not null,
  created_at timestamptz not null default now()
);

create index quotes_lead_id_idx on public.quotes (lead_id);
create index quotes_client_id_idx on public.quotes (client_id);
create index quote_items_quote_id_idx on public.quote_items (quote_id);

alter table public.service_catalog enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;

create policy service_catalog_all_authenticated on public.service_catalog for all to authenticated using (true) with check (true);
create policy quotes_all_authenticated on public.quotes for all to authenticated using (true) with check (true);
create policy quote_items_all_authenticated on public.quote_items for all to authenticated using (true) with check (true);
