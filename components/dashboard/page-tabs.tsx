"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export type PageTab = { key: string; label: string };

/**
 * Abas internas de página — Growth e Finance viraram uma rota só cada (antes eram 6-7 rotas
 * separadas); isto é a navegação entre as seções dentro dela. Mesmo visual (`border-b-2`,
 * `border-brand` ativo) que `dashboard-header.tsx` já usa pro top-nav das áreas que ainda têm
 * sub-rotas de verdade (Operação) — consistência visual sem duplicar componente.
 *
 * `<Link>` real com `?param=` (mesmo padrão de `period-select.tsx`), não um Radix Tabs (não
 * existe no projeto, não precisa existir pra isto) — URL navegável/compartilhável, entra no
 * histórico real do browser (back/forward funcionam), primeira aba = URL limpa (sem `?tab=`).
 */
export function PageTabs({ tabs, activeKey, paramKey = "tab", extraParams }: { tabs: PageTab[]; activeKey: string; paramKey?: string; extraParams?: Record<string, string> }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div className="flex items-center gap-1 border-b border-border/60">
      {tabs.map((tab, index) => {
        const params = new URLSearchParams(searchParams.toString());
        if (index === 0) params.delete(paramKey);
        else params.set(paramKey, tab.key);
        if (extraParams) {
          for (const [key, value] of Object.entries(extraParams)) params.set(key, value);
        }
        const query = params.toString();
        const active = activeKey === tab.key;
        return (
          <Link
            key={tab.key}
            href={query ? `${pathname}?${query}` : pathname}
            className={cn(
              "shrink-0 whitespace-nowrap border-b-2 px-1 py-2.5 text-sm transition-colors",
              active ? "border-brand text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
