"use client";

import { Cloud, Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme/theme-provider";
import { cn } from "@/lib/utils";

/** Ciclo de 3 temas agora (era alternância binária) — light → dark → focus → light. O ícone
 *  mostrado é sempre o do PRÓXIMO tema (mesma convenção de antes: "clique pra ir pra cá"), não o
 *  do tema atual — `Cloud` pro Focus Mode (pedido explícito). */
const NEXT_THEME_ICON = { light: Moon, dark: Cloud, focus: Sun } as const;
const NEXT_THEME_LABEL = { light: "Mudar para tema escuro", dark: "Mudar para o Modo Foco", focus: "Mudar para tema claro" } as const;

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme, isPending } = useTheme();
  const Icon = NEXT_THEME_ICON[theme];
  const label = NEXT_THEME_LABEL[theme];

  return (
    <button
      type="button"
      onClick={toggleTheme}
      disabled={isPending}
      aria-label={label}
      title={label}
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground",
        className
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}
