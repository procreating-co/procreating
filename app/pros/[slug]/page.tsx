import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllProsSlugs, getProsContent } from "@/content/pros/registry";
import { ProsPage } from "@/components/pros/pros-page";

/**
 * `/pros/[slug]` — páginas de prospecção comercial, uma por nicho. `01` = oficinas/mecânicas/
 * negócios técnicos, usando a Pascoal Bombas como case. Um nicho novo = um `content/pros/<nome>.ts`
 * + uma linha em `content/pros/registry.ts`, nunca uma rota nova (mesmo padrão de
 * `lib/clients/presentation-registry.ts`) — já era assim antes desta rodada, mantido.
 *
 * Sem header/nav — a própria página (`ProsPage`) já começa no Hero. Estrutura continua travada em
 * 4 blocos (pedido explícito, reafirmado nesta rodada) — esta rodada só poliu SEO/acessibilidade/
 * analytics dentro do que já existe, sem adicionar seção nova.
 */
export async function generateStaticParams() {
  return getAllProsSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const content = getProsContent(slug);
  if (!content) return {};
  const path = `/pros/${slug}`;
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
  const content = getProsContent(slug);
  if (!content) notFound();

  return <ProsPage content={content} />;
}
