/** Nome do cookie de sessão do admin. Usado tanto pelo `middleware.ts` (checagem rápida na
 *  borda) quanto pelo provider de auth (leitura/gravação real da sessão). */
export const ADMIN_SESSION_COOKIE = "admin_session";

export const ADMIN_LOGIN_PATH = "/admin/login";
/** Cadastro do segundo sócio (Eduardo) — só aceita email na allowlist, ver `lib/admin/auth/partners.ts`. */
export const ADMIN_SIGNUP_PATH = "/admin/signup";
/**
 * Pra onde login/signup bem-sucedidos redirecionam, e pra onde `proxy.ts` manda quem já está
 * logado e tenta abrir `/admin/login`/`/admin/signup` de novo. É `/meu-dia` — o Workspace virou a
 * aba inicial padrão do Procreating OS (antes era `/`, o Dashboard analítico — que continua
 * existindo, só deixou de ser o destino padrão; seu ícone próprio na sidebar segue em
 * `nav-config.ts`). O logo/nome na sidebar (`dashboard-sidebar.tsx`) também leva pra cá — mesmo
 * destino, dois caminhos (login automático e clique manual). Não confundir com `/admin` em si,
 * que continua existindo como painel legado.
 */
export const POST_LOGIN_PATH = "/meu-dia";
