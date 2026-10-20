import type { Metadata } from "next";
import { Navigation } from "@/components/landing/navigation";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { InfrastructureSection } from "@/components/landing/infrastructure-section";
import { FooterSection } from "@/components/landing/footer-section";
import { OfflineHowItWorksSection } from "@offline/components/offline-how-it-works-section";
import { getOfflinePresentation, OFFLINE_CLIENT_SLUG } from "@offline/lib/offline-data";

/**
 * Versão offline de `/clients/pascoal/public/past` (app online: `app/clients/[client]/public/past`
 * → `PosicionamentoProTemplate`). Mesmo JSX do template, seção por seção, com os mesmos componentes
 * do site online — só a seção de vídeos é a variante offline (player local, clique = play com áudio).
 */
export async function generateMetadata(): Promise<Metadata> {
  const { config } = await getOfflinePresentation();
  return { title: `${config.brandName} | Projeto Inicial`, description: config.metadata.description };
}

export default async function OfflinePascoalPast() {
  const { config, videos } = await getOfflinePresentation();
  const homeHref = `/clients/${OFFLINE_CLIENT_SLUG}/public`;
  const galleryHref = `${homeHref}/galeria`;
  const prospeccaoHref = `${homeHref}/prospeccao`;

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <Navigation
        brandName={config.brandName}
        homeHref={homeHref}
        galleryHref={galleryHref}
        galleryLabel={config.nav.galleryLabel}
        prospeccaoCtaLabel={config.nav.prospeccaoCtaLabel}
        showProspeccaoCta={config.prospeccao !== null}
        extraLink={config.nav.extraLink}
      />
      <HeroSection welcomeLines={config.hero.welcomeLines} backgroundVideo={config.hero.backgroundVideo} paragraph={config.hero.paragraph} stats={config.hero.stats} />
      <FeaturesSection
        eyebrow={config.features.eyebrow}
        heading={config.features.heading}
        blockNumber={config.features.blockNumber}
        blockTitle={config.features.blockTitle}
        subtitle={config.features.subtitle}
        galleryButtonLabel={config.features.galleryButtonLabel}
        galleryHref={galleryHref}
        photos={config.features.photos}
        backgroundVideo={config.features.backgroundVideo}
      />
      <OfflineHowItWorksSection
        videos={videos}
        eyebrow={config.videosSection.eyebrow}
        headingPrefix={config.videosSection.headingPrefix}
        headingSuffix={config.videosSection.headingSuffix}
        blockNumber={config.videosSection.blockNumber}
        blockTitle={config.videosSection.blockTitle}
        subtitle={config.videosSection.subtitle}
        acquisitionEyebrow={config.videosSection.acquisitionEyebrow}
        acquisitionHeadingPrefix={config.videosSection.acquisitionHeadingPrefix}
        acquisitionHeadingSuffix={config.videosSection.acquisitionHeadingSuffix}
      />
      {config.prospeccao && <InfrastructureSection prospeccao={config.prospeccao} prospeccaoHref={prospeccaoHref} />}
      <FooterSection brandName={config.brandName} legalLine={config.footer.legalLine} backgroundImage={config.footer.backgroundImage} />
    </main>
  );
}
