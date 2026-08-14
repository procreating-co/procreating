-- Workspace gamificado: XP, nível, streak, conquistas, timer de foco (/meu-dia).
-- Nenhuma tabela de tempo/XP/streak/conquista existia até aqui — só `tasks` (simples, sem
-- prioridade). Schema novo, mesmo padrão de sempre: RLS coarse (`for all to authenticated using
-- (true) with check (true)`), funções `security definer` (`set search_path = public, pg_temp`,
-- mesmo padrão de `close_lead_and_create_client`) pra qualquer ação que precise tocar mais de uma
-- tabela atomicamente.
--
-- Regra central: XP só nasce de comportamento real (tarefa concluída, sessão de foco fechada),
-- nunca de um gatilho fabricado (login, etc.). O índice único em `xp_transactions` garante, no
-- nível do banco, que marcar/desmarcar/marcar uma tarefa de novo (ou fechar uma sessão) nunca
-- concede XP duas vezes pela mesma origem.

create table public.user_stats (
  user_id uuid primary key references auth.users (id) on delete cascade,
  total_xp integer not null default 0,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_activity_date date,
  updated_at timestamptz not null default now()
);

create table public.xp_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id),
  amount integer not null,
  reason text not null check (reason in ('task_completed', 'focus_session')),
  source_type text not null check (source_type in ('task', 'session')),
  source_id uuid not null,
  created_at timestamptz not null default now()
);

-- guarda contra XP duplicado no nível do banco, não só na aplicação.
create unique index xp_transactions_source_unique on public.xp_transactions (source_type, source_id, reason);
create index xp_transactions_user_created_idx on public.xp_transactions (user_id, created_at);

create table public.achievement_definitions (
  key text primary key,
  title text not null,
  description text not null,
  criteria_type text not null check (criteria_type in ('task_count', 'streak_days', 'focus_minutes', 'level')),
  criteria_value integer not null,
  sort_order integer not null default 0
);

create table public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id),
  achievement_key text not null references public.achievement_definitions (key),
  unlocked_at timestamptz not null default now(),
  unique (user_id, achievement_key)
);

create table public.work_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id),
  task_id uuid references public.tasks (id),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_seconds integer,
  created_at timestamptz not null default now()
);

-- uma sessão ativa por usuário (`ended_at is null`) — índice parcial, consultado no
-- `startFocusSessionAction` antes de inserir uma nova.
create index work_sessions_active_idx on public.work_sessions (user_id) where ended_at is null;

alter table public.user_stats enable row level security;
alter table public.xp_transactions enable row level security;
alter table public.achievement_definitions enable row level security;
alter table public.user_achievements enable row level security;
alter table public.work_sessions enable row level security;

create policy user_stats_all_authenticated on public.user_stats for all to authenticated using (true) with check (true);
create policy xp_transactions_all_authenticated on public.xp_transactions for all to authenticated using (true) with check (true);
create policy achievement_definitions_all_authenticated on public.achievement_definitions for all to authenticated using (true) with check (true);
create policy user_achievements_all_authenticated on public.user_achievements for all to authenticated using (true) with check (true);
create policy work_sessions_all_authenticated on public.work_sessions for all to authenticated using (true) with check (true);

-- Catálogo fixo de conquistas — conteúdo de produto (mesma categoria de seed que
-- `pipeline_stages`/`financial_rules` já usam), não dado de negócio. Critério avaliado sempre
-- contra dado real (`check_achievements`, abaixo) — nunca marcado manualmente.
insert into public.achievement_definitions (key, title, description, criteria_type, criteria_value, sort_order) values
  ('first_task', 'Primeira Tarefa', 'Complete sua primeira tarefa.', 'task_count', 1, 10),
  ('tasks_10', 'Produtivo', 'Complete 10 tarefas.', 'task_count', 10, 20),
  ('tasks_50', 'Consistente', 'Complete 50 tarefas.', 'task_count', 50, 30),
  ('tasks_100', 'Centurião', 'Complete 100 tarefas.', 'task_count', 100, 40),
  ('streak_3', 'No Ritmo', 'Mantenha uma sequência de 3 dias.', 'streak_days', 3, 50),
  ('streak_7', 'Uma Semana Inteira', 'Mantenha uma sequência de 7 dias.', 'streak_days', 7, 60),
  ('streak_30', 'Um Mês Inteiro', 'Mantenha uma sequência de 30 dias.', 'streak_days', 30, 70),
  ('focus_10h', 'Foco Total', 'Registre 10 horas de foco.', 'focus_minutes', 600, 80),
  ('level_5', 'Nível 5', 'Alcance o nível 5.', 'level', 5, 90),
  ('level_10', 'Nível 10', 'Alcance o nível 10.', 'level', 10, 100);

-- Concede XP e recalcula streak/nível — chamada só depois que o chamador já confirmou (via o
-- índice único de xp_transactions) que esta é a primeira vez que esta origem concede XP.
-- Streak: dias consecutivos com pelo menos 1 evento de XP, fuso America/Sao_Paulo (mesmo padrão
-- pt-BR do resto do produto). Mesmo dia de novo => sem mudança (não conta 2x). Buraco > 1 dia =>
-- reseta pra 1.
create or replace function public.award_xp(p_user_id uuid, p_amount integer)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_today date := (now() at time zone 'America/Sao_Paulo')::date;
  v_last date;
  v_current integer;
  v_longest integer;
begin
  insert into public.user_stats (user_id, total_xp, current_streak, longest_streak, last_activity_date)
    values (p_user_id, p_amount, 1, 1, v_today)
  on conflict (user_id) do update set
    total_xp = public.user_stats.total_xp + excluded.total_xp,
    updated_at = now();

  select last_activity_date, current_streak, longest_streak
    into v_last, v_current, v_longest
    from public.user_stats
    where user_id = p_user_id;

  if v_last is null or v_last < v_today - 1 then
    v_current := 1;
  elsif v_last = v_today - 1 then
    v_current := v_current + 1;
  end if;
  -- v_last = v_today: já contado hoje, v_current não muda.

  v_longest := greatest(v_longest, v_current);

  update public.user_stats
    set current_streak = v_current, longest_streak = v_longest, last_activity_date = v_today, updated_at = now()
    where user_id = p_user_id;
end;
$$;

-- Avalia o catálogo contra o estado real do usuário e desbloqueia o que faltar. `level` usa a
-- mesma fórmula de `lib/gamification/level.ts` (nível = xp_total / 100 + 1) — mudar uma exige
-- mudar a outra. `streak_days` usa `longest_streak` (uma sequência já alcançada conta pra sempre,
-- mesmo que a atual tenha zerado depois).
create or replace function public.check_achievements(p_user_id uuid)
returns setof text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_total_xp integer;
  v_streak_days integer;
  v_level integer;
  v_task_count integer;
  v_focus_minutes integer;
  v_key text;
begin
  select coalesce(total_xp, 0), coalesce(longest_streak, 0)
    into v_total_xp, v_streak_days
    from public.user_stats
    where user_id = p_user_id;

  v_level := floor(coalesce(v_total_xp, 0) / 100) + 1;

  select count(*) into v_task_count
    from public.xp_transactions
    where user_id = p_user_id and reason = 'task_completed';

  select coalesce(sum(duration_seconds), 0) / 60 into v_focus_minutes
    from public.work_sessions
    where user_id = p_user_id and ended_at is not null;

  for v_key in
    select ad.key
    from public.achievement_definitions ad
    where not exists (
      select 1 from public.user_achievements ua
      where ua.user_id = p_user_id and ua.achievement_key = ad.key
    )
    and (
      (ad.criteria_type = 'task_count' and v_task_count >= ad.criteria_value)
      or (ad.criteria_type = 'streak_days' and v_streak_days >= ad.criteria_value)
      or (ad.criteria_type = 'focus_minutes' and v_focus_minutes >= ad.criteria_value)
      or (ad.criteria_type = 'level' and v_level >= ad.criteria_value)
    )
  loop
    insert into public.user_achievements (user_id, achievement_key)
      values (p_user_id, v_key)
    on conflict (user_id, achievement_key) do nothing;
    return next v_key;
  end loop;

  return;
end;
$$;

-- Marca a tarefa como concluída + concede XP (+10, uma vez por tarefa) + streak + conquistas,
-- tudo atômico. Chamada por `completeTaskAction` (`lib/gamification/actions.ts`).
create or replace function public.complete_task_and_award_xp(p_task_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_inserted uuid;
  v_unlocked text[] := array[]::text[];
  v_key text;
  v_stats public.user_stats;
begin
  if v_user_id is null then
    raise exception 'Usuário não autenticado';
  end if;

  if not exists (select 1 from public.tasks where id = p_task_id) then
    raise exception 'Tarefa % não encontrada', p_task_id;
  end if;

  update public.tasks set status = 'done', updated_at = now() where id = p_task_id;

  insert into public.xp_transactions (user_id, amount, reason, source_type, source_id)
    values (v_user_id, 10, 'task_completed', 'task', p_task_id)
  on conflict (source_type, source_id, reason) do nothing
  returning id into v_inserted;

  if v_inserted is not null then
    perform public.award_xp(v_user_id, 10);
    for v_key in select public.check_achievements(v_user_id) loop
      v_unlocked := array_append(v_unlocked, v_key);
    end loop;
  end if;

  select * into v_stats from public.user_stats where user_id = v_user_id;

  return jsonb_build_object(
    'xpAwarded', v_inserted is not null,
    'totalXp', coalesce(v_stats.total_xp, 0),
    'currentStreak', coalesce(v_stats.current_streak, 0),
    'longestStreak', coalesce(v_stats.longest_streak, 0),
    'unlocked', to_jsonb(v_unlocked)
  );
end;
$$;

-- Fecha a sessão de foco (`ended_at`, `duration_seconds`) + concede XP se >= 10min (+5, uma vez
-- por sessão) + streak + conquistas. Chamada por `stopFocusSessionAction`.
create or replace function public.stop_focus_session(p_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_session public.work_sessions;
  v_inserted uuid;
  v_unlocked text[] := array[]::text[];
  v_key text;
  v_stats public.user_stats;
  v_xp_awarded boolean := false;
begin
  if v_user_id is null then
    raise exception 'Usuário não autenticado';
  end if;

  update public.work_sessions
    set ended_at = now(),
        duration_seconds = extract(epoch from (now() - started_at))::integer
    where id = p_session_id and user_id = v_user_id and ended_at is null
    returning * into v_session;

  if not found then
    raise exception 'Sessão % não encontrada ou já encerrada', p_session_id;
  end if;

  if v_session.duration_seconds >= 600 then
    insert into public.xp_transactions (user_id, amount, reason, source_type, source_id)
      values (v_user_id, 5, 'focus_session', 'session', p_session_id)
    on conflict (source_type, source_id, reason) do nothing
    returning id into v_inserted;

    if v_inserted is not null then
      v_xp_awarded := true;
      perform public.award_xp(v_user_id, 5);
    end if;
  end if;

  for v_key in select public.check_achievements(v_user_id) loop
    v_unlocked := array_append(v_unlocked, v_key);
  end loop;

  select * into v_stats from public.user_stats where user_id = v_user_id;

  return jsonb_build_object(
    'durationSeconds', v_session.duration_seconds,
    'xpAwarded', v_xp_awarded,
    'totalXp', coalesce(v_stats.total_xp, 0),
    'currentStreak', coalesce(v_stats.current_streak, 0),
    'longestStreak', coalesce(v_stats.longest_streak, 0),
    'unlocked', to_jsonb(v_unlocked)
  );
end;
$$;

grant execute on function public.award_xp(uuid, integer) to authenticated;
grant execute on function public.check_achievements(uuid) to authenticated;
grant execute on function public.complete_task_and_award_xp(uuid) to authenticated;
grant execute on function public.stop_focus_session(uuid) to authenticated;
