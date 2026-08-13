import "server-only";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/auth/constants";

/**
 * Sinal rápido de sessão pro `proxy.ts` — não é quem decide autenticação (isso é
 * `getSession()`, via Supabase Auth de verdade), só evita mandar quem claramente não tem sessão
 * nenhuma até o layout protegido pra descobrir isso. Extraído pra cá porque tanto o login
 * (`lib/admin/auth/supabase-provider.ts`) quanto o cadastro do segundo sócio
 * (`app/admin/signup/actions.ts`, Fase 2-5) precisam gravar o mesmo cookie.
 */
export async function setAdminSessionCookie() {
  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8h — Supabase Auth também expira/renova por conta própria
  });
}

export async function clearAdminSessionCookie() {
  const store = await cookies();
  store.delete(ADMIN_SESSION_COOKIE);
}
