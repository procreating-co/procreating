"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

function SidebarLabel({ expanded, className, children }: { expanded: boolean; className?: string; children: ReactNode }) {
  return <span className={cn("overflow-hidden whitespace-nowrap text-sm transition-opacity duration-150", expanded ? "opacity-100" : "w-0 opacity-0", className)}>{children}</span>;
}

function SidebarContent({ expanded, user, onNavigate }: { expanded: boolean; user: AdminUser; onNavigate?: () => void }) {
  const pathname = usePathname();

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

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {NAV_GROUPS.map((group) => {
          const Icon = group.icon;
          const active = group.matchPrefixes.some((prefix) => (prefix === "/" ? pathname === "/" : pathname === prefix || pathname.startsWith(`${prefix}/`)));
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
