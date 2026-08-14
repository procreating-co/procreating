"use client";

import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { useTheme } from "@/lib/theme/theme-provider";

/**
 * `.os-shell` + `data-theme` aqui é o que escopa a paleta nova (`app/globals.css`) só ao shell
 * interno — `:root` global (usado por `/admin` e pelo workspace de cliente) nunca muda. Precisa
 * ser client component pra reagir ao toggle de tema (`useTheme()`) sem esperar um reload; os
 * `children` continuam podendo ser Server Components normalmente (mesmo padrão já usado por
 * `AdminAuthProvider`).
 *
 * `lg:pl-16` (não mais `lg:pl-64`) — a sidebar nova fica recolhida por padrão e expande em cima
 * do conteúdo como overlay (`dashboard-sidebar.tsx`), não empurra mais o layout.
 */
export function DashboardLayout({ children }: { children: ReactNode }) {
  const { theme } = useTheme();

  return (
    <div className="os-shell min-h-screen bg-background text-foreground" data-theme={theme}>
      <DashboardSidebar />
      <div className="lg:pl-16">
        <DashboardHeader />
        {children}
      </div>
    </div>
  );
}
