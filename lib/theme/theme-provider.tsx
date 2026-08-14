"use client";

import { createContext, useCallback, useContext, useState, useTransition, type ReactNode } from "react";
import { setThemeAction } from "@/lib/theme/actions";
import type { UserTheme } from "@/lib/supabase/types/database";

type ThemeContextValue = { theme: UserTheme; setTheme: (theme: UserTheme) => void; toggleTheme: () => void; isPending: boolean };

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Mesmo padrão de `AdminAuthProvider` — hidrata com o valor já resolvido no servidor
 * (`app/(internal)/layout.tsx`, via `resolveInitialTheme`), então o primeiro paint já sai no
 * tema certo, sem script bloqueante nem flash. Troca de tema é otimista: o estado local muda na
 * hora (repaint instantâneo do `data-theme` no `.os-shell`), a persistência (cookie + conta) roda
 * em paralelo via Server Action, sem o clique esperar a viagem ao servidor.
 */
export function ThemeProvider({ initialTheme, children }: { initialTheme: UserTheme; children: ReactNode }) {
  const [theme, setThemeState] = useState<UserTheme>(initialTheme);
  const [isPending, startTransition] = useTransition();

  const setTheme = useCallback((next: UserTheme) => {
    setThemeState(next);
    startTransition(async () => {
      await setThemeAction(next);
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isPending }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme() precisa estar dentro de <ThemeProvider> (shell interno do Procreating OS).");
  return ctx;
}
