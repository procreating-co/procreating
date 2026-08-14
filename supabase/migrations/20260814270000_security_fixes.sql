-- Correções de segurança — dois achados reais, confirmados por leitura direta do banco (não do
-- código, então independem de qualquer branch estar desatualizada):
--
-- 1. `close_lead_and_create_client` (RPC SECURITY DEFINER, `20260813010000_...sql`) tinha EXECUTE
--    concedido a `anon`/PUBLIC — grant implícito do Postgres na criação da função, nunca revogado
--    (a migration original só ADICIONOU `authenticated`, não removeu o default). Na prática,
--    qualquer requisição não autenticada podia chamar `/rest/v1/rpc/close_lead_and_create_client`
--    e criar cliente/contrato/receita sem login. Corrigido revogando de `public` (cobre `anon` e
--    qualquer role futura que herde de PUBLIC), mantendo só `authenticated`.
--
-- 2. 6 das 8 tabelas do Client Hub apontadas como "RLS sem policy" têm RLS habilitado desde a
--    Fase 1 mas nunca ganharam policy — fail-closed: nem `anon` nem `authenticated` conseguem
--    ler/escrever nelas hoje. Não é explorável (o contrário: bloqueia o próprio painel `/admin`,
--    que usa client autenticado normal, sem `service_role`, confirmado por grep). Mesma policy
--    coarse usada em toda tabela de negócio do projeto.
--
--    `analytics` e `downloads` ficam DE FORA desta correção, de propósito — são as duas exceções
--    da lista, não um esquecimento: o próprio comentário da migration original (`initial_schema.sql`)
--    documenta as duas como "evento bruto de VISITANTE", identificadas por `visitor_id` (hash
--    anônimo), não por `auth.uid()`. Aplicar `authenticated`-only nelas contradiria o propósito
--    documentado (são pensadas pra ser escritas por visitante anônimo do site público) — hoje
--    seguem fail-closed (sem uso real ainda, confirmado por grep: zero `.from("analytics"/
--    "downloads")` no código), e devem ganhar uma policy própria (provavelmente `insert`
--    liberado a `anon`, `select`/`update`/`delete` só a `authenticated`) quando o rastreio de
--    visitante for construído — não nesta correção de segurança.

revoke all on function public.close_lead_and_create_client(uuid, jsonb) from public;
grant execute on function public.close_lead_and_create_client(uuid, jsonb) to authenticated;

create policy templates_all_authenticated on public.templates for all to authenticated using (true) with check (true);
create policy projects_all_authenticated on public.projects for all to authenticated using (true) with check (true);
create policy project_versions_all_authenticated on public.project_versions for all to authenticated using (true) with check (true);
create policy deployments_all_authenticated on public.deployments for all to authenticated using (true) with check (true);
create policy project_capabilities_all_authenticated on public.project_capabilities for all to authenticated using (true) with check (true);
create policy assets_all_authenticated on public.assets for all to authenticated using (true) with check (true);
