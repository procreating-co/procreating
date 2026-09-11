import type { ProsContent } from "@/content/pros/oficinas";
import { ProsHero } from "@/components/pros/pros-hero";
import { ProsVsl } from "@/components/pros/pros-vsl";
import { ProsVideoGallery } from "@/components/pros/pros-video-gallery";
import { ProsFinalCta } from "@/components/pros/pros-final-cta";
import { ProsFooter } from "@/components/pros/pros-footer";
import { ProsMobileStickyCta } from "@/components/pros/pros-mobile-sticky-cta";

/**
 * Página de prospecção `/pros/[slug]` — EXATAMENTE 4 blocos (regra reafirmada nesta rodada). Hero
 * → VSL → Galeria de vídeos da Pascoal → CTA final (+ o rodapé mínimo da Procreating, cauda
 * natural do bloco 04, não um 5º bloco). Sem header/nav — a página começa direto no Hero.
 *
 * `ProsMobileStickyCta` não é um bloco novo — é um atalho de contato fixo (só ícone, só mobile),
 * pedido explícito desta rodada ("CTA fixa no mobile quando fizer sentido").
 */
export function ProsPage({ content }: { content: ProsContent }) {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-black text-white">
      <ProsHero videoSrc={content.hero.videoSrc} headline={content.hero.headline} />
      <ProsVsl videoSrc={content.vsl.videoSrc} label={content.vsl.label} />
      <ProsVideoGallery label={content.videoGallery.label} items={content.videoGallery.items} />
      <ProsFinalCta headline={content.finalCta.headline} ctaLabel={content.finalCta.ctaLabel} whatsapp={content.whatsapp} slug={content.slug} />
      <ProsFooter whatsapp={content.whatsapp} instagramUrl={content.instagramUrl} slug={content.slug} />
      <ProsMobileStickyCta whatsapp={content.whatsapp} slug={content.slug} />
    </main>
  );
}
