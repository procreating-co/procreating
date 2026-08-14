"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { FINANCE_TABS, GROWTH_TABS, OPERATIONS_TABS, SETTINGS_TABS, WORKSPACE_TABS } from "@/components/dashboard/nav-config";
import { CommandPalette } from "@/components/dashboard/command-palette";

const ALL_TABS = [...WORKSPACE_TABS, ...GROWTH_TABS, ...OPERATIONS_TABS, ...FINANCE_TABS, ...SETTINGS_TABS];

/** Título = rótulo da aba ativa (a mais específica, maior `href`) — cobre toda rota que vive
 *  dentro de um `TopNav`. `/` (Dashboard) não tem aba nenhuma, então cai no fallback fixo. */
function useSectionTitle() {
  const pathname = usePathname();
  if (pathname === "/") return "Dashboard";

  const match = ALL_TABS.filter((tab) => pathname === tab.href || pathname.startsWith(`${tab.href}/`)).sort((a, b) => b.href.length - a.href.length)[0];
  return match?.label ?? "Procreating OS";
}

/** Redesign: o círculo de avatar estático (sem função nenhuma) saiu — no lugar, o gatilho do
 *  Command Palette (⌘K), que faz algo de verdade. Título à esquerda, busca à direita, os dois
 *  `items-center` na mesma `h-16` — alinhamento vertical que antes ficava torto.
 *
 * Botão de menu (`lg:hidden`) — abre o drawer da sidebar em telas pequenas, onde a sidebar de
 * hover (`dashboard-sidebar.tsx`) fica escondida (hover não existe em touch). Sem isso não havia
 * nenhum jeito de navegar o produto no celular. */
export function DashboardHeader({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const title = useSectionTitle();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur sm:px-6 lg:px-10">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="Abrir menu"
          className="-ml-1.5 flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground lg:hidden"
        >
          <Menu className="size-4.5" />
        </button>
        <p className="truncate text-sm text-muted-foreground">{title}</p>
      </div>
      <CommandPalette />
    </header>
  );
}
