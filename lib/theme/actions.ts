"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/supabase/current-user";
import { setThemeCookie } from "@/lib/theme/theme-cookie";
import type { UserTheme } from "@/lib/supabase/types/database";

/**
 * Persiste a preferência de tema — cookie (efeito imediato, sobrevive fechar o navegador) e
 * `users.theme` (efeito entre dispositivos, na próxima vez que logar em outro lugar). Chamada em
 * background pelo `ThemeProvider` no clique do toggle — a UI já mudou via estado local antes
 * disso terminar, então esta função não precisa devolver nada pro caller aguardar.
 */
export async function setThemeAction(theme: UserTheme): Promise<void> {
  await setThemeCookie(theme);

  const userId = await getCurrentUserId();
  if (!userId) return;

  const supabase = await createClient();
  await supabase.from("users").update({ theme }).eq("id", userId);
}
