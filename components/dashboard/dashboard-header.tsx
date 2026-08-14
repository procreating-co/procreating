"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu } from "lucide-react";
import { NAV_GROUPS, SETTINGS_TABS, type TopNavTab } from "@/components/dashboard/nav-config";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { QuickAddMenu } from "@/components/dashboard/quick-add-menu";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { cn } from "@/lib/utils";

/** Some completamente ao rolar pra baixo, volta ao rolar pra cima — não é só perder a borda,
 *  o header inteiro sai da tela (`translate-y-full`). `PAST` é a folga antes de começar a
 *  esconder (rolagens pequenas no topo da página não devem esconder nada). */
const HIDE_PAST_PX = 72;

function useHideOnScrollDown() {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      const scrollingDown = y > lastY.current;
      setHidden(scrollingDown && y > HIDE_PAST_PX);
      lastY.current = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return hidden;
}

/**
 * Abas da área atual — lidas direto de `NAV_GROUPS[*].tabs` (`nav-config.ts`), a única fonte:
 * antes disso existia um segundo array de prefixos aqui, em paralelo ao de `NAV_GROUPS`, e os
 * dois podiam ficar dessincronizados (foi exatamente o que quase aconteceu movendo Clientes de
 * Growth pra Operations — só um dos dois arrays teria sido atualizado se não fossem unificados
 * agora). `/configuracoes` é caso à parte: não é um grupo da sidebar (só existe no rodapé), então
 * não tem entrada em `NAV_GROUPS` — checado antes por padrão de prefixo fixo.
 */
function getAreaTabs(pathname: string): TopNavTab[] | null {
  if (pathname === "/configuracoes" || pathname.startsWith("/configuracoes/")) return SETTINGS_TABS;
  const group = NAV_GROUPS.find((candidate) => candidate.matchPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)));
  return group?.tabs ?? null;
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
  const hidden = useHideOnScrollDown();

  return (
    <header
      className={cn(
        "sticky top-0 z-10 bg-background/80 backdrop-blur transition-transform duration-200 ease-out",
        hidden ? "-translate-y-full" : "translate-y-0"
      )}
    >
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

        {/* + (criar) → lupa (buscar) → sol/lua (tema), sempre nessa ordem — um grupo só de
         *  ícones à direita, nada de texto/pill grande. */}
        <div className="flex items-center gap-1">
          <QuickAddMenu />
          <CommandPalette />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
