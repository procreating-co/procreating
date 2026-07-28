import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_HOME_PATH, ADMIN_LOGIN_PATH, ADMIN_SESSION_COOKIE } from "@/lib/admin/auth/constants";

/**
 * Gate de borda pro painel administrativo. Só roda em `/admin/*` (ver `matcher` abaixo) — não
 * toca em nenhuma rota pública (`/`, `/p/[client]/...`). Checa só a presença do cookie de
 * sessão (rápido, sem I/O); a validação "de verdade" da sessão acontece em
 * `app/admin/(protected)/layout.tsx`, que roda no servidor e pode consultar o provider de auth
 * de fato (hoje mock, futuramente Supabase).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(ADMIN_SESSION_COOKIE);
  const isLoginPage = pathname === ADMIN_LOGIN_PATH;

  if (!hasSession && !isLoginPage) {
    return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url));
  }

  if (hasSession && isLoginPage) {
    return NextResponse.redirect(new URL(ADMIN_HOME_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
