import { ProsHero } from "@/components/pros/pros-hero";
import { ProsVideoShowcase } from "@/components/pros/pros-video-showcase";
import { ProsFooter } from "@/components/pros/pros-footer";
import { ProsMobileStickyCta } from "@/components/pros/pros-mobile-sticky-cta";
import type { ProsContent } from "@/content/pros/oficinas";

/**
 * Página de prospecção `/pros/[slug]` — pedido explícito (rodada "foco no mobile"): sem header
 * (nada de marca fixa no topo, mais espaço útil pro Hero em telas pequenas — `pros-header.tsx`
 * foi deletado). Hero → seção "O que fazemos" (fluxo alternado texto→vídeo→texto→vídeo) → Footer.
 *
 * `ProsMobileStickyCta` (botão flutuante de WhatsApp, só ícone) continua como contato persistente
 * — sem header nem CTA em outro lugar, segue sendo o único jeito direto de falar com a
 * Procreating.
 */
export function ProsPage({ content }: { content: ProsContent }) {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-black text-white">
      <ProsHero videoSrc={content.hero.videoSrc} welcomeLines={content.hero.welcomeLines} />
      <ProsVideoShowcase
        eyebrow={content.videos.eyebrow}
        heading={content.videos.heading}
        video1={content.videos.video1}
        caption={content.videos.caption}
        video2={content.videos.video2}
      />
      <ProsFooter brandName={content.footer.brandName} />
      <ProsMobileStickyCta whatsapp={content.whatsapp} slug={content.slug} />
    </main>
  );
}
