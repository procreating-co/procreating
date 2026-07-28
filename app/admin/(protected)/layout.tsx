import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession, ADMIN_LOGIN_PATH } from "@/lib/admin/auth";
import { AdminAuthProvider } from "@/lib/admin/auth/auth-context";

/**
 * Tudo dentro de `(protected)` exige sessão — esse grupo de rotas não inclui `/admin/login`
 * (que é irmã de `(protected)`, não filha). O `middleware.ts` já redireciona antes de chegar
 * aqui na maioria dos casos (checagem rápida de cookie); esta checagem server-side é a
 * validação de verdade — é aqui que uma implementação real de `AuthProvider` (Supabase Auth)
 * futuramente rejeitaria uma sessão expirada/inválida mesmo com o cookie presente.
 */
export default async function AdminProtectedLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect(ADMIN_LOGIN_PATH);

  return <AdminAuthProvider user={session.user}>{children}</AdminAuthProvider>;
}
