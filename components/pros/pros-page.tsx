"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { ActiveVideo } from "@/components/landing/video-lightbox";
import type { ProsContent } from "@/content/pros/oficinas";
import { ProsHero } from "@/components/pros/pros-hero";
import { ProsVsl } from "@/components/pros/pros-vsl";
import { ProsVideoGallery } from "@/components/pros/pros-video-gallery";
import { ProsFinalCta } from "@/components/pros/pros-final-cta";
import { ProsFooter } from "@/components/pros/pros-footer";
import { ProsMobileStickyCta } from "@/components/pros/pros-mobile-sticky-cta";

const VideoLightbox = dynamic(() => import("@/components/landing/video-lightbox"));

/**
 * Página de prospecção `/pros/[slug]` — EXATAMENTE 4 blocos (regra reafirmada em duas rodadas
 * seguidas). Hero → VSL → Galeria de vídeos da Pascoal → CTA final (+ o rodapé mínimo da
 * Procreating, cauda natural do bloco 04, não um 5º bloco). Sem header/nav — a página começa
 * direto no Hero.
 *
 * Estado do lightbox fica aqui, no topo: Hero (clique no play do "pill") E Galeria (clique em
 * qualquer vídeo) abrem o MESMO player em tela cheia (`VideoLightbox`, reaproveitado — pedido
 * explícito "todos os vídeos devem ser possível clicar e assistir em fullscreen") — um estado só,
 * nunca dois players montados ao mesmo tempo.
 *
 * `ProsMobileStickyCta` não é um bloco novo — é um atalho de contato fixo (só ícone, só mobile).
 */
export function ProsPage({ content }: { content: ProsContent }) {
  const [activeVideo, setActiveVideo] = useState<ActiveVideo | null>(null);
  const openVideo = (src: string) => setActiveVideo({ poster: "", title: "Vídeo", videoSrc: src });

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-black text-white">
      <ProsHero videoSrc={content.hero.videoSrc} headline={content.hero.headline} onOpenVideo={openVideo} />
      <ProsVsl videoSrc={content.vsl.videoSrc} label={content.vsl.label} onOpenVideo={openVideo} />
      <ProsVideoGallery label={content.videoGallery.label} items={content.videoGallery.items} onOpenVideo={openVideo} />
      <ProsFinalCta headline={content.finalCta.headline} ctaLabel={content.finalCta.ctaLabel} whatsapp={content.whatsapp} slug={content.slug} />
      <ProsFooter whatsapp={content.whatsapp} instagramUrl={content.instagramUrl} slug={content.slug} />
      <ProsMobileStickyCta whatsapp={content.whatsapp} slug={content.slug} />
      {activeVideo && <VideoLightbox item={activeVideo} onClose={() => setActiveVideo(null)} />}
    </main>
  );
}
