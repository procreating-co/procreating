"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { ActiveVideo } from "@/components/landing/video-lightbox";
import type { ProsContent } from "@/content/pros/oficinas";
import { ProsHero } from "@/components/pros/pros-hero";
import { ProsVsl } from "@/components/pros/pros-vsl";
import { ProsVideoGallery } from "@/components/pros/pros-video-gallery";
import { ProsMobileStickyCta } from "@/components/pros/pros-mobile-sticky-cta";

const VideoLightbox = dynamic(() => import("@/components/landing/video-lightbox"));

/**
 * Página de prospecção `/pros/[slug]` — pedido explícito (simplificação radical): SÓ vídeo e
 * blocos com vídeo. Sem header, sem nenhum texto/copy visível, sem bloco vazio/preto. Header,
 * headlines, pilares, case em texto, "como funciona", diferencial, FAQ, CTA final e footer foram
 * REMOVIDOS (arquivos deletados, não só desligados) — nenhum deles continha vídeo.
 *
 * Único contato que sobra: `ProsMobileStickyCta`, um botão flutuante só de ícone (sem texto
 * visível) — não é um "bloco" nem "copy", é a única forma de alguém que assistiu aos vídeos
 * conseguir falar com a Procreating. Se nem isso for desejado, é uma linha pra remover.
 *
 * Estado do lightbox fica aqui: bloco 2 (scroll reveal) e a grade do bloco 3 abrem o mesmo player
 * em tela cheia. O Hero é a ÚNICA exceção — pedido explícito, não é clicável.
 */
export function ProsPage({ content }: { content: ProsContent }) {
  const [activeVideo, setActiveVideo] = useState<ActiveVideo | null>(null);
  const openVideo = (src: string) => setActiveVideo({ poster: "", title: "Vídeo", videoSrc: src });

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-black text-white">
      <ProsHero videoSrc={content.hero.videoSrc} />
      <ProsVsl videoSrc={content.vsl.videoSrc} onOpenVideo={openVideo} />
      <ProsVideoGallery items={content.gallery} onOpenVideo={openVideo} />
      <ProsMobileStickyCta whatsapp={content.whatsapp} slug={content.slug} />
      {activeVideo && <VideoLightbox item={activeVideo} onClose={() => setActiveVideo(null)} />}
    </main>
  );
}
