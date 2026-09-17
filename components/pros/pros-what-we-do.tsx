"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { ActiveVideo } from "@/components/landing/video-lightbox";
import { Reveal } from "@/components/pros/reveal";
import { VideoTile } from "@/components/pros/video-tile";
import type { ProsVideo } from "@/content/pros/oficinas";

const VideoLightbox = dynamic(() => import("@/components/landing/video-lightbox"));

/**
 * Bloco "O que fazemos" — eyebrow + heading (2 linhas, fonte reduzida — pedido explícito) + o
 * vídeo que já estava na primeira posição da página (Vídeo de Apresentação), agora com o rótulo
 * "01. Vídeos Institucionais" acima dele (mesmo padrão number+title de
 * `features-section.tsx`/`how-it-works-section.tsx` do site do cliente: número em mono/opaco +
 * título em `font-display`). Cada bloco de texto entra com `Reveal` (pedido explícito: "em todos
 * textos coloque efeito de aparição").
 */
export function ProsWhatWeDo({
  eyebrow,
  heading,
  videoLabel,
  video,
}: {
  eyebrow: string;
  heading: [string, string];
  videoLabel: [string, string];
  video: ProsVideo;
}) {
  const [activeVideo, setActiveVideo] = useState<ActiveVideo | null>(null);

  return (
    <section aria-label="O que fazemos" className="relative overflow-hidden bg-[oklch(0.09_0.01_260)] pb-16 pt-16 text-white lg:pb-20 lg:pt-20">
      <div className="mx-auto max-w-4xl px-6 lg:px-12">
        <Reveal className="mb-10 text-center lg:mb-12">
          <span className="mb-3 inline-flex items-center gap-3 font-mono text-sm text-white/45">
            <span className="h-px w-12 bg-[var(--client-accent)]" />
            {eyebrow}
            <span className="h-px w-12 bg-[var(--client-accent)]" />
          </span>
          <h2 className="text-balance font-display text-2xl leading-[1.05] tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
            {heading[0]} <span className="block text-white/40">{heading[1]}</span>
          </h2>
        </Reveal>

        <Reveal className="mb-4 flex items-baseline gap-3 sm:gap-4">
          <span className="font-mono text-sm text-white/40">{videoLabel[0]}</span>
          <h3 className="font-display text-2xl sm:text-4xl">{videoLabel[1]}</h3>
        </Reveal>

        <Reveal>
          <VideoTile video={video} orientation="horizontal" onOpen={() => setActiveVideo({ poster: "", title: "Vídeo", videoSrc: video.src })} />
        </Reveal>
      </div>

      {activeVideo && <VideoLightbox item={activeVideo} onClose={() => setActiveVideo(null)} />}
    </section>
  );
}
