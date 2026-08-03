import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getClientConfig } from "@/lib/clients";
import { getAllPresentationSlugs, getClientPresentation } from "@/lib/clients/presentation-registry";

/** Pré-gera todo cliente do registry — legado ("posicionamento-pro") e novo ("presentation") igualmente. */
export async function generateStaticParams() {
  const slugs = getAllPresentationSlugs();
  return slugs.map((client) => ({ client }));
}

export async function generateMetadata({ params }: { params: Promise<{ client: string }> }): Promise<Metadata> {
  const { client } = await params;
  const entry = getClientPresentation(client);
  if (!entry) return {};

  if (entry.template === "presentation") {
    return {
      title: entry.content.metaTitle,
      description: entry.content.metaDescription,
      alternates: { canonical: `/clients/${client}/public` },
      // Reforça o `app/robots.ts`: entregas de cliente não devem aparecer em buscadores.
      robots: { index: false, follow: false },
    };
  }

  // "posicionamento-pro" (hoje só Pascoal) — mesma metadata de sempre, só buscada a partir do
  // slug resolvido pelo registry em vez de assumida.
  const config = await getClientConfig(entry.slug);
  if (!config) return {};

  const { title, description, ogImage } = config.metadata;
  const image = ogImage ?? config.logo;
  const path = `/clients/${entry.slug}/public`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: config.brandName,
      locale: "pt_BR",
      type: "website",
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    robots: { index: false, follow: false },
  };
}

export default async function ClientLayout({ children, params }: { children: ReactNode; params: Promise<{ client: string }> }) {
  const { client } = await params;
  const entry = getClientPresentation(client);
  if (!entry) notFound();

  if (entry.template === "presentation") {
    return <div style={{ "--client-accent": entry.content.accentColor } as CSSProperties}>{children}</div>;
  }

  const config = await getClientConfig(entry.slug);
  if (!config) notFound();

  return <div style={{ "--client-accent": config.theme.accentColor } as CSSProperties}>{children}</div>;
}
