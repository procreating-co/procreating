"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import { useAdminUser } from "@/lib/admin/auth/auth-context";
import { NAV_GROUPS } from "@/components/dashboard/nav-config";
import { ProcreatingMark } from "@/components/dashboard/procreating-mark";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { AccountMenu, AccountAvatar } from "@/components/dashboard/account-menu";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type AdminUser = ReturnType<typeof useAdminUser>;

/** Conteúdo da sidebar (logo, 6 grupos, rodapé) — compartilhado entre a versão desktop (hover,
 *  `w-16`↔`w-64`) e a versão mobile (drawer, sempre expandida — não faz sentido "recolher pra só
 *  ícone" dentro de um painel que já ocupa a tela toda). `onNavigate` fecha o drawer mobile ao
 *  clicar num link; `undefined` no desktop (nada a fechar). */
function SidebarContent({ expanded, user, onNavigate }: { expanded: boolean; user: AdminUser; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
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
              onClick={onNavigate}
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
        {/* Mesma classe (px-2.5 py-2, gap-3) dos Link de grupo acima — mesmo eixo esquerdo
         *  garantido, sem matemática de padding pra acertar visualmente (era o motivo do avatar
         *  não alinhar com os ícones: 3 divs aninhados com padding próprio, cada um). */}
        <AccountMenu user={{ name: user.name, email: user.email, avatarUrl: user.avatarUrl }}>
          <button type="button" className="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-foreground/5">
            <AccountAvatar user={user} className="size-7 text-[10px]" />
            <div className={cn("min-w-0 flex-1 overflow-hidden transition-opacity duration-150", expanded ? "opacity-100" : "w-0 opacity-0")}>
              <p className="truncate text-sm">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </button>
        </AccountMenu>

        {/* Toggle de tema ao lado de Configurações (não mais entre o avatar e o rodapé) — os dois
         *  ficam adjacentes tanto expandido (mesma linha) quanto recolhido (mesma coluna). */}
        <div className={cn("mt-1 flex gap-1", expanded ? "items-center" : "flex-col")}>
          <Link
            href="/configuracoes"
            onClick={onNavigate}
            title={expanded ? undefined : "Configurações"}
            className="flex flex-1 items-center gap-3 rounded-md px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            <Settings className="size-4 shrink-0" />
            <span className={cn("overflow-hidden whitespace-nowrap transition-opacity duration-150", expanded ? "opacity-100" : "w-0 opacity-0")}>Configurações</span>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </>
  );
}

/**
 * Desktop (`lg` e acima): recolhida por padrão (`w-16`, só os 6 ícones de grupo) — expande no
 * hover (`w-64`) como **overlay** sobre o conteúdo (`fixed` + `z-index` alto + sombra), não
 * empurra o layout: `DashboardLayout` reserva `lg:pl-16` sempre, então nada dá reflow quando o
 * mouse passa por cima.
 *
 * Mobile/tablet (abaixo de `lg`): hover não existe em touch, então a sidebar vira um drawer
 * (`Sheet`) — aberto pelo botão de menu no `DashboardHeader`, estado compartilhado via
 * `DashboardLayout`. Fecha sozinho ao navegar.
 *
 * Nunca mostra submenu — cada grupo é um link direto pra sua área; a navegação de subseção é o
 * `TopNav` dentro de cada página.
 */
export function DashboardSidebar({ mobileOpen, onMobileOpenChange }: { mobileOpen: boolean; onMobileOpenChange: (open: boolean) => void }) {
  const user = useAdminUser();
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border/60 bg-sidebar transition-[width] duration-200 ease-out lg:flex",
          expanded ? "w-64 shadow-xl" : "w-16"
        )}
      >
        <SidebarContent expanded={expanded} user={user} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="left" className="w-72 p-0 lg:hidden">
          <SheetTitle className="sr-only">Navegação</SheetTitle>
          <SidebarContent expanded user={user} onNavigate={() => onMobileOpenChange(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
