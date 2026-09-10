import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getClientConfig } from "@/lib/clients";
import { getClientPresentation } from "@/lib/clients/presentation-registry";
import { Navigation } from "@/components/landing/navigation";
import { HeroSection } from "@/components/landing/hero-section";
import { VideosPlaceholderSection } from "@/components/landing/videos-placeholder-section";
import { FooterSection } from "@/components/landing/footer-section";

/**
 * `/clients/[client]/public/setembro-26` — nova versão da apresentação da Pascoal pra setembro
 * de 2026. Reaproveita as MESMAS seções da Home (`Navigation`/`HeroSection`/`FooterSection`,
 * `components/landing/**`), só com uma composição enxuta:
 *
 *  - Nav: o CTA "Acessar Galeria" vira "Acessar Projeto Inicial" e aponta pra Home existente
 *    (`/clients/<slug>/public`); sem CTA de prospecção (a estrutura de Projeto Inicial pra
 *    baixo não aparece aqui).
 *  - Hero: parágrafo "Os novos materiais estão aqui..." e só a métrica de vídeos (08).
 *  - Fora o Hero, entra só a seção "Vídeos" nova (02 verticais + 10 horizontais, placeholders)
 *    e o rodapé de sempre. O bloco "Projeto Inicial" e tudo abaixo dele (fotos, vídeos da Home,
 *    prospecção) NÃO é renderizado.
 *
 * Nada da Home original (`page.tsx`) nem dos dados (`data/pascoal/**`) foi alterado.
 */

export async function generateMetadata({ params }: { params: Promise<{ client: string }> }): Promise<Metadata> {
  const { client } = await params;
  const entry = getClientPresentation(client);
  if (!entry || entry.template !== "posicionamento-pro" || entry.slug !== "pascoal") return {};
  const config = await getClientConfig(entry.slug);
  if (!config) return {};
  return {
    title: `${config.brandName} | Setembro 2026`,
    description: config.metadata.description,
    alternates: { canonical: `/clients/${entry.slug}/public/setembro-26` },
    robots: { index: false, follow: false },
  };
}

export default async function ClientSetembro26({ params }: { params: Promise<{ client: string }> }) {
  const { client } = await params;
  const entry = getClientPresentation(client);
  // Exclusivo da Pascoal — o conteúdo de setembro ("redes da Julia e Pascoal", métrica de 08
  // vídeos) é dela; qualquer outro slug cai em 404.
  if (!entry || entry.template !== "posicionamento-pro" || entry.slug !== "pascoal") notFound();

  const config = await getClientConfig(entry.slug);
  if (!config) notFound();

  const homeHref = `/clients/${entry.slug}/public/setembro-26`;
  const projetoInicialHref = `/clients/${entry.slug}/public`;

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <Navigation
        brandName={config.brandName}
        homeHref={homeHref}
        galleryHref={projetoInicialHref}
        galleryLabel="Acessar Projeto Inicial"
        galleryIcon="project"
        prospeccaoCtaLabel={config.nav.prospeccaoCtaLabel}
        showProspeccaoCta={false}
        extraLink={config.nav.extraLink}
      />
      <HeroSection
        welcomeLines={config.hero.welcomeLines}
        backgroundVideo={config.hero.backgroundVideo}
        paragraph="Os novos materiais estão aqui..."
        stats={{ videos: { count: 8, label: "vídeos produzidos" } }}
      />
      <VideosPlaceholderSection />
      <FooterSection brandName={config.brandName} legalLine={config.footer.legalLine} backgroundImage={config.footer.backgroundImage} />
    </main>
  );
}
