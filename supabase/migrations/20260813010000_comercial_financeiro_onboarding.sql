-- Comercial + Onboarding + Financeiro — Fases 2-5 (unificadas) do roadmap do Procreating OS.
--
-- Migration NOVA — não edita `20260729000000_initial_schema.sql` (Fase 1, tratada como já
-- aplicada/congelada). Estende o que a Fase 1 deixou pronto: `public.clients` ganha `strategy_id`
-- no fim deste arquivo; `public.events` (já generalizado na Fase 1 com `entity_type`/`entity_id`)
-- é reaproveitado como histórico de lead (`entity_type = 'lead'`) — de propósito, não existe uma
-- tabela `lead_activities` aqui, seria duplicar o que `events` já resolve.
--
-- Também não existe `strategy_funnel_events`: o funil de uma estratégia é derivado em runtime
-- (`lib/comercial/funnel.ts`) a partir de `leads.stage_id` (estágio atual) + eventos
-- `stage_changed` em `public.events` (estágios por onde o lead já passou) — decisão registrada
-- aqui e no código, não uma omissão. Volume de leads de uma agência pequena (dezenas/centenas)
-- não justifica pré-computar; se um dia justificar, isso é uma extensão aditiva, não uma
-- migração de dado.
--
-- COMO APLICAR: cole este arquivo inteiro no SQL Editor do Supabase DEPOIS de
-- `20260729000000_initial_schema.sql` (e do seed em `supabase/seed-foundation.sql`, se ainda não
-- tiver rodado) — a FK de `leads.owner_id`/`created_by` etc. para `auth.users`/`public.clients`
-- exige que a Fase 1 já exista.

-- ---------------------------------------------------------------------------
-- pipeline_stages — funil comercial configurável (tabela, não union fechada — mesmo raciocínio
-- de `lib/prospeccao/stages.ts`, mas persistido). `is_won`/`is_lost` marcam os estágios terminais
-- que o resto do sistema precisa reconhecer sem hardcode de string (ex.: o RPC de fechamento no
-- fim deste arquivo usa `is_won`, nunca compara `key = 'fechado'` diretamente).
-- ---------------------------------------------------------------------------
create table public.pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  color text not null,
  sort_order integer not null,
  is_won boolean not null default false,
  is_lost boolean not null default false,
  created_at timestamptz not null default now()
);

create index pipeline_stages_sort_order_idx on public.pipeline_stages (sort_order);

-- ---------------------------------------------------------------------------
-- strategies — definição de campanha/público-alvo comercial (ICP, oferta, canal, metas). Não
-- confundir com `Strategy`/`StrategyCategory` de `lib/prospeccao/types.ts` (esse é um playbook de
-- abordagem específico da Central de Prospecção da Pascoal, client-side, domínio diferente —
-- mesma palavra em português, sem relação técnica, tabelas/tipos totalmente separados).
-- ---------------------------------------------------------------------------
create table public.strategies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  target_audience text,
  segment text,
  location text,
  icp text,
  qualification_criteria text,
  offer text,
  sales_pitch text,
  prospecting_channel text,
  prospecting_goal integer,
  meetings_goal integer,
  closing_goal integer,
  revenue_goal numeric(12, 2),
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- leads — generalização do desenho já validado em `lib/prospeccao/types.ts` (`Oficina` →
-- lead genérico, como a "Auditoria Procreating OS" já recomendava pra esta fase). `stage_id` não
-- tem DEFAULT de banco (Postgres não aceita subquery em DEFAULT) — todo `createLead`
-- (`lib/comercial/actions.ts`) resolve o estágio inicial (`is_won = false and is_lost = false`,
-- menor `sort_order`) e passa explícito.
-- ---------------------------------------------------------------------------
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text,
  role_title text,
  whatsapp text,
  email text,
  source text,
  strategy_id uuid references public.strategies (id),
  potential_value numeric(12, 2),
  owner_id uuid references auth.users (id),
  stage_id uuid not null references public.pipeline_stages (id),
  last_contact_at timestamptz,
  next_contact_at timestamptz,
  notes text,
  -- setado só na conversão (ver close_lead_and_create_client, fim deste arquivo) — lead
  -- convertido nunca é reaberto/reutilizado por outro cliente.
  client_id uuid references public.clients (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index leads_stage_id_idx on public.leads (stage_id);
create index leads_strategy_id_idx on public.leads (strategy_id);
create index leads_client_id_idx on public.leads (client_id);

-- ---------------------------------------------------------------------------
-- contracts / contract_scope_items — Etapas 2 e 3 do modal de onboarding. Campos suficientes pra
-- um gerador de documento (fase futura, não implementada agora) montar o contrato sem precisar de
-- coluna nova; dados da própria Procreating (razão social etc.) ficam numa constante central de
-- configuração quando esse gerador existir, nunca hardcoded num componente.
-- ---------------------------------------------------------------------------
create table public.contracts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  type text not null check (type in ('pontual', 'recorrente')),
  status text not null default 'ativo' check (status in ('ativo', 'encerrado', 'cancelado')),
  start_date date not null,
  end_date date,
  -- recorrente
  monthly_value numeric(12, 2),
  due_day integer check (due_day between 1 and 31),
  auto_renew boolean not null default false,
  -- pontual
  total_value numeric(12, 2),
  payment_terms text,
  special_conditions text,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index contracts_client_id_idx on public.contracts (client_id);

create table public.contract_scope_items (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts (id) on delete cascade,
  service text not null,
  quantity integer,
  frequency text,
  deadline text,
  notes text,
  created_at timestamptz not null default now()
);

create index contract_scope_items_contract_id_idx on public.contract_scope_items (contract_id);

-- ---------------------------------------------------------------------------
-- client_onboarding — captura das Etapas 1 (dados do cliente) e 4 (informações estratégicas) do
-- modal. Contatos (Etapa 1) viram linhas em `client_contacts` (tabela própria, abaixo) em vez de
-- um array aqui dentro — evita duplicar o mesmo dado em dois formatos.
-- ---------------------------------------------------------------------------
create table public.client_onboarding (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  legal_name text,
  trade_name text,
  cnpj text,
  cpf text,
  address text,
  billing_info text,
  objective text,
  target_audience text,
  offer text,
  positioning text,
  channels text,
  goals text,
  commercial_notes text,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now()
);

create index client_onboarding_client_id_idx on public.client_onboarding (client_id);

-- ---------------------------------------------------------------------------
-- client_contacts — pessoas de contato do cliente. Tabela própria em vez de inchar `clients` com
-- campos repetíveis (`contact_1_name`, `contact_2_name`, ...).
-- ---------------------------------------------------------------------------
create table public.client_contacts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  name text not null,
  role_title text,
  email text,
  whatsapp text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index client_contacts_client_id_idx on public.client_contacts (client_id);

-- ---------------------------------------------------------------------------
-- onboarding_tasks — mínimo pedido pra Etapa 5 não ficar só no papel: 3-4 tarefas padrão criadas
-- junto com o cliente (ver RPC abaixo). Não é um sistema de tarefas geral (isso é fora de escopo
-- desta fase) — só o suficiente pra dar sequência real ao onboarding recém-criado.
-- ---------------------------------------------------------------------------
create table public.onboarding_tasks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  title text not null,
  status text not null default 'pending' check (status in ('pending', 'done')),
  created_at timestamptz not null default now()
);

create index onboarding_tasks_client_id_idx on public.onboarding_tasks (client_id);

-- ---------------------------------------------------------------------------
-- revenue / expenses — Financeiro. `status` tem 4 valores de propósito (não um boolean
-- pago/não-pago) — é o que um fluxo de cobrança futuro (fora de escopo agora) vai precisar
-- diferenciar sem migração de dado. `revenue` nasce derivada de `contracts` (ver RPC abaixo);
-- `expenses` é cadastro manual, sem integração bancária.
-- ---------------------------------------------------------------------------
create table public.revenue (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients (id) on delete cascade,
  contract_id uuid references public.contracts (id) on delete cascade,
  description text not null,
  amount numeric(12, 2) not null,
  due_date date not null,
  status text not null default 'pendente' check (status in ('pendente', 'pago', 'atrasado', 'cancelado')),
  paid_at date,
  created_at timestamptz not null default now()
);

create index revenue_client_id_idx on public.revenue (client_id);
create index revenue_due_date_idx on public.revenue (due_date);
create index revenue_status_idx on public.revenue (status);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  description text not null,
  amount numeric(12, 2) not null,
  due_date date not null,
  status text not null default 'pendente' check (status in ('pendente', 'pago', 'atrasado', 'cancelado')),
  paid_at date,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now()
);

create index expenses_due_date_idx on public.expenses (due_date);
create index expenses_status_idx on public.expenses (status);

-- ---------------------------------------------------------------------------
-- clients ganha strategy_id — a estratégia de origem continua recebendo crédito pela receita do
-- cliente depois da conversão (usado por `lib/comercial/funnel.ts` pro "ticket médio e receita
-- total gerada por estratégia").
-- ---------------------------------------------------------------------------
alter table public.clients
  add column strategy_id uuid references public.strategies (id);

-- ---------------------------------------------------------------------------
-- close_lead_and_create_client — a transação real da Etapa 5 do onboarding (fechamento de
-- negócio). SECURITY DEFINER com search_path fixo: garante que os 7 inserts + 1 update abaixo
-- rodam atômicos (tudo ou nada) mesmo que policies de RLS de alguma tabela envolvida fiquem mais
-- restritas no futuro — a função em si já foi revisada e autorizada, não deveria voltar a exigir
-- policy nova por tabela toda vez que RBAC apertar. `auth.uid()` dentro da função continua
-- resolvendo pro usuário que chamou via `supabase.rpc(...)` (não é afetado por SECURITY DEFINER —
-- lê o JWT da requisição, não muda com o dono da função).
--
-- p_payload (jsonb) — shape que `lib/onboarding/actions.ts` monta a partir do WizardData:
-- {
--   "client": { "name": text },
--   "onboarding": { "legal_name", "trade_name", "cnpj", "cpf", "address", "billing_info",
--                    "objective", "target_audience", "offer", "positioning", "channels", "goals",
--                    "commercial_notes" },
--   "contacts": [ { "name", "role_title", "email", "whatsapp", "is_primary" }, ... ],
--   "contract": { "type": "pontual"|"recorrente", "start_date", "end_date", "monthly_value",
--                 "total_value", "due_day", "payment_terms", "auto_renew", "special_conditions" },
--   "scope_items": [ { "service", "quantity", "frequency", "deadline", "notes" }, ... ]
-- }
-- ---------------------------------------------------------------------------
create or replace function public.close_lead_and_create_client(p_lead_id uuid, p_payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_lead public.leads;
  v_won_stage_id uuid;
  v_client_id uuid;
  v_contract_id uuid;
  v_base_slug text;
  v_slug text;
  v_suffix int := 1;
  v_contract_type text;
  v_start date;
  v_end date;
  v_due_day int;
  v_monthly_value numeric(12, 2);
  v_total_value numeric(12, 2);
  v_month timestamp;
  v_contact jsonb;
  v_scope_item jsonb;
begin
  select * into v_lead from public.leads where id = p_lead_id;
  if not found then
    raise exception 'Lead % não encontrado', p_lead_id;
  end if;
  if v_lead.client_id is not null then
    raise exception 'Lead % já foi convertido no cliente %', p_lead_id, v_lead.client_id;
  end if;

  select id into v_won_stage_id from public.pipeline_stages where is_won = true order by sort_order limit 1;
  if v_won_stage_id is null then
    raise exception 'Nenhum estágio marcado como is_won em pipeline_stages';
  end if;

  -- 1. clients — slug único derivado do nome, mesmo padrão de `lib/admin/format.ts` (slugify +
  -- sufixo numérico em caso de colisão), só que em SQL porque roda dentro da transação.
  v_base_slug := trim(both '-' from regexp_replace(lower(coalesce(nullif(trim(p_payload -> 'client' ->> 'name'), ''), v_lead.company_name)), '[^a-z0-9]+', '-', 'g'));
  if v_base_slug = '' then
    v_base_slug := 'cliente';
  end if;
  v_slug := v_base_slug;
  while exists (select 1 from public.clients where slug = v_slug) loop
    v_suffix := v_suffix + 1;
    v_slug := v_base_slug || '-' || v_suffix;
  end loop;

  insert into public.clients (name, slug, status, document, segment, strategy_id, created_by)
  values (
    coalesce(nullif(trim(p_payload -> 'client' ->> 'name'), ''), v_lead.company_name),
    v_slug,
    'ativo',
    coalesce(p_payload -> 'onboarding' ->> 'cnpj', p_payload -> 'onboarding' ->> 'cpf'),
    null,
    v_lead.strategy_id,
    auth.uid()
  )
  returning id into v_client_id;

  -- 2. client_onboarding (Etapas 1 + 4)
  insert into public.client_onboarding (
    client_id, legal_name, trade_name, cnpj, cpf, address, billing_info,
    objective, target_audience, offer, positioning, channels, goals, commercial_notes, created_by
  )
  values (
    v_client_id,
    p_payload -> 'onboarding' ->> 'legal_name',
    p_payload -> 'onboarding' ->> 'trade_name',
    p_payload -> 'onboarding' ->> 'cnpj',
    p_payload -> 'onboarding' ->> 'cpf',
    p_payload -> 'onboarding' ->> 'address',
    p_payload -> 'onboarding' ->> 'billing_info',
    p_payload -> 'onboarding' ->> 'objective',
    p_payload -> 'onboarding' ->> 'target_audience',
    p_payload -> 'onboarding' ->> 'offer',
    p_payload -> 'onboarding' ->> 'positioning',
    p_payload -> 'onboarding' ->> 'channels',
    p_payload -> 'onboarding' ->> 'goals',
    p_payload -> 'onboarding' ->> 'commercial_notes',
    auth.uid()
  );

  -- 3. client_contacts
  for v_contact in select jsonb_array_elements(coalesce(p_payload -> 'contacts', '[]'::jsonb))
  loop
    insert into public.client_contacts (client_id, name, role_title, email, whatsapp, is_primary)
    values (
      v_client_id,
      v_contact ->> 'name',
      v_contact ->> 'role_title',
      v_contact ->> 'email',
      v_contact ->> 'whatsapp',
      coalesce((v_contact ->> 'is_primary')::boolean, false)
    );
  end loop;

  -- 4. contracts (Etapa 2)
  v_contract_type := p_payload -> 'contract' ->> 'type';
  v_start := (p_payload -> 'contract' ->> 'start_date')::date;
  v_end := nullif(p_payload -> 'contract' ->> 'end_date', '')::date;
  v_due_day := coalesce((p_payload -> 'contract' ->> 'due_day')::int, 1);
  v_monthly_value := (p_payload -> 'contract' ->> 'monthly_value')::numeric;
  v_total_value := (p_payload -> 'contract' ->> 'total_value')::numeric;

  insert into public.contracts (
    client_id, type, status, start_date, end_date, monthly_value, due_day, auto_renew,
    total_value, payment_terms, special_conditions, created_by
  )
  values (
    v_client_id, v_contract_type, 'ativo', v_start, v_end, v_monthly_value, v_due_day,
    coalesce((p_payload -> 'contract' ->> 'auto_renew')::boolean, false),
    v_total_value, p_payload -> 'contract' ->> 'payment_terms', p_payload -> 'contract' ->> 'special_conditions',
    auth.uid()
  )
  returning id into v_contract_id;

  -- 5. contract_scope_items (Etapa 3)
  for v_scope_item in select jsonb_array_elements(coalesce(p_payload -> 'scope_items', '[]'::jsonb))
  loop
    insert into public.contract_scope_items (contract_id, service, quantity, frequency, deadline, notes)
    values (
      v_contract_id,
      v_scope_item ->> 'service',
      nullif(v_scope_item ->> 'quantity', '')::int,
      v_scope_item ->> 'frequency',
      v_scope_item ->> 'deadline',
      v_scope_item ->> 'notes'
    );
  end loop;

  -- 6. revenue — derivada do contrato. Recorrente com end_date conhecido: uma linha por mês
  -- (vencimento = due_day de cada mês do intervalo). Recorrente sem end_date (contrato aberto):
  -- só a primeira parcela — gerar um horizonte arbitrário seria inventar dado; a extensão mês a
  -- mês fica pra um job futuro (cobrança automática, fora de escopo desta fase). Pontual: uma
  -- linha só.
  if v_contract_type = 'recorrente' then
    if v_end is not null then
      for v_month in select generate_series(date_trunc('month', v_start::timestamp), date_trunc('month', v_end::timestamp), interval '1 month')
      loop
        insert into public.revenue (client_id, contract_id, description, amount, due_date, status)
        values (
          v_client_id, v_contract_id,
          'Mensalidade ' || to_char(v_month, 'MM/YYYY'),
          v_monthly_value,
          (v_month + ((v_due_day - 1) || ' days')::interval)::date,
          'pendente'
        );
      end loop;
    else
      insert into public.revenue (client_id, contract_id, description, amount, due_date, status)
      values (
        v_client_id, v_contract_id,
        'Mensalidade ' || to_char(v_start, 'MM/YYYY'),
        v_monthly_value,
        (date_trunc('month', v_start::timestamp) + ((v_due_day - 1) || ' days')::interval)::date,
        'pendente'
      );
    end if;
  elsif v_contract_type = 'pontual' then
    insert into public.revenue (client_id, contract_id, description, amount, due_date, status)
    values (v_client_id, v_contract_id, 'Pagamento único', v_total_value, coalesce(v_end, v_start), 'pendente');
  end if;

  -- 7. onboarding_tasks — mínimo padrão, não um sistema de tarefas geral.
  insert into public.onboarding_tasks (client_id, title)
  values
    (v_client_id, 'Enviar contrato assinado'),
    (v_client_id, 'Agendar reunião de kickoff'),
    (v_client_id, 'Configurar acesso do cliente');

  -- 8. lead — marca convertido, some do Kanban de leads abertos.
  update public.leads set client_id = v_client_id, stage_id = v_won_stage_id, updated_at = now() where id = p_lead_id;

  -- 9. events — trilha de auditoria nos dois lados da conversão.
  insert into public.events (entity_type, entity_id, actor_id, type, metadata)
  values
    ('lead', p_lead_id, auth.uid(), 'lead_converted', jsonb_build_object('client_id', v_client_id)),
    ('client', v_client_id, auth.uid(), 'client_created', jsonb_build_object('lead_id', p_lead_id));

  return v_client_id;
end;
$$;

-- RLS não se aplica dentro de uma função SECURITY DEFINER da mesma forma que numa query direta
-- via PostgREST — mas a permissão pra CHAMAR a função (via `supabase.rpc(...)`) precisa ser
-- concedida explicitamente ao role `authenticated`, senão o RPC nem é aceito.
grant execute on function public.close_lead_and_create_client(uuid, jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- RLS — mesma política coarse da Fase 1 pra `clients`/`events` (ferramenta interna de dois
-- sócios, sem RBAC granular por módulo ainda; revisitar quando RBAC existir de verdade, Fase 2+
-- do roadmap original). `pipeline_stages` é catálogo, não dado do usuário — leitura livre pra
-- autenticado, escrita também (é configurável, não fixo).
-- ---------------------------------------------------------------------------
alter table public.pipeline_stages enable row level security;
alter table public.strategies enable row level security;
alter table public.leads enable row level security;
alter table public.contracts enable row level security;
alter table public.contract_scope_items enable row level security;
alter table public.client_onboarding enable row level security;
alter table public.client_contacts enable row level security;
alter table public.onboarding_tasks enable row level security;
alter table public.revenue enable row level security;
alter table public.expenses enable row level security;

create policy pipeline_stages_all_authenticated on public.pipeline_stages for all to authenticated using (true) with check (true);
create policy strategies_all_authenticated on public.strategies for all to authenticated using (true) with check (true);
create policy leads_all_authenticated on public.leads for all to authenticated using (true) with check (true);
create policy contracts_all_authenticated on public.contracts for all to authenticated using (true) with check (true);
create policy contract_scope_items_all_authenticated on public.contract_scope_items for all to authenticated using (true) with check (true);
create policy client_onboarding_all_authenticated on public.client_onboarding for all to authenticated using (true) with check (true);
create policy client_contacts_all_authenticated on public.client_contacts for all to authenticated using (true) with check (true);
create policy onboarding_tasks_all_authenticated on public.onboarding_tasks for all to authenticated using (true) with check (true);
create policy revenue_all_authenticated on public.revenue for all to authenticated using (true) with check (true);
create policy expenses_all_authenticated on public.expenses for all to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------------
-- Seed — as 9 etapas do funil comercial (Lead é a etapa de entrada; Fechado/Perdido são
-- terminais). Cor é uma chave livre (nome consumido por `lib/comercial/stage-colors.ts` do lado
-- da UI — mesmo espírito de `STAGE_DOT_CLASSES` em `lib/prospeccao/stages.ts`, não um hex cru).
-- ---------------------------------------------------------------------------
insert into public.pipeline_stages (key, label, color, sort_order, is_won, is_lost) values
  ('lead', 'Lead', 'slate', 1, false, false),
  ('contato_realizado', 'Contato realizado', 'sky', 2, false, false),
  ('respondeu', 'Respondeu', 'violet', 3, false, false),
  ('reuniao_agendada', 'Reunião agendada', 'amber', 4, false, false),
  ('reuniao_realizada', 'Reunião realizada', 'amber', 5, false, false),
  ('proposta_enviada', 'Proposta enviada', 'orange', 6, false, false),
  ('negociacao', 'Negociação', 'orange', 7, false, false),
  ('fechado', 'Fechado', 'emerald', 8, true, false),
  ('perdido', 'Perdido', 'red', 9, false, true);
