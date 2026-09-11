"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Play, Video } from "lucide-react";
import type { ActiveVideo } from "@/components/landing/video-lightbox";
import type { SetembroVideoSlot } from "@/data/pascoal/setembro-videos";

const VideoLightbox = dynamic(() => import("@/components/landing/video-lightbox"));

/**
 * Seção "Vídeos" da Home da Pascoal (setembro/26) — mesma linguagem visual das seções de vídeo
 * da apresentação original (`how-it-works-section.tsx`): fundo `oklch(0.09 0.01 260)`, header
 * centralizado com `font-display`, número em `--client-accent`, containers com o aspect-ratio
 * REAL de cada formato (9/16 e 16/9).
 *
 * 12 espaços numerados de forma contínua (01–12: os 02 verticais primeiro, os 10 horizontais em
 * seguida — nunca reinicia a contagem por grupo). Cada slot é independente: com URL
 * (`data/pascoal/setembro-videos.ts`) vira um card clicável; sem URL (`null` — arquivo ainda não
 * subido), continua o placeholder "Em produção".
 *
 * Card com vídeo: o próprio `<video>` (mudo, sem controles) serve de "thumbnail" real — mostra
 * um frame do arquivo de verdade, nunca uma imagem inventada — com um ícone de play centralizado
 * por cima. A capa é o frame 0 por padrão; quando `slot.posterSeconds` existe (pedido explícito —
 * frame 0 "feio" em alguns vídeos), a capa usa esse segundo em vez do início, via Media Fragment
 * (`#t=<segundos>`) — só na `<video>` do card, a reprodução real (lightbox) sempre começa do
 * zero. Nada de barra de tempo/linha do tempo na moldura: os controles nativos (tempo, scrubber,
 * tela cheia) só aparecem ao abrir o vídeo em tela cheia (`VideoLightbox`, o MESMO componente
 * que `how-it-works-section.tsx` já usa em toda a Home — nenhum player novo).
 */

function VideoTile({ index, orientation, slot, onOpen }: { index: number; orientation: "vertical" | "horizontal"; slot?: SetembroVideoSlot | null; onOpen: () => void }) {
  const isVertical = orientation === "vertical";
  const aspectClass = isVertical ? "aspect-[9/16]" : "aspect-video";
  const number = String(index).padStart(2, "0");
  const thumbnailSrc = slot ? (slot.posterSeconds ? `${slot.src}#t=${slot.posterSeconds}` : slot.src) : undefined;
  return (
    <div className="w-full">
      <div className="mb-4 flex h-10 shrink-0 items-center gap-4 lg:mb-5">
        <span className="shrink-0 font-display text-3xl text-[var(--client-accent)]">{number}.</span>
        <span className="h-px min-w-6 flex-1 bg-white/15" />
        {!slot && <span className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-white/35">Em produção</span>}
      </div>
      {slot ? (
        <button
          type="button"
          onClick={onOpen}
          aria-label={`Abrir vídeo ${orientation === "vertical" ? "vertical" : "horizontal"} ${number} em tela cheia`}
          className={`group relative block ${aspectClass} w-full overflow-hidden rounded-lg border border-white/10 bg-black text-left`}
        >
          <video muted playsInline preload="metadata" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover">
            <source src={thumbnailSrc} type="video/mp4" />
          </video>
          <span className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/35" />
          <span
            className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-black/35 text-white backdrop-blur-sm transition-all group-hover:scale-110 group-hover:border-[var(--client-accent)] group-hover:text-[var(--client-accent)] ${
              isVertical ? "size-14 sm:size-16" : "size-14"
            }`}
          >
            <Play className="ml-1 size-5 fill-current" />
          </span>
        </button>
      ) : (
        <div className={`relative ${aspectClass} w-full overflow-hidden rounded-lg border border-white/10 bg-black`}>
          <span
            className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 text-white/30 ${
              isVertical ? "size-14 sm:size-16" : "size-14"
            }`}
          >
            <Video className={isVertical ? "size-5 sm:size-6" : "size-5"} />
          </span>
        </div>
      )}
    </div>
  );
}

export function VideosPlaceholderSection({
  verticalSlots = [],
  horizontalSlots = [],
}: {
  /** Os 02 vídeos verticais, em ordem (01–02). `null`/posição ausente = placeholder. */
  verticalSlots?: (SetembroVideoSlot | null)[];
  /** Os 10 vídeos horizontais, em ordem (03–12, numeração contínua com os verticais). */
  horizontalSlots?: (SetembroVideoSlot | null)[];
} = {}) {
  const [activeVideo, setActiveVideo] = useState<ActiveVideo | null>(null);

  return (
    <section id="videos" className="relative overflow-hidden bg-[oklch(0.09_0.01_260)] pb-16 pt-8 text-white lg:pb-20 lg:pt-10">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <header className="mx-auto mb-14 max-w-4xl text-center sm:mb-16 lg:mb-20">
          <span className="mb-3 inline-flex items-center gap-3 font-mono text-sm text-white/45">
            <span className="h-px w-12 bg-[var(--client-accent)]" />
            Vídeos
            <span className="h-px w-12 bg-[var(--client-accent)]" />
          </span>
          <h2 className="text-balance font-display text-3xl leading-[1.02] tracking-tight sm:text-4xl md:text-6xl lg:text-7xl">
            Conteúdos para redes <span className="block text-white/40">da Julia e Pascoal</span>
          </h2>
        </header>

        <div className="flex flex-col gap-14 lg:gap-16">
          {/* Verticais (01–02) — 1 coluna larga no mobile/tablet, 2 cards grandes por linha no desktop. */}
          <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-8 md:grid-cols-2 md:gap-6 lg:gap-8">
            {[0, 1].map((i) => {
              const slot = verticalSlots[i];
              return (
                <VideoTile
                  key={i}
                  index={i + 1}
                  orientation="vertical"
                  slot={slot}
                  onOpen={() => slot && setActiveVideo({ poster: "", title: `Vídeo ${String(i + 1).padStart(2, "0")}`, videoSrc: slot.src })}
                />
              );
            })}
          </div>

          {/* Horizontais (03–12) — 1 coluna no mobile, 2 por linha a partir de `sm`. */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:gap-x-8 lg:gap-y-10">
            {Array.from({ length: 10 }, (_, i) => {
              const slot = horizontalSlots[i];
              return (
                <VideoTile
                  key={i}
                  index={i + 3}
                  orientation="horizontal"
                  slot={slot}
                  onOpen={() => slot && setActiveVideo({ poster: "", title: `Vídeo ${String(i + 3).padStart(2, "0")}`, videoSrc: slot.src })}
                />
              );
            })}
          </div>
        </div>
      </div>

      {activeVideo && <VideoLightbox item={activeVideo} onClose={() => setActiveVideo(null)} />}
    </section>
  );
}
