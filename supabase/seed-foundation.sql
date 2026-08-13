-- Seed da Fase 1 (Foundation) — NÃO é uma migration versionada (por isso mora fora de
-- `migrations/`): depende de um UUID que só existe depois que você cria o primeiro usuário real
-- no Dashboard, então precisa de uma edição manual antes de rodar. Rode isto DEPOIS de aplicar
-- `supabase/migrations/20260729000000_initial_schema.sql` inteiro no SQL Editor.
--
-- PASSO A PASSO
--   1. Dashboard do Supabase → Authentication → Users → "Add user".
--      Email: martins.santiago08@gmail.com
--      Senha: (a senha temporária que combinamos na entrega desta fase — troque no primeiro
--      login, o Supabase Auth já tem o fluxo de "forgot password"/"update password" pronto)
--      Marque "Auto Confirm User" para não depender de um e-mail de confirmação.
--   2. Copie o UUID gerado para esse usuário (coluna "UID" na lista de usuários).
--   3. Substitua TODAS as ocorrências de 'SUBSTITUA_PELO_UUID_DO_USUARIO_CRIADO_NO_DASHBOARD'
--      abaixo por esse UUID (é o mesmo valor nas duas linhas — `users.id` e `clients.created_by`).
--   4. Cole o arquivo inteiro (já editado) no SQL Editor e rode.

insert into public.users (id, name, email, role)
values (
  'SUBSTITUA_PELO_UUID_DO_USUARIO_CRIADO_NO_DASHBOARD',
  'Santiago',
  'martins.santiago08@gmail.com',
  'owner'
);

-- Só os clientes REAIS hoje em produção (Pascoal, Elenita) — `slug` idêntico ao já usado
-- publicamente em `lib/clients/registry.ts`/`lib/clients/workspace-registry.ts`, pra essa
-- tabela poder um dia virar a fonte de leitura desses registries sem precisar remapear nada.
--
-- Não migrados aqui, de propósito (ver "Auditoria Procreating OS", achado F.1):
--   - "cliente-x" (`content/clients/cliente-x/workspace.ts`) — fixture de teste, não é cliente
--     real.
--   - "Grupo Vitória" / "Oficina MMR" (`lib/admin/clients/mock-data.ts`) — só existem no mock
--     do painel /admin legado, nunca foram confirmados como clientes reais.
--
-- `status: 'ativo'` é um default razoável (os dois já têm site em produção) — ajuste com um
-- UPDATE se algum dos dois estiver, na prática, em outro estágio (ex.: onboarding, atenção).
insert into public.clients (name, slug, status, created_by)
values
  ('Pascoal Bombas', 'pascoal', 'ativo', 'SUBSTITUA_PELO_UUID_DO_USUARIO_CRIADO_NO_DASHBOARD'),
  ('Dra. Elenita', 'elenita', 'ativo', 'SUBSTITUA_PELO_UUID_DO_USUARIO_CRIADO_NO_DASHBOARD');

-- Eduardo Fraresso NÃO entra aqui — ele cria a própria conta em `/admin/signup`
-- (allowlist em `lib/admin/auth/partners.ts`), que já grava a linha em `public.users` sozinho.
-- Este seed só existe pra dar o primeiro usuário (Santiago) antes de qualquer allowlist existir.
