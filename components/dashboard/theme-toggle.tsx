"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme/theme-provider";
import { cn } from "@/lib/utils";

/** Alternância direta entre os dois temas — sem menu de 3 opções ("sistema" fica pra depois, o
 *  prompt liberou pular se não for trivial e cookie/conta só guardam light/dark mesmo). */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme, isPending } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      disabled={isPending}
      aria-label={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
      title={isDark ? "Tema claro" : "Tema escuro"}
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground",
        className
      )}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
