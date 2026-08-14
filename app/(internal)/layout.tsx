import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession, ADMIN_LOGIN_PATH } from "@/lib/admin/auth";
import { AdminAuthProvider } from "@/lib/admin/auth/auth-context";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ThemeProvider } from "@/lib/theme/theme-provider";
import { getThemeCookie } from "@/lib/theme/theme-cookie";
import { resolveInitialTheme } from "@/lib/theme/resolve";

/** Sobrescreve só dentro do grupo interno — `app/layout.tsx` (raiz, compartilhada com `/clients`
 *  e `/admin`) continua com o título genérico do site. */
export const metadata: Metadata = {
  title: "Procreating OS",
};

/**
 * Gate protegido do ERP interno — `/`, `/operacao/**`, `/(growth)/**`, `/financeiro/**`,
 * `/configuracoes/**`, `/meu-dia/**`, `/reports` (ver `proxy.ts` pro matcher de borda). Mesmo
 * padrão de `app/admin/(protected)/layout.tsx`: `proxy.ts` já redireciona cedo na maioria dos
 * casos (checagem rápida de cookie); esta checagem server-side é a validação de verdade, via
 * `getSession()` (Supabase Auth real desde a Fase 1, Foundation).
 *
 * `<DashboardLayout>` (sidebar + header) mudou de lugar: antes cada `page.tsx` de `/`,
 * `/operacao/*`, `/administracao` renderizava o próprio `<DashboardLayout>`; agora vem daqui,
 * uma vez só, pra todo o grupo — zero mudança visual, só deixa de estar duplicado por página.
 *
 * `<ThemeProvider>` resolve o tema inicial aqui (cookie > conta > "dark") e já renderiza a
 * primeira página no tema certo — zero flash, sem script bloqueante.
 */
export default async function InternalLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect(ADMIN_LOGIN_PATH);

  const cookieTheme = await getThemeCookie();
  const initialTheme = resolveInitialTheme(cookieTheme, session.user.theme);

  return (
    <AdminAuthProvider user={session.user}>
      <ThemeProvider initialTheme={initialTheme}>
        <DashboardLayout>{children}</DashboardLayout>
      </ThemeProvider>
    </AdminAuthProvider>
  );
}
