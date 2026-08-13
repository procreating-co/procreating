import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_HOME_PATH, ADMIN_LOGIN_PATH, ADMIN_SESSION_COOKIE, ADMIN_SIGNUP_PATH } from "@/lib/admin/auth/constants";

/**
 * Gate de borda pro ERP interno inteiro — `/admin/*` (painel legado) e todo o grupo protegido
 * `app/(internal)/**` (`/`, `/operacao/*`, `/administracao/*` desde a Fase 1; `/comercial/*`,
 * `/clientes/*`, `/financeiro/*` desde a Fase 2-5 — ver `matcher` abaixo). Nunca toca em rota
 * pública (`/clients/[client]/...`). Checa só a presença do cookie de sessão (rápido, sem I/O);
 * a validação "de verdade" acontece nos layouts protegidos (`app/admin/(protected)/layout.tsx`,
 * `app/(internal)/layout.tsx`), que rodam no servidor e consultam o Supabase Auth de fato via
 * `lib/admin/auth` (`getSession()`).
 *
 * Toda rota nova dentro de `app/(internal)/**` precisa de uma entrada aqui no `matcher` — o
 * layout sozinho não basta: sem o cookie sendo checado na borda, uma request sem sessão chega
 * direto no layout e cai na mesma tentativa de `createClient()` que qualquer rota autenticada
 * faria, o que é 500 (Supabase sem env var) em vez do redirect limpo pro login.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(ADMIN_SESSION_COOKIE);
  // Login e Signup (cadastro do segundo sócio, allowlist em lib/admin/auth/partners.ts) são as
  // únicas páginas de `/admin/*` que precisam funcionar sem sessão.
  const isPublicAuthPage = pathname === ADMIN_LOGIN_PATH || pathname === ADMIN_SIGNUP_PATH;

  if (!hasSession && !isPublicAuthPage) {
    return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url));
  }

  if (hasSession && isPublicAuthPage) {
    return NextResponse.redirect(new URL(ADMIN_HOME_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/", "/operacao/:path*", "/administracao/:path*", "/comercial/:path*", "/clientes/:path*", "/financeiro/:path*"],
};
