"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme/theme-provider";
import { cn } from "@/lib/utils";

/** Alternância binária light↔dark (o "Focus Mode" virou o próprio dark oficial, não é mais um
 *  terceiro estado). O ícone mostrado é sempre o do PRÓXIMO tema — "clique pra ir pra cá". */
const NEXT_THEME_ICON = { light: Moon, dark: Sun } as const;
const NEXT_THEME_LABEL = { light: "Mudar para tema escuro", dark: "Mudar para tema claro" } as const;

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
