/** Nome do cookie de sessão do Portal. Usado tanto por `proxy.ts` (checagem rápida na borda)
 *  quanto pelo provider de auth (leitura/gravação real da sessão) — mesmo papel de
 *  `ADMIN_SESSION_COOKIE` (`lib/admin/auth/constants.ts`), nome diferente de propósito: staff e
 *  cliente nunca devem compartilhar o mesmo sinal de sessão, mesmo sendo os dois, por baixo, uma
 *  sessão Supabase Auth normal (cookie próprio do `@supabase/ssr`, único por navegador — ver
 *  comentário em `provider.ts`). */
export const PORTAL_SESSION_COOKIE = "portal_session";

export const PORTAL_LOGIN_PATH = "/portal/login";
/** Cadastro do cliente — só aceita e-mail com convite pendente em `client_portal_invites`,
 *  criado pelo staff em `/clientes/[id]` (ver `lib/clientes/portal-invite-actions.ts`). */
export const PORTAL_SIGNUP_PATH = "/portal/signup";
