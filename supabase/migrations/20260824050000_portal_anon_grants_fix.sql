-- Mesma pendência da Fase A (`20260824030000_client_portal_invites_and_anon_fix.sql`), agora nas
-- 2 funções novas da parte 2/2 desta mesma migration/fase: `revoke ... from public` não revoga o
-- grant individual que este projeto concede a `anon` automaticamente (`ALTER DEFAULT PRIVILEGES`
-- no momento da criação da função) — confirmado de novo pelos security advisors depois do deploy.
-- `claim_client_portal_invite`/`get_my_portal_client` dependem de `auth.uid()`, que resolve NULL
-- pra `anon` (sem `sub` na chave anon), então já eram inofensivas na prática — mesmo raciocínio
-- documentado na Fase A, fechado aqui do mesmo jeito, antes de virar hábito deixar passar.
revoke execute on function public.claim_client_portal_invite(text) from anon;
revoke execute on function public.get_my_portal_client() from anon;
