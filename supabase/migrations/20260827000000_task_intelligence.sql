-- Task Intelligence — evolução do sistema de Tasks já existente (`public.tasks`, migration
-- `20260814000000_navigation_simulation_financeiro.sql`). NÃO cria um segundo sistema de
-- tarefas: só estende a tabela real com o que faltava (cliente, estimativa, prioridade, posição
-- manual, agrupamento) e adiciona as 2 entidades novas que o conceito pede — Task Group e Focus
-- Session — reaproveitando tudo o mais (RLS `tasks_all_authenticated` já existente, `events` já
-- existente para auditoria, `clients`/`auth.users` já existentes para as FKs).
--
-- `time_blocks` entra como fundação de schema (Fase 9 do plano) — sem UI de agendamento/conflito
-- nesta rodada (não implementada, ver relatório), mas a tabela já existe pra não exigir migration
-- nova quando essa fase for construída.
--
-- Auditado antes de escrever isto: `Work Time`, `Horo Timer`, calendário e XP/gamificação NÃO
-- existem neste projeto (gamificação chegou a existir e foi removida —
-- `20260814230000_drop_workspace_gamification.sql`). Não inventados aqui — ver relatório final.

-- ============================================================================
-- 1) task_groups — "Operacional: Elenita, Kawhen, ..." vira um grupo com N tarefas dentro.
-- ============================================================================
create table public.task_groups (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.task_groups enable row level security;
create policy task_groups_all_authenticated on public.task_groups for all to authenticated using (true) with check (true);

-- ============================================================================
-- 2) tasks — colunas novas, tudo opcional (nenhuma tarefa existente quebra).
-- ============================================================================
alter table public.tasks
  add column client_id uuid references public.clients (id) on delete set null,
  add column estimated_minutes integer,
  add column priority text check (priority in ('low', 'medium', 'high')),
  add column position double precision,
  add column group_id uuid references public.task_groups (id) on delete set null;

-- Backfill: posição inicial = ordem de criação, com espaçamento de 1000 — reordenar depois só
-- recalcula o item movido (média entre vizinhos, ou ±1000 na ponta), nunca as outras linhas.
update public.tasks t
set position = sub.rn * 1000
from (select id, row_number() over (order by created_at) as rn from public.tasks) sub
where t.id = sub.id;

alter table public.tasks alter column position set not null;
alter table public.tasks alter column position set default 0;

create index tasks_position_idx on public.tasks (position);
create index tasks_group_id_idx on public.tasks (group_id);
create index tasks_client_id_idx on public.tasks (client_id);

-- ============================================================================
-- 3) time_blocks — fundação de schema (Fase 9), sem UI de agendamento ainda.
-- ============================================================================
create table public.time_blocks (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null,
  status text not null default 'planned' check (status in ('planned', 'done', 'cancelled')),
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now()
);

create index time_blocks_task_id_idx on public.time_blocks (task_id);
create index time_blocks_start_at_idx on public.time_blocks (start_at);

alter table public.time_blocks enable row level security;
create policy time_blocks_all_authenticated on public.time_blocks for all to authenticated using (true) with check (true);

-- ============================================================================
-- 4) focus_sessions — Timer livre + Pomodoro são os dois "modos" da MESMA entidade (nunca
-- propriedade da task — task é "o quê", focus_session é "quanto tempo de verdade").
-- `started_at`/`ended_at` (timestamptz reais, gravados no servidor) são o que faz o timer
-- sobreviver a um refresh: o cliente recalcula o elapsed a partir de `started_at`, nunca depende
-- só de um contador em memória.
-- ============================================================================
create table public.focus_sessions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  time_block_id uuid references public.time_blocks (id) on delete set null,
  user_id uuid not null references auth.users (id),
  mode text not null check (mode in ('pomodoro', 'free')),
  planned_minutes integer,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_seconds integer,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create index focus_sessions_task_id_idx on public.focus_sessions (task_id);
create index focus_sessions_user_id_idx on public.focus_sessions (user_id);
-- Índice parcial: toda leitura de "sessão rodando agora" filtra exatamente por isso
-- (`ended_at is null`) — pequeno, só as sessões abertas entram nele.
create index focus_sessions_running_idx on public.focus_sessions (user_id) where ended_at is null;

alter table public.focus_sessions enable row level security;
create policy focus_sessions_all_authenticated on public.focus_sessions for all to authenticated using (true) with check (true);
