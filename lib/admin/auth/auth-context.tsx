"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { AdminUser } from "@/lib/admin/auth/types";

const AdminAuthContext = createContext<AdminUser | null>(null);

/**
 * Hidrata o contexto com o usuário já resolvido no servidor (`app/admin/(protected)/layout.tsx`
 * chama `getSession()` e passa `session.user` aqui) — evita qualquer componente cliente
 * precisar buscar a sessão de novo.
 */
export function AdminAuthProvider({ user, children }: { user: AdminUser; children: ReactNode }) {
  return <AdminAuthContext.Provider value={user}>{children}</AdminAuthContext.Provider>;
}

/** Só pode ser chamado dentro de `(protected)` — fora dali não existe usuário garantido. */
export function useAdminUser(): AdminUser {
  const user = useContext(AdminAuthContext);
  if (!user) {
    throw new Error("useAdminUser() precisa estar dentro de <AdminAuthProvider> (área autenticada do admin).");
  }
  return user;
}
