"use client";

import { useEffect, useRef } from "react";
import { Play } from "lucide-react";
import type { ProsGalleryVideo } from "@/content/pros/oficinas";
import { Reveal } from "@/components/pros/reveal";

const ORIENTATION_ASPECT: Record<ProsGalleryVideo["orientation"], string> = {
  horizontal: "aspect-video",
  vertical: "aspect-[9/16]",
};

/**
 * Um vídeo da galeria — autoplay mudo em loop assim que entra na viewport, pausa ao sair (pedido
 * explícito, performance) e retoma ao voltar. `preload="none"` — só começa a baixar de verdade
 * quando o IntersectionObserver dispara o primeiro `.play()`, nunca todos de uma vez.
 *
 * Clicável em tela cheia (pedido explícito, reafirmado nesta rodada — "TODOS os vídeos devem ser
 * possível clicar e assistir em fullscreen"): abre o MESMO `VideoLightbox` que o Hero usa, via
 * `onOpenVideo` — sem duplicar player nenhum.
 */
function GalleryVideo({ video, onOpenVideo }: { video: ProsGalleryVideo; onOpenVideo: (src: string) => void }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.15, rootMargin: "150px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <button type="button" onClick={() => onOpenVideo(video.src)} aria-label="Assistir vídeo em tela cheia" className={`group relative block w-full ${ORIENTATION_ASPECT[video.orientation]}`}>
      <video ref={ref} muted loop playsInline preload="none" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover">
        <source src={video.src} type="video/mp4" />
      </video>
      <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/25" />
      <span className="absolute left-1/2 top-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/0 bg-black/0 text-white opacity-0 backdrop-blur-sm transition-all group-hover:border-white/60 group-hover:bg-black/40 group-hover:opacity-100">
        <Play className="ml-0.5 size-4 fill-current" />
      </span>
    </button>
  );
}

/**
 * Galeria de vídeos da Pascoal Bombas — o bloco principal da página (pedido explícito). Grid de 6
 * colunas no desktop com `span` curado à mão por vídeo (`content/pros/oficinas.ts`) — verticais
 * ocupam menos largura mas, na proporção 9:16, saem naturalmente bem mais altos que os
 * horizontais ao lado, dando a presença pedida sem cortar/distorcer nada (cada item guarda seu
 * aspect-ratio real; a altura da linha nunca é forçada). Mobile: 1 coluna, cada vídeo na largura
 * cheia — os verticais aproveitam a altura da tela de verdade, não viram miniatura.
 */
export function ProsVideoGallery({ label, items, onOpenVideo }: { label: string; items: ProsGalleryVideo[]; onOpenVideo: (src: string) => void }) {
  return (
    <section aria-label={`Vídeos produzidos para ${label}`} className="bg-black px-3 py-20 sm:px-6 lg:px-8 lg:py-28">
      <Reveal className="mb-8 lg:mb-10">
        <p className="text-center font-mono text-xs uppercase tracking-[0.25em] text-white/35">{label}</p>
      </Reveal>
      {/* Breakpoint em `md` (não `lg`) — tablet já recebe a composição assimétrica em vez de
       *  ficar preso em 1 coluna até desktop. */}
      <div className="mx-auto grid max-w-[1800px] grid-cols-1 gap-3 sm:gap-4 md:grid-cols-6 md:gap-5">
        {items.map((video, i) => (
          <Reveal key={i} delayMs={(i % 3) * 100} className="overflow-hidden bg-white/[0.03]" style={{ gridColumn: `span ${video.span} / span ${video.span}` }}>
            <GalleryVideo video={video} onOpenVideo={onOpenVideo} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
