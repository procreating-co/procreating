"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Settings } from "lucide-react";
import { useAdminUser } from "@/lib/admin/auth/auth-context";
import { NAV_GROUPS } from "@/components/dashboard/nav-config";
import { ProcreatingMark } from "@/components/dashboard/procreating-mark";
import { AccountMenu } from "@/components/dashboard/account-menu";
import { AccountAvatar } from "@/components/dashboard/account-avatar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type AdminUser = ReturnType<typeof useAdminUser>;

function SidebarIconSlot({ children, active }: { children: ReactNode; active?: boolean }) {
  return (
    <span className="flex size-16 shrink-0 items-center justify-center">
      <span
        className={cn(
          "flex size-12 items-center justify-center rounded-md transition-colors",
          active ? "bg-sidebar-accent text-brand" : "text-sidebar-muted-foreground group-hover:bg-sidebar-hover group-hover:text-sidebar-foreground"
        )}
      >
        {children}
      </span>
    </span>
  );
}

/** Índice do grupo ativo em `NAV_GROUPS` pra um pathname — mesma regra de "está ativo" usada no
 *  highlight visual da sidebar, extraída aqui pra ser reaproveitada pela navegação por teclado
 *  (seta ↑/↓) sem duplicar a lógica. */
function activeGroupIndex(pathname: string): number {
  return NAV_GROUPS.findIndex((group) => group.matchPrefixes.some((prefix) => (prefix === "/" ? pathname === "/" : pathname === prefix || pathname.startsWith(`${prefix}/`))));
}

function SidebarLabel({ expanded, className, children }: { expanded: boolean; className?: string; children: ReactNode }) {
  return <span className={cn("overflow-hidden whitespace-nowrap text-sm transition-opacity duration-150", expanded ? "opacity-100" : "w-0 opacity-0", className)}>{children}</span>;
}

function SidebarContent({ expanded, user, onNavigate }: { expanded: boolean; user: AdminUser; onNavigate?: () => void }) {
  const pathname = usePathname();
  const activeIndex = activeGroupIndex(pathname);

  return (
    <>
      <Link href="/workspace" onClick={onNavigate} className="flex h-16 shrink-0 items-center">
        <SidebarIconSlot>
          <ProcreatingMark className="size-7 shrink-0 text-foreground" />
        </SidebarIconSlot>
        <SidebarLabel expanded={expanded} className="font-display text-lg tracking-tight">
          Procreating OS
        </SidebarLabel>
      </Link>

      {/* `overflow-x-hidden` ao lado de `overflow-y-auto` — regra do CSS: quando só um eixo tem
       *  overflow definido como auto/hidden/scroll, o navegador resolve o OUTRO eixo também como
       *  auto (não `visible`), então qualquer overflow horizontal mínimo (subpixel de ícone/
       *  label) vira uma barra de scroll horizontal fina, mesmo sem conteúdo vazando de verdade.
       *  Travando `overflow-x-hidden` explicitamente, só o eixo vertical rola.
       *  `.scrollbar-hide` (pedido explícito — "excluir visualmente a toggle bar lateral de
       *  scroll, mantendo a tecnologia atual de scroll com o mouse") esconde a barra nativa sem
       *  desativar a rolagem por mouse/trackpad — mesma utility já usada no Pipeline
       *  (`app/globals.css`), nenhuma classe nova. */}
      <nav className="flex flex-1 flex-col gap-1 overflow-x-hidden overflow-y-auto scrollbar-hide">
        {NAV_GROUPS.map((group, index) => {
          const Icon = group.icon;
          const active = index === activeIndex;
          return (
            <Link key={group.key} href={group.href} onClick={onNavigate} title={expanded ? undefined : group.label} className="group flex items-center transition-colors">
              <SidebarIconSlot active={active}>
                <Icon className="size-4.5" />
              </SidebarIconSlot>
              <SidebarLabel expanded={expanded} className={active ? "text-brand" : "text-sidebar-muted-foreground group-hover:text-sidebar-foreground"}>
                {group.label}
              </SidebarLabel>
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-1 border-t border-border/60 py-2.5">
        <AccountMenu user={{ name: user.name, email: user.email, avatarUrl: user.avatarUrl }}>
          <button type="button" className="group flex w-full items-center text-left text-sm text-sidebar-foreground transition-colors">
            <SidebarIconSlot>
              <AccountAvatar user={user} className="size-7 text-[10px]" />
            </SidebarIconSlot>
            <SidebarLabel expanded={expanded} className="min-w-0 flex-1">
              <p className="truncate text-sm">{user.name}</p>
              <p className="truncate text-xs text-sidebar-muted-foreground">{user.email}</p>
            </SidebarLabel>
          </button>
        </AccountMenu>

        <Link href="/configuracoes" onClick={onNavigate} title={expanded ? undefined : "Configurações"} className="group flex items-center text-sm text-sidebar-muted-foreground transition-colors">
          <SidebarIconSlot>
            <Settings className="size-4" />
          </SidebarIconSlot>
          <SidebarLabel expanded={expanded} className="group-hover:text-sidebar-foreground">
            Configurações
          </SidebarLabel>
        </Link>
      </div>
    </>
  );
}

export function DashboardSidebar({ mobileOpen, onMobileOpenChange }: { mobileOpen: boolean; onMobileOpenChange: (open: boolean) => void }) {
  const user = useAdminUser();
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Pedido explícito: seta ↓ troca de área na ordem de `NAV_GROUPS` (Workspace → Dashboard →
  // Financeiro → Comercial → Operação → volta pro início); seta ↑ faz o caminho inverso (par
  // natural, não pedido literalmente mas complementar ao mesmo mecanismo). Ignora quando o alvo
  // do evento é um campo de digitação/seletor/menu — senão roubaria a seta de navegação de texto
  // dentro de inputs, `<select>`, diálogos e menus que já usam ↑/↓ pra outra coisa.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true'], [role='listbox'], [role='menu'], [role='dialog'], [role='combobox'], [role='option']")) return;

      const currentIndex = activeGroupIndex(pathname);
      if (currentIndex === -1) return;
      const delta = event.key === "ArrowDown" ? 1 : -1;
      const nextIndex = (currentIndex + delta + NAV_GROUPS.length) % NAV_GROUPS.length;
      event.preventDefault();
      router.push(NAV_GROUPS[nextIndex].href);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pathname, router]);

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
