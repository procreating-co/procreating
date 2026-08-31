"use client";

import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/shell/admin-sidebar";

/**
 * Chrome persistente de toda área autenticada do admin (sidebar + área de conteúdo).
 * Depende de `useAdminUser()` (via `AdminSidebar`), então precisa renderizar dentro de
 * `<AdminAuthProvider>` — é isso que `app/admin/(protected)/layout.tsx` garante.
 *
 * Sidebar só aparece em telas `lg:` pra cima; em mobile o conteúdo ocupa a largura toda sem
 * navegação lateral por enquanto (uso do admin é majoritariamente desktop) — um menu mobile
 * fica pra quando isso virar uma necessidade real, não construído especulativamente agora.
 *
 * `admin-shell` (app/globals.css) — sobrescreve só `--font-family-display` pra Instrument Sans
 * (nunca a serif): pedido explícito de nunca usar a fonte serif em nenhuma área interna/admin.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="admin-shell min-h-screen bg-background text-foreground">
      <AdminSidebar />
      <div className="lg:pl-64">{children}</div>
    </div>
  );
}
