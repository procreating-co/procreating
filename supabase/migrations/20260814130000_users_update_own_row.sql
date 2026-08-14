-- `public.users` só tinha policy de SELECT (própria linha) — sem UPDATE nenhum, `setThemeAction`
-- (lib/theme/actions.ts) gravava em silêncio 0 linhas (RLS bloqueia por padrão, sem erro visível
-- pro caller). Detectado no teste E2E da reestruturação de sidebar/tema: o toggle persistia via
-- cookie, mas nunca alcançava a conta — falhava exatamente o requisito de "persistir entre
-- dispositivos" pedido.
--
-- Mesmo escopo da policy de SELECT já existente (`auth.uid() = id`, só a própria linha) — não
-- abre update de outra pessoa. Nota: como não há RBAC granular ainda (mesma ressalva documentada
-- nas policies coarse de `clients`/`events`), tecnicamente isso permite a um usuário atualizar
-- também `name`/`role` da própria linha, não só `theme` — aceitável no mesmo nível de confiança
-- já assumido pra essas outras tabelas (equipe interna pequena, sem RBAC ainda); revisitar junto
-- de quando RBAC por módulo existir.
create policy users_update_own on public.users
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
