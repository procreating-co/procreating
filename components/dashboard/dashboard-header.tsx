"use client";

import { usePathname } from "next/navigation";
import { User } from "lucide-react";
import { DASHBOARD_SECTIONS, NAV_GROUPS } from "@/components/dashboard/nav-config";

/**
 * Título do header = nome do item ativo na sidebar (`NAV_GROUPS`), não mais só "Dashboard"
 * genérico. Antes só reconhecia `DASHBOARD_SECTIONS` (Operação/Administração) — toda rota nova
 * desta fase (Comercial, Marketing, Clientes, Financeiro, Meu Dia, Configurações) caía no
 * fallback. Casamento pelo item mais específico (maior `href`) evita que `/financeiro/custos`
 * e `/financeiro` mostrem o mesmo rótulo por engano quando ambos batem por prefixo.
 */
function useSectionTitle() {
  const pathname = usePathname();
  if (pathname === "/") return "Visão geral";

  const allItems = NAV_GROUPS.flatMap((group) => group.items);
  const match = allItems
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];
  if (match) return match.label;

  const section = DASHBOARD_SECTIONS.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  return section?.label ?? "Dashboard";
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
