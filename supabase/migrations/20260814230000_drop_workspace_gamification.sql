-- Reverte por completo o Workspace gamificado (migration 20260814210000) — nunca foi pedido de
-- verdade, contraria o roadmap real (gamificação é Fase 6 futura, redesenhada do zero quando
-- chegar a hora). Sem dado real nas tabelas (só dado de teste, já limpo manualmente nas duas
-- rodadas de deploy anteriores) — drop seguro, sem perda de informação real.

drop function if exists public.stop_focus_session(uuid);
drop function if exists public.complete_task_and_award_xp(uuid);
drop function if exists public.check_achievements(uuid);
drop function if exists public.award_xp(uuid, integer);

drop table if exists public.user_achievements;
drop table if exists public.xp_transactions;
drop table if exists public.work_sessions;
drop table if exists public.achievement_definitions;
drop table if exists public.user_stats;
