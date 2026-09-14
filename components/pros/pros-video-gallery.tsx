"use client";

import { useEffect, useRef } from "react";
import { Play } from "lucide-react";
import type { ProsGalleryVideo } from "@/content/pros/oficinas";

const ORIENTATION_ASPECT: Record<ProsGalleryVideo["orientation"], string> = {
  horizontal: "aspect-video",
  vertical: "aspect-[9/16]",
};

/**
 * Um vídeo da galeria — autoplay mudo em loop assim que entra na viewport, pausa ao sair (pedido
 * explícito, performance/carregamento rápido) e retoma ao voltar. `preload="none"` — só começa a
 * baixar de verdade quando o IntersectionObserver dispara o primeiro `.play()`, nunca todos de
 * uma vez. Clicável em tela cheia (mesmo `VideoLightbox` do resto da página).
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
 * Bloco 3 — grade de vídeos reais da Pascoal Bombas. Pedido explícito (simplificação desta
 * rodada): sem rótulo/texto nenhum, sem seção "Case" ao redor — só a grade, full-bleed (sem
 * padding/max-width com respiro) pra ficar alinhada com o Hero/bloco 2, que também são full-bleed.
 * `gap-1` — separação mínima só pra cada vídeo ficar visualmente distinto do vizinho, não pra
 * criar respiro.
 *
 * Grid de 6 colunas no desktop com `span` curado à mão por vídeo (`content/pros/oficinas.ts`) —
 * verticais ocupam menos largura mas, na proporção 9:16, saem naturalmente bem mais altos que os
 * horizontais ao lado, dando presença sem cortar/distorcer nada.
 */
export function ProsVideoGallery({ items, onOpenVideo }: { items: ProsGalleryVideo[]; onOpenVideo: (src: string) => void }) {
  return (
    <section aria-label="Vídeos" className="bg-black">
      <div className="grid grid-cols-1 gap-1 md:grid-cols-6">
        {items.map((video, i) => (
          <div key={i} style={{ gridColumn: `span ${video.span} / span ${video.span}` }}>
            <GalleryVideo video={video} onOpenVideo={onOpenVideo} />
          </div>
        ))}
      </div>
    </section>
  );
}
