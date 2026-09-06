-- Experiences (brief "Procreating Experiences") — Fase 5: tracking granular. Peça genuinamente
-- nova (§9 do brief) — `proposal_versions`/`view_count`/`events` (genérico) já existiam e
-- continuam existindo como estão; esta tabela é a única estrutura nova de todo o brief.
--
-- Uma tabela só (não 5) — `event_type` discrimina o que aconteceu; `section_type`/`value` ficam
-- nulos quando não fazem sentido pro tipo (`value` é % de scroll, % de vídeo assistido, etc.,
-- unidade por `event_type`, nunca um significado fixo).
create table public.proposal_events (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals (id) on delete cascade,
  -- Cookie anônimo de 1ª parte (`pc_vid`), sem PII — mesmo princípio já usado nas tabelas legadas
  -- `analytics`/`downloads` (nunca usadas de verdade, mas o comentário original já documentava
  -- essa regra: "anonymous hash, not PII").
  visitor_id text not null,
  -- 1 por carregamento de página (não persiste entre visitas) — distingue "voltou à mesma
  -- página" (mesmo visitor_id, session_id diferente) de "ficou interagindo na mesma visita"
  -- (mesmo session_id, múltiplos eventos).
  session_id uuid not null,
  event_type text not null check (event_type in (
    'section_view', 'scroll_depth', 'cta_click', 'video_play', 'video_progress', 'video_complete'
  )),
  section_type text,
  value numeric,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index proposal_events_proposal_id_idx on public.proposal_events (proposal_id);
create index proposal_events_created_at_idx on public.proposal_events (created_at);

alter table public.proposal_events enable row level security;
-- Só leitura, só staff — mesma função `is_active_staff()` já usada pelo Client Portal
-- (`20260824010000_client_portal_foundation.sql`). ZERO policy de escrita pra `authenticated`/
-- `anon` — toda escrita passa por `record_proposal_event` (`SECURITY DEFINER` abaixo), mesmo
-- padrão das 3 funções públicas já existentes do sistema de Propostas.
create policy proposal_events_staff_read on public.proposal_events
  for select to authenticated using (public.is_active_staff());

create function public.record_proposal_event(
  p_slug text,
  p_visitor_id text,
  p_session_id uuid,
  p_event_type text,
  p_section_type text default null,
  p_value numeric default null,
  p_metadata jsonb default '{}'::jsonb
) returns void
language plpgsql security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  v_proposal_id uuid;
begin
  -- Mesmo filtro de status de `get_public_proposal`/`record_proposal_view` — proposta em
  -- draft/archived/cancelled nunca grava evento (no-op silencioso, nunca erro pro visitante).
  select id into v_proposal_id from public.proposals
  where slug = p_slug and status not in ('draft', 'archived', 'cancelled');

  if v_proposal_id is null then
    return;
  end if;

  insert into public.proposal_events (proposal_id, visitor_id, session_id, event_type, section_type, value, metadata)
  values (v_proposal_id, p_visitor_id, p_session_id, p_event_type, p_section_type, p_value, p_metadata);
end;
$$;
revoke all on function public.record_proposal_event(text, text, uuid, text, text, numeric, jsonb) from public;
grant execute on function public.record_proposal_event(text, text, uuid, text, text, numeric, jsonb) to anon, authenticated;
