/** Nome do cookie de sessão do admin. Usado tanto pelo `middleware.ts` (checagem rápida na
 *  borda) quanto pelo provider de auth (leitura/gravação real da sessão). */
export const ADMIN_SESSION_COOKIE = "admin_session";

export const ADMIN_LOGIN_PATH = "/admin/login";
/** Cadastro do segundo sócio (Eduardo) — só aceita email na allowlist, ver `lib/admin/auth/partners.ts`. */
export const ADMIN_SIGNUP_PATH = "/admin/signup";
export const ADMIN_HOME_PATH = "/admin";
