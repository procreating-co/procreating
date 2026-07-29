-- Schema inicial da plataforma Procreating.
--
-- Gerado a partir do contrato TypeScript já congelado em `lib/supabase/types/database.ts`
-- (Architecture Freeze, ver `docs/project-creation.md`) — toda tabela/coluna/check abaixo
-- espelha exatamente um tipo já existente naquele arquivo. Nada aqui foi inventado agora; é a
-- tradução em DDL do que já estava decidido.
--
-- COMO APLICAR
--   - Cole este arquivo inteiro no SQL Editor do seu projeto Supabase, ou
--   - Com o Supabase CLI configurado (`supabase init` já rodado neste repo): `supabase db push`.
--   Não foi executado contra nenhum Postgres real ainda — não há ambiente local com psql/docker
--   disponível para validar sintaticamente antes de entregar. Rode no SQL Editor primeiro (ele
--   aponta erro de sintaxe linha a linha) antes de um `db push` de verdade.
--
-- O QUE NÃO ESTÁ AQUI, DE PROPÓSITO
--   - Tabela `previews` — deliberadamente fora do domínio congelado (ver docs/
--     project-creation.md, seção 3 da revisão 3/4: "não implementar, só documentar"). Quando
--     essa decisão for revista, ela ganha sua própria migration, não entra retroativamente nesta.
--   - Policies de RLS — as tabelas abaixo têm RLS *habilitado* (fail-closed: sem policy nenhuma,
--     ninguém lê/escreve nada via API pública), mas as policies em si dependem do desenho de
--     RBAC/multi-tenancy (docs/project-creation.md, revisão 6, seções 16 e 18), que a arquitetura
--     deixou deliberadamente para quando houver usuários reais — não inventado aqui.
--   - Seed data, triggers (ex.: auto-criar `public.users` a partir de `auth.users` no signup) —
--     decisão de produto, não de schema; fora do escopo deste arquivo.
--   - `supabase/config.toml` / scaffolding do CLI — só a migration em si foi pedida.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- users — perfil do usuário do admin, 1:1 com `auth.users` (Supabase Auth cuida da senha).
-- ---------------------------------------------------------------------------
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  role text not null check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- clients — a empresa/pessoa que contrata a Procreating. Existe uma vez, independente de
-- quantos projetos tiver.
-- ---------------------------------------------------------------------------
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
-- projects — uma entrega concreta pra um cliente, a partir de um template. Equivalente, hoje, a
-- uma pasta `data/<slug>/` + uma linha em `lib/clients/registry.ts` (caminho que continua
-- existindo só pra Pascoal). `current_version_id`/`current_deployment_id` referenciam tabelas
-- criadas mais abaixo — a FK real é adicionada só depois (ver ALTER TABLE no fim deste bloco),
-- porque `projects ↔ project_versions ↔ deployments` é uma referência circular.
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
-- events — auditoria de ações administrativas/sistema (baixo volume, sempre sabe quem/quando).
-- Não confundir com `analytics` abaixo (visitante público, alto volume, sem actor_id).
-- ---------------------------------------------------------------------------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  -- on delete set null (não cascade): o rastro de auditoria sobrevive à exclusão do projeto/
  -- cliente que ele descreve, de propósito.
  project_id uuid references public.projects (id) on delete set null,
  client_id uuid references public.clients (id) on delete set null,
  -- null = ação do sistema, não de uma pessoa.
  actor_id uuid references auth.users (id),
  type text not null check (
    type in (
      'project_created', 'project_updated', 'deploy_performed', 'preview_created',
      'upload_started', 'upload_completed', 'password_changed', 'project_published',
      'project_archived'
    )
  ),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index events_project_id_idx on public.events (project_id);
create index events_client_id_idx on public.events (client_id);

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
-- RLS — habilitado em toda tabela (fail-closed: sem policy nenhuma, zero acesso via API
-- pública do Supabase até políticas reais existirem). Ver nota no topo do arquivo.
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
