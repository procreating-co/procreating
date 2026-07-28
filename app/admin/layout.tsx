import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * Wrapper compartilhado por TODO o `/admin` (login incluso) — só metadata, sem checagem de
 * sessão aqui (isso é `(protected)/layout.tsx`, que não inclui `/admin/login`). O `disallow: '/'`
 * em `app/robots.ts` já bloqueia o admin inteiro pra crawlers; o `robots` abaixo reforça via
 * meta tag pra quem ignora `robots.txt`.
 */
export const metadata: Metadata = {
  title: "Painel Procreating",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
