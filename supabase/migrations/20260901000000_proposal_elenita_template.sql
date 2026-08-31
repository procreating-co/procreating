-- Proposta de Continuidade (Elenita) vira o template padrão do sistema de Propostas
-- (docs/proposal-system-architecture.md, pivô pedido pelo usuário). Os 12 `section_type`
-- genéricos do Fase 1 (hero/context/diagnosis/strategy/services/deliverables/investment/
-- conditions/testimonial/cta/footer/custom) nunca tiveram um renderer visual de verdade — a
-- página pública usava cards escuros genéricos, "inspirados" na Elenita mas não a Elenita.
-- Zero `proposals` reais existem em produção ainda (verificado antes desta migration), então é
-- seguro trocar o vocabulário de seções por completo em vez de rodar uma migração de dados.
--
-- Os 7 tipos novos espelham 1:1 os componentes reais de `components/proposal/**`
-- (ProposalHero/Pillars/Roadmap/TvProgram/Acquisition/Budget/Closing) — o "template" agora É
-- esse design, não uma reinvenção genérica dele.
alter table public.proposal_sections drop constraint proposal_sections_section_type_check;
alter table public.proposal_sections add constraint proposal_sections_section_type_check
  check (section_type in ('hero', 'pillars', 'roadmap', 'tv_program', 'acquisition', 'budget', 'closing'));

-- Cada Proposal ganha sua própria identidade visual — antes só o Template tinha `accent_color`,
-- mas cada cliente/lead tem sua cor de marca (Elenita: #b76e79, outro cliente: outra cor).
-- Nullable + fallback pro accent do template (coalesce em `get_public_proposal`), pra não quebrar
-- o fluxo de criação por template que ainda não escolhe uma cor explicitamente.
alter table public.proposals add column accent_color text;

-- Nome curto de exibição (ex.: "Dra. Elenita Luzardo"), distinto do `title` administrativo
-- (ex.: "Proposta de Continuidade — Dra. Elenita Luzardo") — usado por ProposalClosing
-- ("{brandName} × Procreating") e potencialmente metadata. Cópia própria da Proposal (não JOIN
-- em `leads`/`clients` a partir da função pública — nunca expor dados internos do CRM na rota
-- pública, mesmo que hoje só pegássemos `company_name`/`name`).
alter table public.proposals add column brand_name text not null default '';

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
  select p.id, p.title, p.status, p.accepted_version_id, p.brand_name,
         coalesce(p.accent_color, t.accent_color) as accent_color
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
    'brandName', v_proposal.brand_name,
    'accentColor', v_proposal.accent_color,
    'sections', coalesce(v_content, '[]'::jsonb)
  );
end;
$$;
