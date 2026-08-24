import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getPortalSession, PORTAL_LOGIN_PATH } from "@/lib/portal/auth";
import { PortalHeader } from "@/components/portal/portal-header";
import { PortalNav } from "@/components/portal/portal-nav";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Portal — ${slug}`, robots: { index: false, follow: false } };
}

/**
 * Camada de app EM CIMA da RLS (Fase A), não substituindo — `getPortalSession()` resolve
 * `get_my_portal_client()` (sempre a partir de `auth.uid()`), e aqui confirmamos que o slug da
 * URL bate com o cliente da própria sessão. Se não bater (cliente A tentando abrir a URL de B,
 * ou sessão de staff sem vínculo de Portal), `notFound()` — nunca um redirect que revele que o
 * slug existe. Mesmo padrão de `app/clients/[client]/(workspace)/layout.tsx` pra slug
 * desconhecido.
 */
export default async function PortalLayout({ children, params }: { children: ReactNode; params: Promise<Params> }) {
  const { slug } = await params;
  const session = await getPortalSession();
  if (!session) redirect(PORTAL_LOGIN_PATH);
  if (session.user.clientSlug !== slug) notFound();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-[900px] flex-col gap-8 px-6 py-10 lg:px-10">
        <PortalHeader clientName={session.user.clientName} />
        <PortalNav slug={slug} />
        <main className="flex flex-col gap-8">{children}</main>
      </div>
    </div>
  );
}
