import { Navigation } from "@/components/landing/navigation";
import { HeroSection } from "@/components/landing/hero-section";
import { VideosPlaceholderSection } from "@/components/landing/videos-placeholder-section";
import { FooterSection } from "@/components/landing/footer-section";
import { setembroHorizontalVideos, setembroVerticalVideos } from "@/data/pascoal/setembro-videos";
import type { ClientConfig } from "@/lib/clients";

/**
 * Home da Pascoal a partir de setembro/26 — a apresentação antiga ("Projeto Inicial", fotos,
 * vídeos da Home, prospecção) foi movida pra `/clients/<slug>/public/past`; esta passou a ser a
 * `/clients/<slug>/public`. Reaproveita as MESMAS seções da Home de sempre
 * (`Navigation`/`HeroSection`/`FooterSection`), só numa composição enxuta + a seção "Vídeos"
 * nova. Nada de `data/pascoal/**` foi alterado.
 */
export function PascoalSetembroTemplate({ slug, config }: { slug: string; config: ClientConfig }) {
  const homeHref = `/clients/${slug}/public`;
  const pastHref = `/clients/${slug}/public/past`;

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <Navigation
        brandName={config.brandName}
        homeHref={homeHref}
        galleryHref={pastHref}
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
        stats={{ videos: { count: 12, label: "vídeos produzidos" } }}
      />
      <VideosPlaceholderSection verticalSrcs={setembroVerticalVideos} horizontalSrcs={setembroHorizontalVideos} />
      <FooterSection brandName={config.brandName} legalLine={config.footer.legalLine} backgroundImage={config.footer.backgroundImage} />
    </main>
  );
}
