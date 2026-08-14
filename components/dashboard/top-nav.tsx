"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { TopNavTab } from "@/components/dashboard/nav-config";
import { cn } from "@/lib/utils";

/**
 * Abas horizontais contextuais — a navegação de subseção de cada área (Growth, Operations,
 * Finance, Settings, Workspace) vive aqui, não mais na sidebar (que só tem os 6 ícones de
 * grupo, sem submenu nenhum). Renderizado uma vez por `layout.tsx` de área, logo abaixo do
 * header da página.
 */
export function TopNav({ tabs }: { tabs: TopNavTab[] }) {
  const pathname = usePathname();

  return (
    <div className="sticky top-16 z-[5] border-b border-border/60 bg-background/80 backdrop-blur">
      <nav className="mx-auto flex max-w-[1400px] gap-1 overflow-x-auto px-6 lg:px-10">
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
    </div>
  );
}
