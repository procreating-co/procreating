import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession, ADMIN_LOGIN_PATH } from "@/lib/admin/auth";
import { AdminAuthProvider } from "@/lib/admin/auth/auth-context";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

/**
 * Gate protegido do ERP interno — `/`, `/operacao/**`, `/administracao/**` (ver `proxy.ts` pro
 * matcher de borda). Mesmo padrão de `app/admin/(protected)/layout.tsx`: `proxy.ts` já
 * redireciona cedo na maioria dos casos (checagem rápida de cookie); esta checagem
 * server-side é a validação de verdade, via `getSession()` (Supabase Auth real desde a Fase 1,
 * Foundation).
 *
 * `<DashboardLayout>` (sidebar + header) mudou de lugar: antes cada `page.tsx` de `/`,
 * `/operacao/*`, `/administracao` renderizava o próprio `<DashboardLayout>`; agora vem daqui,
 * uma vez só, pra todo o grupo — zero mudança visual, só deixa de estar duplicado por página.
 */
export default async function InternalLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect(ADMIN_LOGIN_PATH);

  return (
    <AdminAuthProvider user={session.user}>
      <DashboardLayout>{children}</DashboardLayout>
    </AdminAuthProvider>
  );
}
