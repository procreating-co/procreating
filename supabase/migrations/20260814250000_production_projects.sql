-- Operação: primeiro slice real (substitui o mock de `lib/dashboard/demo-data.ts`) —
-- `InternalProject` já previa isso ("ganhar tabela própria é trabalho da Fase 7 (Operação) do
-- roadmap"). Nome `production_projects`, de propósito diferente de `public.projects` (que já
-- existe e significa "entrega de site pro cliente" — Template→Project→Deployment, conceito
-- totalmente diferente, documentado em `docs/project-creation.md`) — sem colisão de nome nem de
-- significado.

create table public.production_projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id),
  name text not null,
  status text not null default 'planejamento'
    check (status in ('planejamento', 'em_producao', 'em_revisao', 'aguardando_aprovacao', 'concluido', 'atrasado')),
  assigned_to uuid references public.users (id),
  deadline date,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index production_projects_client_id_idx on public.production_projects (client_id);

alter table public.production_projects enable row level security;
create policy production_projects_all_authenticated on public.production_projects for all to authenticated using (true) with check (true);
