"use client";

import { useState, type ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { useTheme } from "@/lib/theme/theme-provider";
import { PortalContainerProvider } from "@/lib/theme/portal-container";

/**
 * `.os-shell` + `data-theme` aqui é o que escopa a paleta nova (`app/globals.css`) só ao shell
 * interno — `:root` global (usado por `/admin` e pelo workspace de cliente) nunca muda. Precisa
 * ser client component pra reagir ao toggle de tema (`useTheme()`) sem esperar um reload; os
 * `children` continuam podendo ser Server Components normalmente (mesmo padrão já usado por
 * `AdminAuthProvider`).
 *
 * `lg:pl-16` (não mais `lg:pl-64`) — a sidebar nova fica recolhida por padrão e expande em cima
 * do conteúdo como overlay (`dashboard-sidebar.tsx`), não empurra mais o layout. Abaixo de `lg`
 * a sidebar de hover some (não faz sentido em touch) e vira um drawer — o estado de aberto/
 * fechado mora aqui, único lugar comum entre `DashboardHeader` (o gatilho, ícone de menu) e
 * `DashboardSidebar` (o próprio drawer).
 *
 * `font-sans` aplicado aqui, explicitamente — `body` (app/layout.tsx) já aplica `font-sans` uma
 * vez, e `font-family` herda como VALOR COMPUTADO, não como referência viva a `var()`. Sem
 * reaplicar a classe neste elemento, o Geist escopado em `.os-shell` (app/globals.css) nunca
 * seria reavaliado — a herança ficaria presa no Instrument Sans que `body` resolveu no `:root`.
 *
 * `PortalContainerProvider` — todo `Dialog`/`Sheet` do shell interno precisa portar pra DENTRO
 * de `.os-shell`, não pra `document.body` (o padrão do Radix), senão o conteúdo do modal cai fora
 * do escopo de tema (achado: item ativo do drawer mobile saía dourado — o `:root` antigo, não o
 * monocromático novo).
 */
export function DashboardLayout({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <PortalContainerProvider>
      {(osShellRef) => (
        <div ref={osShellRef} className="os-shell min-h-screen bg-background text-foreground font-sans" data-theme={theme}>
          <DashboardSidebar mobileOpen={mobileNavOpen} onMobileOpenChange={setMobileNavOpen} />
          <div className="lg:pl-16">
            <DashboardHeader onOpenMobileNav={() => setMobileNavOpen(true)} />
            {children}
          </div>
        </div>
      )}
    </PortalContainerProvider>
  );
}
