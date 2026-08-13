-- Schema inicial da plataforma Procreating.
--
-- Gerado a partir do contrato TypeScript já congelado em `lib/supabase/types/database.ts`
-- (Architecture Freeze, ver `docs/project-creation.md`) — toda tabela/coluna/check abaixo
-- espelha exatamente um tipo já existente naquele arquivo. Nada aqui foi inventado agora; é a
-- tradução em DDL do que já estava decidido.
--
-- REVISADO NA FASE 1 (Foundation, ver "Auditoria Procreating OS" de 13/08 e o prompt de
-- execução da Fase 1) — esta é a versão FINAL antes da primeira aplicação real. Mudanças desta
-- revisão, todas motivadas por necessidade concreta do ERP interno (não especulação):
--   - `clients` ganhou `slug`/`status`/`document`/`segment` — vira a fonte única de identidade
--     de cliente (hoje fragmentada em 5 lugares, ver Seção F.1 da auditoria).
--   - `users.role` trocou de `admin|editor` pro vocabulário definitivo de papel da plataforma
--     inteira (owner/admin/commercial/marketing/operations/finance/production/client) — só o
--     campo existe, sem enforcement de RBAC por módulo ainda.
--   - `events` generalizou de "só projeto/deploy" para Activity Log genérico
--     (`entity_type`/`entity_id` no lugar de `project_id`/`client_id`; `type` deixou de ser um
--     `check` fechado) — preparado para CRM/Financeiro/Pessoal nas próximas fases, sem
--     implementar nenhuma delas agora.
--   - RLS ganhou policies mínimas em `users`/`clients`/`events` — sem isso, login real não
--     funcionaria (fail-closed original bloquearia até a própria sessão). Ver nota na seção de
--     RLS, no fim do arquivo, sobre o que é definitivo e o que é coarse-de-propósito.
--
-- COMO APLICAR
--   Cole este arquivo inteiro no SQL Editor do seu projeto Supabase. Depois, aplique
--   `supabase/seed-foundation.sql` (instruções no topo daquele arquivo) para criar o primeiro
--   usuário real e os clientes já em produção (Pascoal, Elenita).
--
-- O QUE NÃO ESTÁ AQUI, DE PROPÓSITO
--   - Tabela `previews` — deliberadamente fora do domínio congelado (ver docs/
--     project-creation.md, seção 3 da revisão 3/4: "não implementar, só documentar"). Quando
--     essa decisão for revista, ela ganha sua própria migration, não entra retroativamente nesta.
--   - Qualquer tabela de CRM/Financeiro/Pessoal (leads, opportunities, pipelines, proposals,
--     contracts, revenue, expenses, financial_rules, habits, campaigns) — fases seguintes do
--     roadmap, não a Fase 1. Criar agora seria antecipação especulativa.
--   - RBAC granular por módulo — `users.role` existe, nada além disso checa o papel ainda.
--   - `supabase/config.toml` / scaffolding do CLI — só a migration em si foi pedida.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- users — perfil do usuário do admin/ERP interno, 1:1 com `auth.users` (Supabase Auth cuida da
-- senha). `role` é o vocabulário de papel da plataforma inteira — hoje só gravado, sem
-- enforcement por módulo (RBAC granular é decisão de fase futura, ver docs/project-creation.md
-- seção 8/18).
-- ---------------------------------------------------------------------------
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  role text not null check (
    role in ('owner', 'admin', 'commercial', 'marketing', 'operations', 'finance', 'production', 'client')
  ),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- clients — a empresa/pessoa que contrata a Procreating. Existe uma vez, independente de
-- quantos projetos tiver. Fonte única de identidade de cliente pro ERP interno E pra plataforma
-- pública (`/clients/<slug>`) — `slug` é o mesmo valor já usado em `lib/clients/registry.ts` /
-- `lib/clients/workspace-registry.ts`, sem duplicar cadastro entre os dois lados.
-- ---------------------------------------------------------------------------
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  -- Chave pública estável — bate com a pasta `data/<slug>/`, `content/clients/<slug>/` e o
  -- segmento `/clients/<slug>` da plataforma de entrega. Único, nunca reaproveitado.
  slug text not null unique,
  status text not null default 'lead'
    check (status in ('lead', 'onboarding', 'ativo', 'atencao', 'risco', 'churn')),
  -- CNPJ ou CPF, formato livre (sem validação de dígito nesta fase).
  document text,
  segment text,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index clients_status_idx on public.clients (status);

-- ---------------------------------------------------------------------------
-- templates — o "molde" de um projeto. `blocks` é a lista de tipos de bloco que o template usa
-- (hoje só `["hero","features","videosSection","gallery","prospeccao","footer"]`, o que a
-- Pascoal já é). `version`/`schema_version` nunca afetam projeto já instanciado — só cópia
-- futura (ver docs/project-creation.md, seção 5 da revisão 5).
-- ---------------------------------------------------------------------------
create table public.templates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  blocks jsonb not null default '[]'::jsonb,
  version integer not null default 1,
  schema_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- projects — uma entrega concreta pra um cliente, a partir de um template (o "DeliveryProject"
-- do vocabulário do ERP — não confundir com o projeto de PRODUÇÃO interna, tipo "Vídeo
-- institucional Pascoal", que é outro conceito, hoje só mock em `lib/dashboard/demo-data.ts`
-- como `InternalProject`, ainda sem tabela própria). Equivalente, hoje, a uma pasta
-- `data/<slug>/` + uma linha em `lib/clients/registry.ts` (caminho que continua existindo só
-- pra Pascoal). `current_version_id`/`current_deployment_id` referenciam tabelas criadas mais
-- abaixo — a FK real é adicionada só depois (ver ALTER TABLE no fim deste bloco), porque
-- `projects ↔ project_versions ↔ deployments` é uma referência circular.
-- ---------------------------------------------------------------------------
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  template_id uuid not null references public.templates (id),
  slug text not null unique,
  name text not null,
  brand_name text not null,
  status text not null default 'creating'
    check (status in ('creating', 'draft', 'ready_for_preview', 'published', 'archived')),
  accent_color text not null,
  config jsonb not null default '{}'::jsonb,
  current_version_id uuid,
  current_deployment_id uuid,
  expires_at timestamptz,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_client_id_idx on public.projects (client_id);
create index projects_template_id_idx on public.projects (template_id);
create index projects_status_idx on public.projects (status);

-- ---------------------------------------------------------------------------
-- project_versions — snapshot imutável e append-only do config de um projeto. Nunca UPDATE, só
-- INSERT; `projects.current_version_id` aponta pra qual é a corrente.
-- ---------------------------------------------------------------------------
create table public.project_versions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  config jsonb not null default '{}'::jsonb,
  label text,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now()
);

create index project_versions_project_id_idx on public.project_versions (project_id);

-- ---------------------------------------------------------------------------
-- deployments — uma TENTATIVA de tornar uma versão específica a corrente. Separado de
-- project_versions de propósito: permite múltiplos deployments da mesma versão (retry,
-- rollback, redeploy sem mudança de conteúdo).
-- ---------------------------------------------------------------------------
create table public.deployments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  version_id uuid not null references public.project_versions (id),
  status text not null default 'pending'
    check (status in ('pending', 'in_progress', 'succeeded', 'failed')),
  -- null = disparado pelo sistema (ex.: retry automático), não por uma pessoa.
  triggered_by uuid references auth.users (id),
  error_message text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create index deployments_project_id_idx on public.deployments (project_id);
create index deployments_version_id_idx on public.deployments (version_id);

-- Fecha a referência circular projects → project_versions/deployments, agora que as duas
-- tabelas existem.
alter table public.projects
  add constraint projects_current_version_id_fkey
    foreign key (current_version_id) references public.project_versions (id),
  add constraint projects_current_deployment_id_fkey
    foreign key (current_deployment_id) references public.deployments (id);

-- ---------------------------------------------------------------------------
-- project_capabilities — evolução do que antes se chamava "Service"/produto vendido (ver
-- lib/platform/capabilities.ts pro catálogo com label/descrição de cada key).
-- ---------------------------------------------------------------------------
create table public.project_capabilities (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  key text not null check (
    key in (
      'gallery', 'photos', 'videos', 'downloads', 'prospection', 'traffic',
      'analytics', 'members_area', 'landing', 'password_protection', 'custom_modules'
    )
  ),
  enabled boolean not null default true,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (project_id, key)
);

create index project_capabilities_project_id_idx on public.project_capabilities (project_id);

-- ---------------------------------------------------------------------------
-- assets — modelo unificado de mídia (substitui as antigas Video/GalleryFolder/GalleryFile,
-- nenhuma das quais chegou a virar tabela real). `category` é a chave de agrupamento livre que
-- o Asset Manifest usa pra organizar (ex.: "hero", "gallery:equipe", "social").
-- ---------------------------------------------------------------------------
create table public.assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  type text not null check (type in ('PHOTO', 'VIDEO', 'LOGO', 'PDF', 'DOCUMENT', 'ZIP', 'FILE', 'OTHER')),
  category text not null,
  label text not null,
  key text not null,
  url text not null,
  metadata jsonb not null default '{}'::jsonb,
  status text not null default 'created'
    check (status in ('created', 'uploading', 'uploaded', 'processing', 'ready', 'archived', 'deleted', 'failed')),
  sort_order integer not null default 0,
  size_bytes bigint,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now()
);

-- Composto, na ordem que docs/project-creation.md recomenda pra volume alto (seção 18 da
-- revisão 4): filtra por projeto+status primeiro, já ordenado.
create index assets_project_id_status_sort_order_idx on public.assets (project_id, status, sort_order);

-- ---------------------------------------------------------------------------
-- events — Activity Log genérico da plataforma (auditoria administrativa/sistema, baixo
-- volume, sempre sabe quem/quando). Não confundir com `analytics` abaixo (visitante público,
-- alto volume, sem actor_id).
--
-- Generalizado na Fase 1 (Foundation) de "só projeto/deploy" pra qualquer entidade —
-- `entity_type`/`entity_id` substituem os antigos `project_id`/`client_id`. Associação
-- polimórfica deliberada: um evento pode apontar pra `project`, `client`, ou qualquer entidade
-- de fase futura (lead, opportunity, financial_rule, habit...) sem uma FK por tipo — o preço é
-- não ter integridade referencial garantida pelo banco nessa coluna, aceito porque `events` é
-- só trilha de auditoria (nunca uma fonte de verdade que outra tabela dependa via FK).
--
-- `type` deixou de ser um `check` fechado (era só 9 valores de projeto/deploy) — os mesmos 9
-- continuam válidos como convenção documentada abaixo, só deixam de ser impostos pelo banco,
-- pra CRM/Financeiro/Pessoal (fases seguintes) poderem registrar seus próprios tipos sem
-- migration nova:
--   project_created, project_updated, deploy_performed, preview_created, upload_started,
--   upload_completed, password_changed, project_published, project_archived
-- ---------------------------------------------------------------------------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  -- Ex.: "project", "client", "opportunity" (futuro). Sempre presente — todo evento pertence a
  -- alguma entidade.
  entity_type text not null,
  -- Sem FK (ver nota acima) — `null` só se um evento genuinamente não tiver entidade dona.
  entity_id uuid,
  -- null = ação do sistema, não de uma pessoa.
  actor_id uuid references auth.users (id),
  type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index events_entity_idx on public.events (entity_type, entity_id);

-- ---------------------------------------------------------------------------
-- analytics — evento bruto de VISITANTE (page view, desbloqueio de galeria/prospecção), por
-- projeto. Alto volume — em produção real, dashboards devem ler de uma tabela de rollup
-- (`project_daily_stats`, esboçada em docs/project-creation.md, não incluída aqui porque ainda
-- não tem consumidor real), nunca somar isto direto.
-- ---------------------------------------------------------------------------
create table public.analytics (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  event_type text not null check (event_type in ('page_view', 'gallery_unlock', 'prospeccao_unlock')),
  path text not null,
  -- hash anônimo (não é PII) — identifica visitante recorrente sem guardar IP/dado pessoal.
  visitor_id text,
  device text check (device in ('desktop', 'mobile', 'tablet')),
  referrer text,
  duration_seconds integer,
  created_at timestamptz not null default now()
);

create index analytics_project_id_idx on public.analytics (project_id);
create index analytics_created_at_idx on public.analytics (created_at);

-- ---------------------------------------------------------------------------
-- downloads — um download de asset, por projeto.
-- ---------------------------------------------------------------------------
create table public.downloads (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  asset_id uuid not null references public.assets (id),
  visitor_id text,
  created_at timestamptz not null default now()
);

create index downloads_project_id_idx on public.downloads (project_id);
create index downloads_asset_id_idx on public.downloads (asset_id);

-- ---------------------------------------------------------------------------
-- published_projects — WHERE status IN ('published','archived'), evita repetir esse filtro em
-- toda consulta/dashboard que não deveria enxergar rascunho.
-- ---------------------------------------------------------------------------
create view public.published_projects as
  select * from public.projects where status in ('published', 'archived');

-- ---------------------------------------------------------------------------
-- RLS — habilitado em toda tabela. `templates`, `projects`, `project_versions`, `deployments`,
-- `project_capabilities`, `assets`, `analytics`, `downloads` continuam fail-closed (RLS ligado,
-- zero policy) — nenhuma delas é usada pelo ERP nesta fase, políticas reais dependem do desenho
-- de RBAC/multi-tenancy de fases futuras (docs/project-creation.md, seções 16 e 18).
--
-- `users`, `clients` e `events` ganham policy mínima nesta fase porque sem isso a autenticação
-- e o cadastro de cliente não funcionariam (fail-closed bloquearia até a própria sessão ler seu
-- próprio perfil). As policies de `clients`/`events` abaixo são DELIBERADAMENTE largas — não é
-- multi-tenant, não há RBAC por módulo ainda, e a ferramenta hoje serve só a equipe interna da
-- Procreating. Revisitar e apertar quando RBAC por módulo existir (Fase 2+), não antes.
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.clients enable row level security;
alter table public.templates enable row level security;
alter table public.projects enable row level security;
alter table public.project_versions enable row level security;
alter table public.deployments enable row level security;
alter table public.project_capabilities enable row level security;
alter table public.assets enable row level security;
alter table public.events enable row level security;
alter table public.analytics enable row level security;
alter table public.downloads enable row level security;

-- users: cada usuário só lê a própria linha — suficiente pro lookup de sessão
-- (`getSession()` em `lib/admin/auth/supabase-provider.ts`); não abre o diretório de usuários
-- pra todo mundo ainda.
create policy users_select_own on public.users
  for select to authenticated
  using (auth.uid() = id);

-- clients: qualquer pessoa autenticada (equipe interna) lê e escreve qualquer cliente — coarse
-- de propósito, ver nota acima.
create policy clients_all_authenticated on public.clients
  for all to authenticated
  using (true)
  with check (true);

-- events: qualquer pessoa autenticada lê e registra evento — mesma justificativa de `clients`.
create policy events_select_authenticated on public.events
  for select to authenticated
  using (true);

create policy events_insert_authenticated on public.events
  for insert to authenticated
  with check (true);
