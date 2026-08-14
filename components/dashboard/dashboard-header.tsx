"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { GROWTH_TABS, OPERATIONS_TABS, FINANCE_TABS, SETTINGS_TABS, type TopNavTab } from "@/components/dashboard/nav-config";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { cn } from "@/lib/utils";

/**
 * Cada área com sub-navegação própria mapeia pra sua lista de abas, por prefixo de rota — mesmo
 * raciocínio de `matchPrefixes` que `nav-config.ts` já usa pra sidebar. Workspace (`/meu-dia`) e
 * Dashboard (`/`) não entram aqui: são páginas únicas, sem sub-navegação, então a barra fica só
 * com o botão de menu mobile + a busca.
 */
const AREA_TABS: { prefixes: string[]; tabs: TopNavTab[] }[] = [
  { prefixes: ["/comercial", "/marketing", "/clientes", "/reports"], tabs: GROWTH_TABS },
  { prefixes: ["/operacao"], tabs: OPERATIONS_TABS },
  { prefixes: ["/financeiro"], tabs: FINANCE_TABS },
  { prefixes: ["/configuracoes"], tabs: SETTINGS_TABS },
];

function getAreaTabs(pathname: string): TopNavTab[] | null {
  const area = AREA_TABS.find((candidate) => candidate.prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)));
  return area?.tabs ?? null;
}

/**
 * Barra única do shell interno — antes disso existiam DUAS barras sobrepostas (este header, com
 * um texto de título solto + a busca, e um `TopNav` separado renderizado por CADA `layout.tsx` de
 * área com as próprias abas). Isso causava texto duplicado (o título já repetia o nome da aba
 * ativa) e deixava a busca numa linha própria, desalinhada do resto — os dois eram sintoma da
 * mesma causa: navegação de área espalhada em vários componentes.
 *
 * Fix: este componente resolve sozinho as abas da área atual (`getAreaTabs`) e desenha tudo numa
 * `<header>` só — `[menu mobile] [abas da área, se houver] [busca ⌘K]`, sempre a mesma altura,
 * sempre a mesma linha. `TopNav` (`top-nav.tsx`) e os 4 `layout.tsx` que só chamavam
 * `<TopNav tabs={...} />` foram removidos — Next.js usa o layout do pai quando não há um layout no
 * segmento, comportamento idêntico, sem regressão de rota.
 */
export function DashboardHeader({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const pathname = usePathname();
  const tabs = getAreaTabs(pathname);

  return (
    <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 sm:px-6 lg:px-10">
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="Abrir menu"
          className="-ml-1.5 flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground lg:hidden"
        >
          <Menu className="size-4.5" />
        </button>

        {tabs ? (
          <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "shrink-0 whitespace-nowrap border-b-2 px-1 py-3 text-sm transition-colors",
                    active ? "border-brand text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        ) : (
          <div className="flex-1" />
        )}

        <CommandPalette />
      </div>
    </header>
  );
}
