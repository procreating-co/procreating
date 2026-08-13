/** Nome do cookie de sessão do admin. Usado tanto pelo `middleware.ts` (checagem rápida na
 *  borda) quanto pelo provider de auth (leitura/gravação real da sessão). */
export const ADMIN_SESSION_COOKIE = "admin_session";

export const ADMIN_LOGIN_PATH = "/admin/login";
/** Cadastro do segundo sócio (Eduardo) — só aceita email na allowlist, ver `lib/admin/auth/partners.ts`. */
export const ADMIN_SIGNUP_PATH = "/admin/signup";
/**
 * Pra onde login/signup bem-sucedidos redirecionam, e pra onde `proxy.ts` manda quem já está
 * logado e tenta abrir `/admin/login`/`/admin/signup` de novo. É `/` — a Home do Procreating OS
 * novo (`app/(internal)/page.tsx`, Comercial/Operação/Financeiro/Clientes) — desde que o login
 * passou a servir esse dashboard também, não só o painel legado `/admin`. Não confundir com
 * `/admin` em si, que continua existindo como painel legado — só deixou de ser o destino padrão
 * pós-login.
 */
export const POST_LOGIN_PATH = "/";
