import "server-only";
import { cookies } from "next/headers";
import { PORTAL_SESSION_COOKIE } from "@/lib/portal/auth/constants";

/**
 * Sinal rápido de sessão pro `proxy.ts` — mesmo papel de `lib/admin/auth/session-cookie.ts`, não
 * é quem decide autenticação (isso é `getSession()`, via Supabase Auth de verdade), só evita
 * mandar quem claramente não tem sessão nenhuma até o layout `/portal/[slug]` descobrir isso.
 */
export async function setPortalSessionCookie() {
  const store = await cookies();
  store.set(PORTAL_SESSION_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8h — Supabase Auth também expira/renova por conta própria
  });
}

export async function clearPortalSessionCookie() {
  const store = await cookies();
  store.delete(PORTAL_SESSION_COOKIE);
}
