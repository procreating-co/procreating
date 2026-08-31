import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_LOGIN_PATH, ADMIN_SESSION_COOKIE, ADMIN_SIGNUP_PATH } from "@/lib/admin/auth/constants";
import { PORTAL_LOGIN_PATH, PORTAL_SESSION_COOKIE, PORTAL_SIGNUP_PATH } from "@/lib/portal/auth/constants";

/**
 * Gate de borda pro ERP interno inteiro — `/admin/*` (painel legado) e todo o grupo protegido
 * `app/(internal)/**` (`/`, `/operacao/*` desde a Fase 1; `/comercial/*`, `/clientes/*`,
 * `/financeiro/*` desde a Fase 2-5; `/marketing/*`, `/workspace/*` (era `/meu-dia`), `/configuracoes/*` desde a fase
 * de navegação completa; `/reports` desde a reestruturação de sidebar/tema — ver `matcher`
 * abaixo; `/administracao` saiu, rota removida). Nunca toca em rota pública
 * (`/clients/[client]/...`). Checa só a presença do cookie de sessão (rápido, sem I/O);
 * a validação "de verdade" acontece nos layouts protegidos (`app/admin/(protected)/layout.tsx`,
 * `app/(internal)/layout.tsx`), que rodam no servidor e consultam o Supabase Auth de fato via
 * `lib/admin/auth` (`getSession()`).
 *
 * Toda rota nova dentro de `app/(internal)/**` precisa de uma entrada aqui no `matcher` — o
 * layout sozinho não basta: sem o cookie sendo checado na borda, uma request sem sessão chega
 * direto no layout e cai na mesma tentativa de `createClient()` que qualquer rota autenticada
 * faria, o que é 500 (Supabase sem env var) em vez do redirect limpo pro login.
 *
 * NÃO redireciona quem tem `admin_session` pra fora de `/admin/login` — chegou a fazer isso, e
 * causava loop de redirecionamento (ERR_TOO_MANY_REDIRECTS): `admin_session` é só um sinal
 * rápido (sobrevive 8h) e pode continuar presente mesmo com a sessão real do Supabase Auth já
 * expirada/inválida; nesse caso o layout protegido manda de volta pro login (via `getSession()`,
 * a validação de verdade) e, se o middleware também mandasse de volta pra `/` só por ver o
 * cookie, virava ping-pong infinito entre os dois. Middleware não pode validar a sessão de
 * verdade sem I/O (por isso é só um sinal rápido) — então só bloqueia quem claramente não tem
 * nada; deixar alguém com cookie stale ver a tela de login de novo é inofensivo, um loop não é.
 *
 * `/portal/*` (Fase B, Portal do Cliente) ganhou o mesmo tratamento, com cookie e páginas
 * públicas PRÓPRIOS (`PORTAL_SESSION_COOKIE`, nunca `ADMIN_SESSION_COOKIE`) — staff e cliente
 * nunca compartilham o mesmo sinal de sessão aqui, mesmo sendo os dois, por baixo, uma sessão
 * Supabase Auth normal (ver `lib/portal/auth/provider.ts`). Continua sem tocar `/clients/*`
 * (rota pública legada, de outra sessão) nem no Page-Builder.
 *
 * `/propostas` no matcher é o path LITERAL (sem `:path*` de propósito) — é só o painel de
 * criação (`app/propostas/page.tsx`, staff). `/propostas/[slug]` (proposta pública individual,
 * sem login) nunca deve passar por aqui; usar `:path*` gatearia ela também, quebrando a rota
 * pública inteira.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/portal")) {
    const hasPortalSession = request.cookies.has(PORTAL_SESSION_COOKIE);
    const isPublicPortalAuthPage = pathname === PORTAL_LOGIN_PATH || pathname === PORTAL_SIGNUP_PATH;
    if (!hasPortalSession && !isPublicPortalAuthPage) {
      return NextResponse.redirect(new URL(PORTAL_LOGIN_PATH, request.url));
    }
    return NextResponse.next();
  }

  const hasSession = request.cookies.has(ADMIN_SESSION_COOKIE);
  // Login e Signup (cadastro do segundo sócio, allowlist em lib/admin/auth/partners.ts) são as
  // únicas páginas de `/admin/*` que precisam funcionar sem sessão.
  const isPublicAuthPage = pathname === ADMIN_LOGIN_PATH || pathname === ADMIN_SIGNUP_PATH;

  if (!hasSession && !isPublicAuthPage) {
    return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/",
    "/operacao/:path*",
    "/comercial/:path*",
    "/clientes/:path*",
    "/financeiro/:path*",
    "/marketing/:path*",
    "/workspace/:path*",
    "/configuracoes/:path*",
    "/reports/:path*",
    "/portal/:path*",
    "/propostas",
  ],
};
