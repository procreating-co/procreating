-- Task Intelligence, parte 2 — Strategies (§13 do pedido original). NOME deliberadamente
-- `task_strategies`/`task_strategy_items`, não `strategies` — essa tabela já existe
-- (`20260813010000_comercial_financeiro_onboarding.sql`) e é um conceito completamente
-- diferente: posicionamento comercial (ICP, oferta, canal de prospecção), não um molde de
-- checklist de tarefas. Mesmo cuidado já documentado no projeto pra `production_projects` vs
-- `projects` do Page-Builder — nomes parecidos, domínios que nunca devem se confundir.
--
-- Uma `task_strategy` é um MOLDE (ex.: "Lançamento de cliente") — nunca fica "aplicada" sozinha;
-- `applyStrategyAction` (camada de app) cria um `task_group` + `tasks` reais a partir dela,
-- exatamente como `parseTaskBatch` já faz pra um lote colado — mesma forma final, origem
-- diferente (texto colado vs. molde salvo). Fundação simples de propósito (§13: "não
-- transformar isso em um sistema excessivamente complexo") — dependência é só uma ordem
-- sequencial opcional (`depends_on_item_id`), não uma máquina de estados de bloqueio.
create table public.task_strategies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.task_strategies enable row level security;
create policy task_strategies_all_authenticated on public.task_strategies for all to authenticated using (true) with check (true);

create table public.task_strategy_items (
  id uuid primary key default gen_random_uuid(),
  strategy_id uuid not null references public.task_strategies (id) on delete cascade,
  title text not null,
  order_index integer not null,
  estimated_minutes integer,
  -- Sequencial e opcional — "depende do item anterior" na ordem visual do molde, não um grafo
  -- geral. Suficiente pro caso real do pedido (Roteiro → Aprovação → Captação → Edição →
  -- Revisão → Publicação) sem construir uma máquina de dependências completa.
  depends_on_item_id uuid references public.task_strategy_items (id) on delete set null,
  default_assignee_id uuid references auth.users (id),
  created_at timestamptz not null default now()
);

create index task_strategy_items_strategy_id_idx on public.task_strategy_items (strategy_id);

alter table public.task_strategy_items enable row level security;
create policy task_strategy_items_all_authenticated on public.task_strategy_items for all to authenticated using (true) with check (true);
