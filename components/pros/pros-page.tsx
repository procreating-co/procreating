import type { ProsContent } from "@/content/pros/oficinas";
import { ProsHero } from "@/components/pros/pros-hero";
import { ProsVsl } from "@/components/pros/pros-vsl";
import { ProsVideoGallery } from "@/components/pros/pros-video-gallery";
import { ProsFinalCta } from "@/components/pros/pros-final-cta";
import { ProsFooter } from "@/components/pros/pros-footer";

/**
 * Página de prospecção `/pros/[slug]` — pedido explícito (redesenho): EXATAMENTE 4 blocos, nada
 * a mais. Hero → VSL → Galeria de vídeos da Pascoal → CTA final (+ o rodapé mínimo da Procreating,
 * que é a cauda natural do bloco 04, não um 5º bloco). Sem header/nav — a página começa direto no
 * Hero.
 */
export function ProsPage({ content }: { content: ProsContent }) {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-black text-white">
      <ProsHero videoSrc={content.hero.videoSrc} headline={content.hero.headline} />
      <ProsVsl videoSrc={content.vsl.videoSrc} label={content.vsl.label} />
      <ProsVideoGallery label={content.videoGallery.label} items={content.videoGallery.items} />
      <ProsFinalCta headline={content.finalCta.headline} ctaLabel={content.finalCta.ctaLabel} whatsapp={content.whatsapp} />
      <ProsFooter whatsapp={content.whatsapp} instagramUrl={content.instagramUrl} />
    </main>
  );
}
