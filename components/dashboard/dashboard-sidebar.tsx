"use client";

import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut } from "lucide-react";
import { signOutAction } from "@/app/admin/(protected)/actions";
import { useAdminUser } from "@/lib/admin/auth/auth-context";
import { NAV_GROUPS } from "@/components/dashboard/nav-config";
import { NavigationItem } from "@/components/dashboard/navigation-item";
import { NavGroup } from "@/components/dashboard/nav-group";

/**
 * Navegação em grupos colapsáveis (Fase 1, Foundation) — antes disso, a sidebar era uma lista
 * plana de 2 links (`DASHBOARD_SECTIONS`, ainda existe e continua alimentando `/operacao` e
 * `/administracao`, só não é mais o que a sidebar renderiza). `NAV_GROUPS`
 * (`components/dashboard/nav-config.ts`) traz a estrutura final de navegação do Procreating OS.
 *
 * Bloco de usuário + sair no rodapé segue o mesmo padrão de `components/admin/shell/
 * admin-sidebar.tsx` (mesma `useAdminUser()`, mesma `signOutAction`) — desde a Fase 1
 * (Foundation), `/`, `/operacao` e `/administracao` têm sessão real, então passam a mostrar
 * quem está logado, primeiro pedaço visível da convergência entre os dois shells de admin.
 */
export function DashboardSidebar() {
  const pathname = usePathname();
  const user = useAdminUser();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-border/60 bg-card/40 lg:flex">
      <div className="flex h-16 items-center px-6">
        <span className="font-display text-lg tracking-tight">Procreating</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        <NavigationItem href="/" label="Visão geral" icon={LayoutDashboard} active={pathname === "/"} />
        <div className="my-2 h-px bg-border/60" />
        {NAV_GROUPS.map((group) => (
          <NavGroup key={group.key} group={group} />
        ))}
      </nav>

      <div className="border-t border-border/60 p-3">
        <div className="flex items-center gap-3 rounded-md px-3 py-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground/10 font-mono text-xs uppercase">
            {user.name.slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            <LogOut className="size-4" />
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
