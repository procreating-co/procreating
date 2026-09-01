-- Client Hub (Operação > Clientes > [cliente] > Central do Cliente) — Cronograma de postagens /
-- Roteiros / Linha editorial de Stories. Extensão ADITIVA de `production_items` (a mesma tabela
-- que já alimenta Produção/Entregas/Recursos, `20260814300000_production_items.sql`) em vez de
-- criar 3 tabelas novas quase idênticas — mesmo raciocínio que already levou `kind` a discriminar
-- as 3 páginas de Operação. Todas as colunas são nullable: nenhuma query/insert existente
-- (`lib/operacao/queries.ts`, `lib/operacao/actions.ts`, as páginas /operacao/producao|entregas|
-- conteudo) referencia essas colunas, então elas continuam funcionando exatamente como antes.
--
-- `format` decide qual das 3 seções do Client Hub um item de `kind='conteudo'` alimenta:
--   null/'post'/'reels'/'outro' → Cronograma de postagens
--   'roteiro'                   → Roteiros (usa também `script_body`)
--   'story'                     → Linha editorial de Stories (usa também `story_*`)
alter table public.production_items
  add column format text check (format in ('post', 'reels', 'story', 'roteiro', 'outro')),
  add column channel text,
  add column scheduled_date date,
  add column assigned_to uuid references public.users (id),
  add column notes text,
  add column script_body text,
  add column story_sequence integer,
  add column story_objective text,
  add column story_direction text;

create index production_items_client_scheduled_idx on public.production_items (client_id, scheduled_date);
