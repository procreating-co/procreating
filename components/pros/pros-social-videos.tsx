"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { ActiveVideo } from "@/components/landing/video-lightbox";
import { Reveal } from "@/components/pros/reveal";
import { VideoTile } from "@/components/pros/video-tile";
import type { ProsVideo } from "@/content/pros/oficinas";

const VideoLightbox = dynamic(() => import("@/components/landing/video-lightbox"));

/**
 * Bloco "Vídeos" — réplica de copy do `videosSection` do site do cliente (eyebrow "Vídeos" +
 * heading "Conteúdos / para redes sociais."). Só verticais — os 2 vídeos horizontais que viviam
 * aqui foram movidos pro bloco "institucional" acima.
 */
export function ProsSocialVideos({
  eyebrow,
  heading,
  videos,
}: {
  eyebrow: string;
  heading: [string, string];
  videos: ProsVideo[];
}) {
  const [activeVideo, setActiveVideo] = useState<ActiveVideo | null>(null);
  const open = (src: string) => setActiveVideo({ poster: "", title: "Vídeo", videoSrc: src });

  return (
    <section aria-label="Vídeos" className="relative overflow-hidden bg-[oklch(0.09_0.01_260)] pb-16 pt-16 text-white lg:pb-20 lg:pt-20">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <Reveal className="mx-auto mb-14 max-w-4xl text-center sm:mb-16 lg:mb-20">
          <span className="mb-3 inline-flex items-center gap-3 font-mono text-sm text-white/45">
            <span className="h-px w-12 bg-[var(--client-accent)]" />
            {eyebrow}
            <span className="h-px w-12 bg-[var(--client-accent)]" />
          </span>
          <h2 className="text-balance font-display text-3xl leading-[1.02] tracking-tight sm:text-4xl md:text-6xl lg:text-7xl">
            {heading[0]} <span className="block text-white/40">{heading[1]}</span>
          </h2>
        </Reveal>

        <Reveal>
          <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-6 lg:gap-8">
            {videos.map((video, i) => (
              <VideoTile key={i} video={video} orientation="vertical" onOpen={() => open(video.src)} />
            ))}
          </div>
        </Reveal>
      </div>

      {activeVideo && <VideoLightbox item={activeVideo} onClose={() => setActiveVideo(null)} />}
    </section>
  );
}
