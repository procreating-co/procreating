-- Fundação do Client Portal (Fase A, parte 2/2) — substitui as policies `_all_authenticated`
-- (`USING(true) WITH CHECK(true)`) de clients/contracts/production_projects/production_items por
-- pares staff+portal. Depende das funções e da tabela `client_portal_users` criadas em
-- `20260824010000_client_portal_foundation.sql`.
--
-- Staff (public.is_active_staff()) mantém exatamente o comportamento atual: ALL, sem restrição
-- de linha — nenhuma regressão para os usuários internos.
--
-- Portal (public.is_portal_member_of()) ganha SELECT-only, restrito à própria linha via
-- client_id — nesta fase o Portal é somente leitura, sem INSERT/UPDATE/DELETE (aprovado
-- explicitamente; fica para uma fase posterior). Como não existe policy de escrita para o
-- Portal, qualquer INSERT/UPDATE/DELETE tentado por um usuário de Portal é rejeitado antes de
-- qualquer WITH CHECK ser avaliado.
--
-- `clients` usa `clients.id` (não existe `clients.client_id`) — `contracts`, `production_projects`
-- e `production_items` usam sua própria coluna `client_id`, já com FK para `clients.id`.
-- `production_items` já tem `client_id` denormalizado na própria linha (além de
-- `production_project_id`), então a policy compara direto, sem precisar de join.
--
-- Cada DROP + par de CREATE roda na mesma transação de migration — a tabela nunca fica um
-- instante sem nenhuma policy (o que bloquearia até o staff).

drop policy clients_all_authenticated on public.clients;

create policy clients_staff_all on public.clients
  for all to authenticated
  using (public.is_active_staff())
  with check (public.is_active_staff());

create policy clients_portal_select_own on public.clients
  for select to authenticated
  using (public.is_portal_member_of(clients.id));

drop policy contracts_all_authenticated on public.contracts;

create policy contracts_staff_all on public.contracts
  for all to authenticated
  using (public.is_active_staff())
  with check (public.is_active_staff());

create policy contracts_portal_select_own on public.contracts
  for select to authenticated
  using (public.is_portal_member_of(contracts.client_id));

drop policy production_projects_all_authenticated on public.production_projects;

create policy production_projects_staff_all on public.production_projects
  for all to authenticated
  using (public.is_active_staff())
  with check (public.is_active_staff());

create policy production_projects_portal_select_own on public.production_projects
  for select to authenticated
  using (public.is_portal_member_of(production_projects.client_id));

drop policy production_items_all_authenticated on public.production_items;

create policy production_items_staff_all on public.production_items
  for all to authenticated
  using (public.is_active_staff())
  with check (public.is_active_staff());

create policy production_items_portal_select_own on public.production_items
  for select to authenticated
  using (public.is_portal_member_of(production_items.client_id));
