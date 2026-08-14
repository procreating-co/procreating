import "server-only";
import { cookies } from "next/headers";
import { OS_THEME_COOKIE } from "@/lib/theme/constants";
import type { UserTheme } from "@/lib/supabase/types/database";

/** Mesmo padrão de `lib/admin/auth/session-cookie.ts` — helper único, reaproveitado pela leitura
 *  em `app/(internal)/layout.tsx` e pela gravação em `setThemeAction`. */
export async function getThemeCookie(): Promise<UserTheme | null> {
  const store = await cookies();
  const value = store.get(OS_THEME_COOKIE)?.value;
  return value === "light" || value === "dark" ? value : null;
}

export async function setThemeCookie(theme: UserTheme) {
  const store = await cookies();
  store.set(OS_THEME_COOKIE, theme, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 ano — preferência de UI, não sessão
  });
}
