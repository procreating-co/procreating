-- P1 da auditoria: Produção, Entregas e Recursos (Conteúdo) eram 100% mock (`lib/dashboard/
-- demo-data.ts` / array local), a distância mais concreta entre aparência e realidade do produto
-- ("3 das 6 sub-áreas de Operação são decoração"). As três telas têm o MESMO formato (título +
-- cliente + status) — uma tabela só, `production_items`, com `kind` discriminando qual página
-- mostra o quê, em vez de 3 tabelas quase idênticas. Não mexe em navegação/abas — as 3 páginas
-- continuam existindo como estão, só passam a ler dado real filtrado por `kind`.
--
-- `status_label`/`status_tone` (não um enum fixo por kind): cada página tem seu próprio
-- vocabulário de status (Produção: Roteiro/Edição; Entregas: Aguardando aprovação/Em revisão) —
-- texto livre + o tom (`StatusTone`, já usado por toda a Operação) em vez de 3 enums CHECK
-- diferentes por linha.

create table public.production_items (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('producao', 'entrega', 'conteudo')),
  title text not null,
  client_id uuid references public.clients (id),
  production_project_id uuid references public.production_projects (id),
  status_label text not null,
  status_tone text not null default 'pending' check (status_tone in ('active', 'pending', 'neutral', 'danger')),
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index production_items_kind_idx on public.production_items (kind);
create index production_items_client_id_idx on public.production_items (client_id);
create index production_items_project_id_idx on public.production_items (production_project_id);

alter table public.production_items enable row level security;
create policy production_items_all_authenticated on public.production_items for all to authenticated using (true) with check (true);
