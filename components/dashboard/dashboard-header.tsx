"use client";

import { usePathname } from "next/navigation";
import { User } from "lucide-react";
import { FINANCE_TABS, GROWTH_TABS, OPERATIONS_TABS, SETTINGS_TABS, WORKSPACE_TABS } from "@/components/dashboard/nav-config";

const ALL_TABS = [...WORKSPACE_TABS, ...GROWTH_TABS, ...OPERATIONS_TABS, ...FINANCE_TABS, ...SETTINGS_TABS];

/** Título = rótulo da aba ativa (a mais específica, maior `href`) — cobre toda rota que vive
 *  dentro de um `TopNav`. `/` (Dashboard) não tem aba nenhuma, então cai no fallback fixo. */
function useSectionTitle() {
  const pathname = usePathname();
  if (pathname === "/") return "Dashboard";

  const match = ALL_TABS.filter((tab) => pathname === tab.href || pathname.startsWith(`${tab.href}/`)).sort((a, b) => b.href.length - a.href.length)[0];
  return match?.label ?? "Procreating OS";
}

export function DashboardHeader() {
  const title = useSectionTitle();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border/60 bg-background/80 px-6 backdrop-blur lg:px-10">
      <p className="text-sm text-muted-foreground">{title}</p>
      <div className="flex size-8 items-center justify-center rounded-full bg-foreground/10 text-muted-foreground">
        <User className="size-4" />
      </div>
    </header>
  );
}
