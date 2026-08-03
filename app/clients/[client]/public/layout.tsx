import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getClientConfig, getRegisteredClientSlugs } from "@/lib/clients";
import { getClientPresentation } from "@/lib/clients/presentation-registry";

export async function generateStaticParams() {
  const slugs = await getRegisteredClientSlugs();
  return slugs.map((client) => ({ client }));
}

export async function generateMetadata({ params }: { params: Promise<{ client: string }> }): Promise<Metadata> {
  const { client } = await params;

  // Pipeline legado (hoje só Pascoal) — inalterado.
  const config = await getClientConfig(client);
  if (config) {
    const { title, description, ogImage } = config.metadata;
    const image = ogImage ?? config.logo;
    const path = `/clients/${client}/public`;

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
      // Reforça o `app/robots.ts`: entregas de cliente não devem aparecer em buscadores.
      robots: { index: false, follow: false },
    };
  }

  // Pipeline novo, multi-cliente (ex.: Elenita) — sem ClientConfig, sem data/<slug>/.
  const presentation = getClientPresentation(client);
  if (presentation) {
    return {
      title: presentation.metaTitle,
      description: presentation.metaDescription,
      alternates: { canonical: `/clients/${client}/public` },
      robots: { index: false, follow: false },
    };
  }

  return {};
}

export default async function ClientLayout({ children, params }: { children: ReactNode; params: Promise<{ client: string }> }) {
  const { client } = await params;

  const config = await getClientConfig(client);
  if (config) {
    return <div style={{ "--client-accent": config.theme.accentColor } as CSSProperties}>{children}</div>;
  }

  const presentation = getClientPresentation(client);
  if (presentation) {
    return <div style={{ "--client-accent": presentation.accentColor } as CSSProperties}>{children}</div>;
  }

  notFound();
}
