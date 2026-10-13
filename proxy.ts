import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ADMIN_LOGIN_PATH, ADMIN_SIGNUP_PATH, POST_LOGIN_PATH } from "@/lib/admin/auth/constants";
import { AUTO_LOGIN_EMAIL, AUTO_LOGIN_PASSWORD, autoLoginConfigured } from "@/lib/admin/auth/auto-login";
import { PORTAL_LOGIN_PATH, PORTAL_SESSION_COOKIE, PORTAL_SIGNUP_PATH } from "@/lib/portal/auth/constants";

/**
 * Borda do ERP interno inteiro — `/admin/*` (painel legado) e todo o grupo `app/(internal)/**`
 * (`/`, `/operacao/*`, `/comercial/*`, `/clientes/*`, `/financeiro/*`, `/marketing/*`,
 * `/workspace/*`, `/configuracoes/*`, `/reports`, `/links` — ver `matcher` abaixo). Nunca toca em
 * rota pública (`/clients/[client]/...`).
 *
 * PAINEL INTERNO AGORA É PÚBLICO — o login foi removido. Esta borda NÃO bloqueia mais ninguém: em
 * vez de redirecionar quem não tem sessão pra `/admin/login`, ela faz um auto-login numa conta de
 * serviço owner (`lib/admin/auth/auto-login.ts`) pra manter uma sessão Supabase Auth real por
 * baixo — sem isso, as 74 policies RLS (`to authenticated`) devolveriam dados vazios. As antigas
 * telas `/admin/login` e `/admin/signup` deixaram de ser destino e redirecionam pro painel.
 *
 * Toda rota nova dentro de `app/(internal)/**` ainda precisa de uma entrada aqui no `matcher` —
 * é aqui que o auto-login de borda roda e persiste os cookies de sessão; sem isso a rota cairia
 * no fallback de `getSession()` (relogin em memória a cada request), que funciona mas é mais lento.
 *
 * `/portal/*` (Fase B, Portal do Cliente) continua com login PRÓPRIO — com cookie e páginas
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
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Portal do cliente — INALTERADO. Continua com login próprio (cookie e páginas públicas
  // próprios); a abertura do painel interno não toca nele.
  if (pathname.startsWith("/portal")) {
    const hasPortalSession = request.cookies.has(PORTAL_SESSION_COOKIE);
    const isPublicPortalAuthPage = pathname === PORTAL_LOGIN_PATH || pathname === PORTAL_SIGNUP_PATH;
    if (!hasPortalSession && !isPublicPortalAuthPage) {
      return NextResponse.redirect(new URL(PORTAL_LOGIN_PATH, request.url));
    }
    return NextResponse.next();
  }

  // Painel interno (ERP) agora é PÚBLICO — o login foi removido. As antigas telas de login e
  // cadastro deixaram de ser destino: quem cair nelas vai direto pro painel.
  if (pathname === ADMIN_LOGIN_PATH || pathname === ADMIN_SIGNUP_PATH) {
    return NextResponse.redirect(new URL(POST_LOGIN_PATH, request.url));
  }

  // Ninguém mais é redirecionado pra login. Pra os dados continuarem funcionando (74 policies RLS
  // `to authenticated`), garantimos uma sessão Supabase real por baixo via auto-login numa conta
  // de serviço owner — ver `lib/admin/auth/auto-login.ts`. Fazemos isso AQUI, na borda, por dois
  // motivos: (1) ENCAMINHAR os cookies de sessão pro request ATUAL (via `request.cookies.set`, que
  // atualiza o header `Cookie`, + `NextResponse.next({ request: { headers } })`), pra TODO
  // `createClient()` do render enxergar a sessão já no primeiro acesso — sem isso as queries
  // rodariam como `anon` e o RLS devolveria vazio; (2) PERSISTIR os cookies no navegador via
  // Set-Cookie, pra as próximas requests nem precisarem relogar.
  let response = NextResponse.next();

  const hasSupabaseSession = request.cookies.getAll().some((cookie) => cookie.name.startsWith("sb-"));
  if (autoLoginConfigured() && !hasSupabaseSession) {
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: request.headers } });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });
    // Falha silenciosa (env ausente/credencial inválida) não derruba a navegação: o layout
    // server-side ainda mostra um aviso claro de configuração em vez de 500/loop.
    await supabase.auth.signInWithPassword({ email: AUTO_LOGIN_EMAIL, password: AUTO_LOGIN_PASSWORD });
  }

  return response;
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
    "/links",
  ],
};
