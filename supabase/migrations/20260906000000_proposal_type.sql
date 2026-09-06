-- Experiences (brief "Procreating Experiences", v2) — Fase 1: extensão aditiva, zero rename.
-- `type` discrimina o MOMENTO da jornada comercial que a proposta representa
-- (prospecting | strategy | presentation) — nasce com default 'presentation', então as 3 linhas
-- reais já em produção (elenita-luzardo, priscilla-nunes, maria-da-graca) viram 'presentation'
-- automaticamente, sem UPDATE manual: é exatamente o que elas já são hoje. Nenhum section_type,
-- constraint ou dado existente é alterado — só duas colunas novas.
alter table public.proposal_templates
  add column type text not null default 'presentation'
    check (type in ('prospecting', 'strategy', 'presentation'));

alter table public.proposals
  add column type text not null default 'presentation'
    check (type in ('prospecting', 'strategy', 'presentation'));

-- get_public_proposal — ganha um 2º parâmetro opcional (`p_expected_type`). `CREATE OR REPLACE`
-- sozinho NÃO bastaria aqui: como a assinatura muda de (text) pra (text, text default null),
-- ficariam duas funções coexistindo (a antiga de 1 argumento continua existindo por baixo) e uma
-- chamada com só o slug viraria ambígua entre as duas — por isso o DROP explícito da assinatura
-- antiga antes de criar a nova. Todo chamador real (`record_proposal_view`, o editor, o painel)
-- passa só `p_slug` e continua funcionando igual, já que `p_expected_type` tem default `null`
-- (sem filtro) — só as rotas públicas novas (/prospecting/[slug], /strategy/[slug]) passam o 2º
-- argumento, pra recusar (404) um slug do tipo errado acessado sob o prefixo errado.
drop function if exists public.get_public_proposal(text);

create function public.get_public_proposal(p_slug text, p_expected_type text default null)
returns jsonb
language plpgsql stable security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  v_proposal record;
  v_content jsonb;
begin
  select p.id, p.title, p.status, p.accepted_version_id, p.brand_name, p.type,
         coalesce(p.accent_color, t.accent_color) as accent_color
  into v_proposal
  from public.proposals p
  join public.proposal_templates t on t.id = p.template_id
  where p.slug = p_slug
    and p.status not in ('draft', 'archived', 'cancelled')
    and (p_expected_type is null or p.type = p_expected_type)
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
    'type', v_proposal.type,
    'brandName', v_proposal.brand_name,
    'accentColor', v_proposal.accent_color,
    'sections', coalesce(v_content, '[]'::jsonb)
  );
end;
$$;
revoke all on function public.get_public_proposal(text, text) from public;
grant execute on function public.get_public_proposal(text, text) to anon, authenticated;
