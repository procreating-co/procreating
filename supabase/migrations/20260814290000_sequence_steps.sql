-- Cadência de prospecção (P1 da auditoria — "maior lacuna funcional relativa ao que foi pedido").
-- MVP manual-assistido, decidido antes nesta sessão: sem disparo automático de WhatsApp/e-mail
-- (sem credencial de provedor ainda) — o sistema sugere o script certo pro dia certo, o humano
-- copia/abre o WhatsApp e clica "marcar como contatado". `sequence_steps` é a CONFIGURAÇÃO da
-- cadência (por estratégia, não por lead) — não existe uma tabela de "progresso por lead"
-- separada: o progresso é derivado em runtime de `leads.last_contact_at`/`next_contact_at`
-- (já existem, já usados pelo Kanban) — mesmo espírito de `lib/comercial/funnel.ts` (calculado,
-- não armazenado, registrado como decisão consciente na migration original).

create table public.sequence_steps (
  id uuid primary key default gen_random_uuid(),
  strategy_id uuid not null references public.strategies (id) on delete cascade,
  day_offset integer not null default 0, -- dias após o primeiro contato (0 = mensagem inicial)
  channel text not null default 'whatsapp' check (channel in ('whatsapp', 'email', 'ligacao')),
  script text not null,
  sort_order integer not null default 0,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now()
);

create index sequence_steps_strategy_id_idx on public.sequence_steps (strategy_id);

alter table public.sequence_steps enable row level security;
create policy sequence_steps_all_authenticated on public.sequence_steps for all to authenticated using (true) with check (true);
