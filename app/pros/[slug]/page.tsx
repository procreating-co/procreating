import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllProsSlugs, getProsContent } from "@/content/pros/registry";
import { ProsPage } from "@/components/pros/pros-page";

/**
 * `/pros/[slug]` — páginas de prospecção comercial (pedido explícito), uma por nicho. `01` =
 * oficinas/mecânicas/negócios técnicos, usando a Pascoal Bombas como case. Um nicho novo = um
 * `content/pros/<nome>.ts` + uma linha em `content/pros/registry.ts`, nunca uma rota nova (mesmo
 * padrão de `lib/clients/presentation-registry.ts`).
 *
 * Sem header/nav — a própria página (`ProsPage`) já começa no Hero, pedido explícito.
 */
export async function generateStaticParams() {
  return getAllProsSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const content = getProsContent(slug);
  if (!content) return {};
  return {
    title: content.metaTitle,
    description: content.metaDescription,
    // Página de prospecção enviada diretamente — mesma convenção de não-indexação de
    // `/clients/**` (ver app/robots.ts, que já bloqueia o site inteiro).
    robots: { index: false, follow: false },
  };
}

export default async function ProsSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = getProsContent(slug);
  if (!content) notFound();

  return <ProsPage content={content} />;
}
