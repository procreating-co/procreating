"use client";

import { useEffect, useRef } from "react";
import type { ProsGalleryVideo } from "@/content/pros/oficinas";
import { Reveal } from "@/components/pros/reveal";

const ORIENTATION_ASPECT: Record<ProsGalleryVideo["orientation"], string> = {
  horizontal: "aspect-video",
  vertical: "aspect-[9/16]",
};

/**
 * Um vídeo da galeria — autoplay mudo em loop assim que entra na viewport, pausa ao sair (pedido
 * explícito, performance) e retoma ao voltar. Sem controles, sem clique, sem legenda: os vídeos
 * são o conteúdo, não um gatilho pra abrir outra coisa. `preload="none"` — só começa a baixar de
 * verdade quando o IntersectionObserver dispara o primeiro `.play()`, nunca todos de uma vez.
 */
function GalleryVideo({ video }: { video: ProsGalleryVideo }) {
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
    <video ref={ref} muted loop playsInline preload="none" aria-hidden="true" className={`h-full w-full object-cover ${ORIENTATION_ASPECT[video.orientation]}`}>
      <source src={video.src} type="video/mp4" />
    </video>
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
export function ProsVideoGallery({ label, items }: { label: string; items: ProsGalleryVideo[] }) {
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
            <GalleryVideo video={video} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
