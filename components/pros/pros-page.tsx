"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Sora } from "next/font/google";
import type { ActiveVideo } from "@/components/landing/video-lightbox";
import type { ProsContent } from "@/content/pros/oficinas";
import { ProsHero } from "@/components/pros/pros-hero";
import { ProsVsl } from "@/components/pros/pros-vsl";
import { ProsVideoGallery } from "@/components/pros/pros-video-gallery";
import { ProsMobileStickyCta } from "@/components/pros/pros-mobile-sticky-cta";

const VideoLightbox = dynamic(() => import("@/components/landing/video-lightbox"));

// Fonte carregada só aqui — pedido explícito: Sora pra QUALQUER texto que a página /pros/01 tenha
// (hoje só o Hero, mas vale pro que vier depois). Escopo isolado deste arquivo/componente, não
// toca em app/layout.tsx nem na variável --font-family-display global do resto da plataforma.
// Google Font variável (100–800), então dá pra usar qualquer peso Tailwind (font-light etc.) sem
// precisar declarar `weight` explícito.
const sora = Sora({ subsets: ["latin"], variable: "--font-pros-sora" });

/**
 * Página de prospecção `/pros/[slug]` — maioria da página é só vídeo e blocos com vídeo (pedido
 * explícito de rodada anterior). Header, pilares, case em texto, "como funciona", diferencial,
 * FAQ, CTA final e footer foram REMOVIDOS (arquivos deletados, não só desligados) — nenhum deles
 * continha vídeo. O Hero é a única exceção: tem headline + subheadline (pedido explícito desta
 * rodada) mas nenhum CTA/botão.
 *
 * Único contato que sobra: `ProsMobileStickyCta`, um botão flutuante só de ícone (sem texto
 * visível) — a única forma de alguém que assistiu aos vídeos conseguir falar com a Procreating.
 *
 * Estado do lightbox fica aqui: bloco 2 (scroll reveal) e a grade do bloco 3 abrem o mesmo player
 * em tela cheia. O Hero é a ÚNICA exceção — pedido explícito, não é clicável.
 */
export function ProsPage({ content }: { content: ProsContent }) {
  const [activeVideo, setActiveVideo] = useState<ActiveVideo | null>(null);
  const openVideo = (src: string) => setActiveVideo({ poster: "", title: "Vídeo", videoSrc: src });

  return (
    <main className={`relative min-h-screen overflow-x-hidden bg-black text-white ${sora.className}`}>
      <ProsHero
        videoSrc={content.hero.videoSrc}
        headlineLine1={content.hero.headlineLine1}
        rotatingWords={content.hero.rotatingWords}
        subheadline={content.hero.subheadline}
      />
      <ProsVsl videoSrc={content.vsl.videoSrc} onOpenVideo={openVideo} />
      <ProsVideoGallery items={content.gallery} onOpenVideo={openVideo} />
      <ProsMobileStickyCta whatsapp={content.whatsapp} slug={content.slug} />
      {activeVideo && <VideoLightbox item={activeVideo} onClose={() => setActiveVideo(null)} />}
    </main>
  );
}
