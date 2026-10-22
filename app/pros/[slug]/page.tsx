import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllProsSlugs, getProsContent } from "@/content/pros/registry";
import { ProsPage } from "@/components/pros/pros-page";
import { CreativeSplash } from "@/components/pros/creative-splash";
import { getClientConfig, getClientVideos } from "@/lib/clients";
import { PosicionamentoProTemplate } from "@/components/templates/posicionamento-pro-template";

/**
 * `/pros/[slug]` — páginas de prospecção comercial, uma por nicho. `01` = oficinas/mecânicas/
 * negócios técnicos, usando a Pascoal Bombas como case (renderer próprio `ProsPage`). Um nicho
 * novo nesse formato = um `content/pros/<nome>.ts` + uma linha em `content/pros/registry.ts`.
 *
 * `02` é diferente: é uma VITRINE que reaproveita o template "posicionamento-pro" (o mesmo de
 * `/clients/elenita/public`), com a marca Procreating Co. Seu conteúdo vem de `data/pros-02/*`
 * (registrado em `lib/clients/registry.ts`), e é mapeado aqui em `POSICIONAMENTO_PROS`. Por isso
 * a rota sabe renderizar os dois formatos conforme o slug.
 */
const POSICIONAMENTO_PROS: Record<string, string> = {
  "02": "pros-02", // slug da rota -> chave no registry de clientes (data/pros-02)
};

// `03` é uma splash tipográfica própria (ver `CreativeSplash`), fora dos dois formatos acima.
const SPLASH_PROS = new Set(["03"]);

export async function generateStaticParams() {
  return [...getAllProsSlugs(), ...Object.keys(POSICIONAMENTO_PROS), ...SPLASH_PROS].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const path = `/pros/${slug}`;

  if (SPLASH_PROS.has(slug)) {
    const title = "Procreating — Marketing Criativo";
    const description = "Marketing criativo para negócios e marcas.";
    return {
      title,
      description,
      alternates: { canonical: path },
      robots: { index: false, follow: false },
      openGraph: { title, description, url: path, siteName: "Procreating", locale: "pt_BR", type: "website" },
      twitter: { card: "summary_large_image", title, description },
    };
  }

  const clientSlug = POSICIONAMENTO_PROS[slug];
  if (clientSlug) {
    const config = await getClientConfig(clientSlug);
    if (!config) return {};
    const { title, description, ogImage } = config.metadata;
    const image = ogImage ?? config.logo;
    return {
      title,
      description,
      alternates: { canonical: path },
      robots: { index: false, follow: false },
      openGraph: { title, description, url: path, siteName: config.brandName, locale: "pt_BR", type: "website", images: [{ url: image }] },
      twitter: { card: "summary_large_image", title, description, images: [image] },
    };
  }

  const content = getProsContent(slug);
  if (!content) return {};
  return {
    title: content.metaTitle,
    description: content.metaDescription,
    alternates: { canonical: path },
    // Página de prospecção enviada diretamente — mesma convenção de não-indexação de
    // `/clients/**` (ver app/robots.ts, que já bloqueia o site inteiro).
    robots: { index: false, follow: false },
    openGraph: {
      title: content.metaTitle,
      description: content.metaDescription,
      url: path,
      siteName: "Procreating",
      locale: "pt_BR",
      type: "website",
      images: [{ url: content.ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: content.metaTitle,
      description: content.metaDescription,
      images: [content.ogImage],
    },
  };
}

export default async function ProsSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Splash tipográfica própria (ex.: `/pros/03`).
  if (SPLASH_PROS.has(slug)) return <CreativeSplash />;

  // Vitrine no template "posicionamento-pro" (ex.: `/pros/02`).
  const clientSlug = POSICIONAMENTO_PROS[slug];
  if (clientSlug) {
    const [config, videos] = await Promise.all([getClientConfig(clientSlug), getClientVideos(clientSlug)]);
    if (!config || !videos) notFound();
    return (
      <div style={{ "--client-accent": config.theme.accentColor } as CSSProperties}>
        <PosicionamentoProTemplate slug={clientSlug} config={config} videos={videos} homeHref={`/pros/${slug}`} />
      </div>
    );
  }

  // Página de prospecção padrão (renderer próprio).
  const content = getProsContent(slug);
  if (!content) notFound();
  return <ProsPage content={content} />;
}
