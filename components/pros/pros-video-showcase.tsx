"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Play } from "lucide-react";
import type { ActiveVideo } from "@/components/landing/video-lightbox";
import type { ProsVideo, ProsVideoRow } from "@/content/pros/oficinas";

const VideoLightbox = dynamic(() => import("@/components/landing/video-lightbox"));

/** Um card de vídeo — o próprio `<video>` (mudo, sem controles) serve de thumbnail real, com
 *  `IntersectionObserver` pra tocar/pausar 1 frame assim que entra na tela (mesma técnica de
 *  `videos-placeholder-section.tsx`, corrige o card preto no Safari/iOS sem gesto do usuário).
 *  Sem número/rótulo nenhum (pedido explícito: nada de "vídeo 01, 02, 03..."). Clicável em tela
 *  cheia. */
function VideoTile({ video, orientation, onOpen }: { video: ProsVideo; orientation: "vertical" | "horizontal"; onOpen: () => void }) {
  const isVertical = orientation === "vertical";
  const buttonRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const trigger = buttonRef.current;
    const el = videoRef.current;
    if (!trigger || !el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.play().catch(() => {});
        observer.disconnect();
      },
      { rootMargin: "200px" },
    );
    observer.observe(trigger);
    return () => observer.disconnect();
  }, []);

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onOpen}
      aria-label={`Assistir vídeo ${isVertical ? "vertical" : "horizontal"} em tela cheia`}
      className={`group relative block w-full overflow-hidden rounded-lg border border-white/10 bg-black text-left ${isVertical ? "aspect-[9/16]" : "aspect-video"}`}
    >
      <video ref={videoRef} muted playsInline preload="metadata" onLoadedData={(e) => e.currentTarget.pause()} aria-hidden="true" className="absolute inset-0 h-full w-full object-cover">
        <source src={video.src} type="video/mp4" />
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
  );
}

/**
 * Seção "Vídeos" — réplica visual da seção equivalente do site do cliente
 * (`videos-placeholder-section.tsx`: fundo `oklch(0.09 0.01 260)`, header centralizado em
 * `font-display`, cards com aspect-ratio real). Ordem própria pedida pra essa página (não o grid
 * de 12 do cliente): horizontal, horizontal, um par de verticais lado a lado, horizontal — sem
 * nenhuma numeração nos cards.
 */
export function ProsVideoShowcase({ eyebrow, heading, rows }: { eyebrow: string; heading: [string, string]; rows: ProsVideoRow[] }) {
  const [activeVideo, setActiveVideo] = useState<ActiveVideo | null>(null);
  const open = (src: string) => setActiveVideo({ poster: "", title: "Vídeo", videoSrc: src });

  return (
    <section aria-label="Vídeos" className="relative overflow-hidden bg-[oklch(0.09_0.01_260)] pb-16 pt-16 text-white lg:pb-20 lg:pt-20">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <header className="mx-auto mb-14 max-w-4xl text-center sm:mb-16 lg:mb-20">
          <span className="mb-3 inline-flex items-center gap-3 font-mono text-sm text-white/45">
            <span className="h-px w-12 bg-[var(--client-accent)]" />
            {eyebrow}
            <span className="h-px w-12 bg-[var(--client-accent)]" />
          </span>
          <h2 className="text-balance font-display text-3xl leading-[1.02] tracking-tight sm:text-4xl md:text-6xl lg:text-7xl">
            {heading[0]} <span className="block text-white/40">{heading[1]}</span>
          </h2>
        </header>

        <div className="flex flex-col gap-8 lg:gap-10">
          {rows.map((row, i) =>
            row.kind === "horizontal" ? (
              <div key={i} className="mx-auto w-full max-w-4xl">
                <VideoTile video={row.video} orientation="horizontal" onOpen={() => open(row.video.src)} />
              </div>
            ) : (
              <div key={i} className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-6 lg:gap-8">
                {row.videos.map((video, j) => (
                  <VideoTile key={j} video={video} orientation="vertical" onOpen={() => open(video.src)} />
                ))}
              </div>
            ),
          )}
        </div>
      </div>

      {activeVideo && <VideoLightbox item={activeVideo} onClose={() => setActiveVideo(null)} />}
    </section>
  );
}
