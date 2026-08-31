-- Sistema de Propostas (docs/proposal-system-architecture.md) — Lead → Proposal → Client.
-- Nomes deliberadamente `proposal_*`, sem relação com `templates`/`projects`/`project_versions`
-- do Page-Builder (congelado) nem com `quotes`/`quote_items` (mantidas intocadas — decisão do
-- usuário foi conviver, não substituir). `is_active_staff()` já existe (Fase A do Client Portal)
-- — reaproveitada aqui pra RLS interna, mesmo padrão, sem reinventar.

create table public.proposal_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  accent_color text not null default '#D4AF37',
  section_blueprint jsonb not null default '[]'::jsonb,
  version integer not null default 1,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.proposal_templates enable row level security;
create policy proposal_templates_staff_all on public.proposal_templates
  for all to authenticated using (public.is_active_staff()) with check (public.is_active_staff());

-- `accepted_version_id` referencia `proposal_versions`, criada abaixo — a FK entra depois via
-- ALTER (dependência circular: proposals→proposal_versions→proposals).
create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads (id) on delete set null,
  client_id uuid references public.clients (id) on delete set null,
  template_id uuid not null references public.proposal_templates (id),
  slug text not null unique,
  title text not null,
  status text not null default 'draft' check (status in
    ('draft', 'sent', 'negotiating', 'revision_requested', 'accepted', 'rejected', 'expired', 'archived', 'cancelled')),
  accepted_version_id uuid,
  current_version_number integer not null default 0,
  view_count integer not null default 0,
  first_viewed_at timestamptz,
  last_viewed_at timestamptz,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index proposals_lead_id_idx on public.proposals (lead_id);
create index proposals_client_id_idx on public.proposals (client_id);

alter table public.proposals enable row level security;
create policy proposals_staff_all on public.proposals
  for all to authenticated using (public.is_active_staff()) with check (public.is_active_staff());

-- Snapshot imutável (§14 do plano) — só gravado no "Enviar", nunca editado depois. `accepted_
-- version_id` (em `proposals`) trava qual destas vira definitiva no aceite.
create table public.proposal_versions (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals (id) on delete cascade,
  version_number integer not null,
  snapshot jsonb not null,
  sent_at timestamptz not null default now(),
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  unique (proposal_id, version_number)
);

create index proposal_versions_proposal_id_idx on public.proposal_versions (proposal_id);

alter table public.proposal_versions enable row level security;
create policy proposal_versions_staff_all on public.proposal_versions
  for all to authenticated using (public.is_active_staff()) with check (public.is_active_staff());

alter table public.proposals
  add constraint proposals_accepted_version_id_fkey foreign key (accepted_version_id) references public.proposal_versions (id);

-- Conteúdo "ao vivo" (editável) — `section_type` fechado, não um Block Registry (ver seção 11.3
-- do plano: over-engineering real pro caso de uso, o Page-Builder já cobre esse padrão pra quem
-- precisar dele de verdade). `position` fracionária, mesmo padrão de `tasks.position`
-- (`lib/tasks/position.ts`, Task Intelligence).
create table public.proposal_sections (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals (id) on delete cascade,
  section_type text not null check (section_type in
    ('hero', 'context', 'diagnosis', 'strategy', 'services', 'deliverables', 'investment', 'conditions', 'testimonial', 'cta', 'footer', 'custom')),
  content jsonb not null default '{}'::jsonb,
  position double precision not null,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index proposal_sections_proposal_id_idx on public.proposal_sections (proposal_id);

alter table public.proposal_sections enable row level security;
create policy proposal_sections_staff_all on public.proposal_sections
  for all to authenticated using (public.is_active_staff()) with check (public.is_active_staff());

-- ============================================================================
-- Acesso público (lead, sem login) — 3 funções SECURITY DEFINER, mesmo raciocínio da Fase A do
-- Client Portal: resolvem slug + checam permissão (status) no MESMO passo, nunca dois passos
-- separados. `anon`/`authenticated` PRECISAM poder chamar estas 3 (diferente das funções da
-- Fase A, que eram staff-only) — um lead abrindo o link não tem sessão nenhuma.
-- ============================================================================

create or replace function public.get_public_proposal(p_slug text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_proposal record;
  v_content jsonb;
begin
  select p.id, p.title, p.status, p.accepted_version_id, t.accent_color
  into v_proposal
  from public.proposals p
  join public.proposal_templates t on t.id = p.template_id
  where p.slug = p_slug
    and p.status not in ('draft', 'archived', 'cancelled')
  limit 1;

  if not found then
    return null;
  end if;

  if v_proposal.accepted_version_id is not null then
    select pv.snapshot into v_content from public.proposal_versions pv where pv.id = v_proposal.accepted_version_id;
  else
    select coalesce(jsonb_agg(jsonb_build_object('sectionType', s.section_type, 'content', s.content) order by s.position), '[]'::jsonb)
    into v_content
    from public.proposal_sections s
    where s.proposal_id = v_proposal.id and s.visible = true;
  end if;

  return jsonb_build_object(
    'id', v_proposal.id,
    'title', v_proposal.title,
    'status', v_proposal.status,
    'accentColor', v_proposal.accent_color,
    'sections', coalesce(v_content, '[]'::jsonb)
  );
end;
$$;

revoke all on function public.get_public_proposal(text) from public;
grant execute on function public.get_public_proposal(text) to anon, authenticated;

-- Contador denormalizado (§21/§12 do plano) — ao lado do evento detalhado em `events`, mesmo
-- padrão de `leads.contact_attempts`.
create or replace function public.record_proposal_view(p_slug text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_proposal_id uuid;
begin
  select id into v_proposal_id from public.proposals where slug = p_slug and status not in ('draft', 'archived', 'cancelled');
  if v_proposal_id is null then
    return;
  end if;

  update public.proposals
  set view_count = view_count + 1,
      first_viewed_at = coalesce(first_viewed_at, now()),
      last_viewed_at = now()
  where id = v_proposal_id;

  insert into public.events (entity_type, entity_id, actor_id, type, metadata)
  values ('proposal', v_proposal_id, null, 'proposal.viewed', '{}'::jsonb);
end;
$$;

revoke all on function public.record_proposal_view(text) from public;
grant execute on function public.record_proposal_view(text) to anon, authenticated;

-- Aceitar/recusar pela página pública (§15.4 do plano) — sem login. `p_response` validado por
-- IF, não por CHECK de parâmetro (função aceita texto livre, mas só faz algo com os 2 valores
-- esperados). Aceitar trava `accepted_version_id` na última versão ENVIADA (nunca a "ao vivo",
-- que pode ter mudado depois do envio) — exigência explícita do plano: "não sobrescrever a
-- versão aceita".
create or replace function public.respond_public_proposal(p_slug text, p_response text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_proposal_id uuid;
  v_latest_version_id uuid;
begin
  if p_response not in ('accepted', 'rejected') then
    return false;
  end if;

  select id into v_proposal_id
  from public.proposals
  where slug = p_slug and status in ('sent', 'negotiating', 'revision_requested');
  if v_proposal_id is null then
    return false;
  end if;

  if p_response = 'accepted' then
    select id into v_latest_version_id from public.proposal_versions where proposal_id = v_proposal_id order by version_number desc limit 1;
    update public.proposals set status = 'accepted', accepted_version_id = v_latest_version_id, updated_at = now() where id = v_proposal_id;
  else
    update public.proposals set status = 'rejected', updated_at = now() where id = v_proposal_id;
  end if;

  insert into public.events (entity_type, entity_id, actor_id, type, metadata)
  values ('proposal', v_proposal_id, null, 'proposal.' || p_response, '{}'::jsonb);

  return true;
end;
$$;

revoke all on function public.respond_public_proposal(text, text) from public;
grant execute on function public.respond_public_proposal(text, text) to anon, authenticated;
