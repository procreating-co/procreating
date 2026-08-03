import { notFound } from "next/navigation";
import { Navigation } from "@/components/landing/navigation";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { InfrastructureSection } from "@/components/landing/infrastructure-section";
import { FooterSection } from "@/components/landing/footer-section";
import { getClientConfig, getClientVideos } from "@/lib/clients";

export default async function ClientHome({ params }: { params: Promise<{ client: string }> }) {
  const { client } = await params;
  const [config, videos] = await Promise.all([getClientConfig(client), getClientVideos(client)]);
  if (!config || !videos) notFound();

  const homeHref = `/clients/${client}`;
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
      />
      <HowItWorksSection
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
