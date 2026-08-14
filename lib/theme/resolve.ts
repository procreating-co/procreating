import "server-only";
import type { UserTheme } from "@/lib/supabase/types/database";

/** Prioridade: cookie (mais recente, pode ter mudado neste dispositivo antes da conta
 *  sincronizar) > preferência salva na conta > `"dark"` (o visual único de sempre — zero
 *  surpresa pra quem nunca escolheu nada). */
export function resolveInitialTheme(cookieTheme: UserTheme | null, accountTheme: UserTheme | null): UserTheme {
  return cookieTheme ?? accountTheme ?? "dark";
}
