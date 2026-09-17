import { ProsHero } from "@/components/pros/pros-hero";
import { ProsWhatWeDo } from "@/components/pros/pros-what-we-do";
import { ProsPhotoCarousel } from "@/components/pros/pros-photo-carousel";
import { ProsSocialVideos } from "@/components/pros/pros-social-videos";
import { ProsFooter } from "@/components/pros/pros-footer";
import { ProsMobileStickyCta } from "@/components/pros/pros-mobile-sticky-cta";
import type { ProsContent } from "@/content/pros/oficinas";

/**
 * Página de prospecção `/pros/[slug]` — pedido explícito desta rodada: sem header (removido —
 * `pros-header.tsx` deletado), Hero centralizado/menor/subido, e a seção de vídeos dividida em
 * três blocos: "O que fazemos" (institucional, 1 vídeo) → "Ensaio Fotográfico" (carrossel de
 * fotos automático, sem link pra galeria) → "Vídeos" (sociais, horizontal-vertical×2-horizontal).
 * Fecha com um footer novo: headline + CTA de WhatsApp (número real).
 *
 * `ProsMobileStickyCta` continua como contato persistente adicional.
 */
export function ProsPage({ content }: { content: ProsContent }) {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-black text-white">
      <ProsHero videoSrc={content.hero.videoSrc} welcomeLines={content.hero.welcomeLines} />
      <ProsWhatWeDo
        eyebrow={content.whatWeDo.eyebrow}
        heading={content.whatWeDo.heading}
        videoLabel={content.whatWeDo.videoLabel}
        video={content.whatWeDo.video}
      />
      <ProsPhotoCarousel heading={content.photos.heading} items={content.photos.items} />
      <ProsSocialVideos
        eyebrow={content.socialVideos.eyebrow}
        heading={content.socialVideos.heading}
        topHorizontal={content.socialVideos.topHorizontal}
        verticalPair={content.socialVideos.verticalPair}
        bottomHorizontal={content.socialVideos.bottomHorizontal}
      />
      <ProsFooter headline={content.footer.headline} ctaLabel={content.footer.ctaLabel} whatsapp={content.whatsapp} slug={content.slug} />
      <ProsMobileStickyCta whatsapp={content.whatsapp} slug={content.slug} />
    </main>
  );
}
