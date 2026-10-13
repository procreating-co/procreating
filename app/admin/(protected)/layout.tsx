import type { ReactNode } from "react";
import { getSession } from "@/lib/admin/auth";
import { AdminAuthProvider } from "@/lib/admin/auth/auth-context";
import { AdminShell } from "@/components/admin/shell/admin-shell";
import { AutoLoginMissing } from "@/components/admin/auto-login-missing";

/**
 * Tudo dentro de `(protected)` exige sessão — esse grupo de rotas não inclui `/admin/login`
 * (que é irmã de `(protected)`, não filha). O `proxy.ts` já redireciona antes de chegar aqui
 * na maioria dos casos (checagem rápida de cookie); esta checagem server-side é a validação
 * de verdade — é aqui que uma implementação real de `AuthProvider` (Supabase Auth)
 * futuramente rejeitaria uma sessão expirada/inválida mesmo com o cookie presente.
 */
export default async function AdminProtectedLayout({ children }: { children: ReactNode }) {
  // Painel público: `getSession()` já tenta o auto-login na conta de serviço (owner). Sem sessão
  // aqui significa configuração ausente — mostra instrução em vez de redirecionar pro login.
  const session = await getSession();
  if (!session) return <AutoLoginMissing />;

  return (
    <AdminAuthProvider user={session.user}>
      <AdminShell>{children}</AdminShell>
    </AdminAuthProvider>
  );
}
