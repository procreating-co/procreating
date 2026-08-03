import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

/**
 * Chrome persistente da plataforma interna (sidebar + header + conteúdo). Independente do
 * `AdminShell` (`components/admin/shell/`) — não depende de autenticação, propositalmente,
 * já que a Home ainda não tem login.
 */
export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardSidebar />
      <div className="lg:pl-64">
        <DashboardHeader />
        {children}
      </div>
    </div>
  );
}
