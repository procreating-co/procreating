-- Hub de Projetos/Propostas (`/propostas`) — pedido explícito: "Projetos são páginas de
-- prospecção, Propostas são as propostas de venda". Faltava um template `type='prospecting'`
-- pra dar pra criar um Projeto de verdade (só existia 1 template, `type='presentation'`).
-- Blueprint mínimo (hero + closing), mesmo conteúdo em branco que `addProposalSectionAction` já
-- usa pra qualquer seção nova (`EMPTY_CONTENT_BY_TYPE`) — o resto das seções (pillars/roadmap/
-- etc.) continua disponível no editor via "+ Adicionar seção", igual a qualquer proposta.
insert into public.proposal_templates (title, description, accent_color, section_blueprint, type, created_by)
values (
  'Projeto de Prospecção',
  'Ponto de partida pra uma página de prospecção — hero + fechamento; adicione mais seções no editor conforme o projeto precisar.',
  '#D4AF37',
  '[
    {"sectionType": "hero", "content": {"eyebrow": "", "title": "", "subtitle": "", "backgroundVideoUrl": null, "backgroundVideoOrientation": null}},
    {"sectionType": "closing", "content": {"heading": "", "paragraph": "", "whatsappOnAccept": null}}
  ]'::jsonb,
  'prospecting',
  '08db0960-f6ac-4087-a185-f5fafc67729a'
);
