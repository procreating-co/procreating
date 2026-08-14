"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import { useAdminUser } from "@/lib/admin/auth/auth-context";
import { NAV_GROUPS } from "@/components/dashboard/nav-config";
import { ProcreatingMark } from "@/components/dashboard/procreating-mark";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { cn } from "@/lib/utils";

/**
 * Sidebar recolhida por padrão (`w-16`, só os 6 ícones de grupo) — expande no hover (`w-64`,
 * mostra o rótulo ao lado de cada ícone) como **overlay** sobre o conteúdo (`fixed` +
 * `z-index` alto + sombra), não empurra o layout: `DashboardLayout` reserva `lg:pl-16` sempre,
 * então nada dá reflow quando o mouse passa por cima. Nunca mostra submenu — cada grupo é um
 * link direto pra sua área; a navegação de subseção é o `TopNav` dentro de cada página.
 */
export function DashboardSidebar() {
  const pathname = usePathname();
  const user = useAdminUser();
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={cn(
        "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border/60 bg-sidebar transition-[width] duration-200 ease-out lg:flex",
        expanded ? "w-64 shadow-xl" : "w-16"
      )}
    >
      <div className="flex h-16 shrink-0 items-center gap-2.5 px-4">
        <ProcreatingMark className="size-5 shrink-0 text-foreground" />
        <span className={cn("overflow-hidden whitespace-nowrap font-display text-lg tracking-tight transition-opacity duration-150", expanded ? "opacity-100" : "w-0 opacity-0")}>
          Procreating OS
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2.5 py-2">
        {NAV_GROUPS.map((group) => {
          const Icon = group.icon;
          const active = group.matchPrefixes.some((prefix) => (prefix === "/" ? pathname === "/" : pathname === prefix || pathname.startsWith(`${prefix}/`)));
          return (
            <Link
              key={group.key}
              href={group.href}
              title={expanded ? undefined : group.label}
              className={cn(
                "group relative flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors",
                active ? "bg-brand-subtle text-brand" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
              )}
            >
              <Icon className="size-4.5 shrink-0" />
              <span className={cn("overflow-hidden whitespace-nowrap transition-opacity duration-150", expanded ? "opacity-100" : "w-0 opacity-0")}>{group.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/60 p-2.5">
        <div className={cn("flex items-center gap-2 rounded-md px-1 py-1", expanded ? "justify-between" : "flex-col")}>
          <div className="flex min-w-0 items-center gap-3 px-1.5 py-1">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground/10 font-mono text-xs uppercase">{user.name.slice(0, 2)}</div>
            <div className={cn("min-w-0 flex-1 overflow-hidden transition-opacity duration-150", expanded ? "opacity-100" : "w-0 opacity-0")}>
              <p className="truncate text-sm">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
        <Link
          href="/configuracoes"
          title={expanded ? undefined : "Settings"}
          className="mt-1 flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
        >
          <Settings className="size-4 shrink-0" />
          <span className={cn("overflow-hidden whitespace-nowrap transition-opacity duration-150", expanded ? "opacity-100" : "w-0 opacity-0")}>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
