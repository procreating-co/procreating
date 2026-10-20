"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Play } from "lucide-react";
import type { VideoItem } from "@/lib/clients/types";
import { VideoPoster } from "@/components/landing/video-card";
import type { HowItWorksSectionProps } from "@/components/landing/how-it-works-section";
import { OfflineVideoPlayer, type OfflinePlayerItem, type OfflineVideoPlayerHandle } from "@offline/components/offline-video-player";

/**
 * Cópia fiel de `components/landing/how-it-works-section.tsx` + `video-card.tsx` (mesmo JSX, mesmas
 * classes), com só o que muda offline:
 * - o clique no card chama `player.open()` na hora (reprodução + áudio no mesmo clique), em vez de
 *   montar o lightbox via `next/dynamic`;
 * - hover/foco no card pré-carrega aquele vídeo (`player.warm()`);
 * - o botão de download aponta direto pro arquivo local (mesma origem → o atributo `download`
 *   funciona sem o proxy `/api/download`, que só existe pra buscar no R2).
 * O componente online NÃO foi alterado.
 */

type PlayerActions = { open: (video: VideoItem, title: string) => void; warm: (video: VideoItem, title: string) => void };

function toItem(video: VideoItem, title: string): OfflinePlayerItem {
  return { poster: video.poster, title, videoSrc: video.videoSrc };
}

function DownloadLink({ video }: { video: VideoItem }) {
  return (
    <a
      href={video.downloadHref}
      download={`${video.number} - ${video.title}.mp4`}
      className="flex size-10 shrink-0 items-center justify-center border border-white/15 text-white/55 transition-colors hover:border-[var(--client-accent)] hover:text-[var(--client-accent)]"
      aria-label={`Baixar vídeo ${video.number}`}
    >
      <Download className="size-4" />
    </a>
  );
}

function VideoTile({ video, player }: { video: VideoItem; player: PlayerActions }) {
  const title = video.shortTitle ?? video.title;
  return (
    <div className="w-full lg:w-80 lg:max-w-[340px] lg:flex-1">
      <div className="mb-4 flex h-10 shrink-0 items-center gap-4 lg:mb-5">
        <span className="shrink-0 font-display text-3xl text-[var(--client-accent)]">{video.number}.</span>
        <h3 className="min-w-0 shrink truncate text-left font-display text-xl leading-snug lg:text-2xl">{title}</h3>
        <span className="h-px min-w-6 flex-1 bg-white/15" />
        {video.ready && <DownloadLink video={video} />}
      </div>
      <button
        type="button"
        onClick={() => player.open(video, title)}
        onPointerEnter={() => player.warm(video, title)}
        onFocus={() => player.warm(video, title)}
        aria-label={`Abrir vídeo em tela cheia: ${title}`}
        className="group relative block aspect-[9/16] w-full overflow-hidden rounded-lg"
      >
        <VideoPoster item={video} />
        <span className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/35" />
        <span className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-black/35 text-white backdrop-blur-sm transition-all group-hover:scale-110 group-hover:border-[var(--client-accent)] group-hover:text-[var(--client-accent)]">
          <Play className="ml-1 size-5 fill-current" />
        </span>
      </button>
    </div>
  );
}

function VideoCard({ video, bare, stretch, className, player }: { video: VideoItem; bare?: boolean; stretch?: boolean; className?: string; player: PlayerActions }) {
  const isHorizontal = video.format === "horizontal" || bare;
  const aspectClass = video.format === "horizontal" ? "aspect-video" : "aspect-[9/16]";
  const mediaClass = stretch ? `${aspectClass} lg:aspect-auto lg:min-h-0 lg:flex-1` : aspectClass;
  const title = video.title;

  return (
    <article className={`group ${stretch ? "flex flex-col lg:h-full" : ""} ${isHorizontal ? "py-4 lg:py-5" : "bg-black p-5 lg:p-7"} ${className ?? ""}`}>
      <div className="mb-4 flex shrink-0 items-center gap-4 lg:mb-5">
        <span className="shrink-0 font-display text-3xl text-[var(--client-accent)]">{video.number}.</span>
        <h3 className="min-w-0 shrink text-balance text-left font-display text-xl leading-snug lg:text-2xl">{title}</h3>
        <span className="h-px min-w-6 flex-1 bg-white/15" />
        {video.ready ? <DownloadLink video={video} /> : <span className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-white/35">Em produção</span>}
      </div>
      {video.ready ? (
        <button
          type="button"
          onClick={() => player.open(video, title)}
          onPointerEnter={() => player.warm(video, title)}
          onFocus={() => player.warm(video, title)}
          className={`relative block ${mediaClass} w-full overflow-hidden text-left`}
          aria-label={`Abrir vídeo em tela cheia: ${title}`}
        >
          <VideoPoster item={video} />
          <span className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/35" />
          <span className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-black/35 text-white backdrop-blur-sm transition-all group-hover:scale-110 group-hover:border-[var(--client-accent)] group-hover:text-[var(--client-accent)]"><Play className="ml-1 size-5 fill-current" /></span>
        </button>
      ) : (
        <div className={`relative block ${mediaClass} w-full overflow-hidden opacity-60`} aria-hidden="true">
          <VideoPoster item={video} />
          <span className="absolute inset-0 bg-black/50" />
        </div>
      )}
    </article>
  );
}

export function OfflineHowItWorksSection({
  videos,
  eyebrow,
  headingPrefix,
  headingSuffix,
  blockNumber,
  blockTitle,
  subtitle,
  acquisitionEyebrow,
  acquisitionHeadingPrefix,
  acquisitionHeadingSuffix,
}: HowItWorksSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const playerRef = useRef<OfflineVideoPlayerHandle>(null);

  const player: PlayerActions = {
    open: (video, title) => playerRef.current?.open(toItem(video, title)),
    warm: (video, title) => playerRef.current?.warm(toItem(video, title)),
  };

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setIsVisible(true), { threshold: 0.1 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Quando a seção aparece, já deixa o primeiro vídeo em buffer (o mais provável de ser clicado).
  useEffect(() => {
    if (isVisible && videos.socialVideos[0]) playerRef.current?.warm(toItem(videos.socialVideos[0], videos.socialVideos[0].shortTitle ?? videos.socialVideos[0].title));
  }, [isVisible, videos.socialVideos]);

  const [verticalOne, verticalTwo, horizontalVideo] = videos.socialVideos;
  const { acquisitionVideo, presentationVideo } = videos;
  const allSameFormat = videos.socialVideos.length === 3 && videos.socialVideos.every((video) => video.format === videos.socialVideos[0].format);

  return (
    <section id="how-it-works" ref={sectionRef} className="relative overflow-hidden bg-[oklch(0.09_0.01_260)] pb-8 pt-8 text-white lg:pb-10 lg:pt-10">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <header className={`mx-auto mb-16 max-w-4xl text-center transition-all duration-1000 lg:mb-20 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
          <span className="mb-3 inline-flex items-center gap-3 font-mono text-sm text-white/45"><span className="h-px w-12 bg-[var(--client-accent)]" />{eyebrow}<span className="h-px w-12 bg-[var(--client-accent)]" /></span>
          <h2 className="text-balance font-display text-4xl leading-[0.95] tracking-tight sm:text-5xl md:text-7xl lg:text-[96px]">{headingPrefix} <span className="block text-white/40">{headingSuffix}</span></h2>
        </header>

        <div className="overflow-hidden bg-black text-white lg:grid lg:grid-cols-[340px_minmax(0,1fr)]">
          <div className="flex flex-col justify-center p-6 text-left sm:p-8 lg:p-12">
            <div className="flex items-baseline gap-3 sm:gap-4">
              <span className="font-mono text-sm text-white/40">{blockNumber}</span>
              <h3 className="font-display text-2xl sm:text-4xl">{blockTitle}</h3>
            </div>
            <p className="mt-4 pl-0 text-base leading-relaxed text-white/55 sm:mt-6 sm:pl-10 sm:text-lg">{subtitle}</p>
          </div>
          <div className="min-w-0 p-6 lg:p-10">
            <div className={`flex w-full flex-col items-start gap-6 lg:flex-row ${allSameFormat ? "lg:justify-center" : "lg:justify-end"}`}>
              {allSameFormat ? (
                videos.socialVideos.map((video) => <VideoTile key={video.id} video={video} player={player} />)
              ) : (
                <>
                  <VideoTile video={verticalOne} player={player} />
                  <VideoTile video={verticalTwo} player={player} />
                </>
              )}
            </div>
          </div>
        </div>

        {!allSameFormat && (
          <div className="mt-5">
            <VideoCard video={horizontalVideo} player={player} />
          </div>
        )}

        {acquisitionVideo && presentationVideo && (
          <div className="mt-8 lg:mt-10">
            <header className="mb-8 text-center lg:mb-10">
              <span className="mb-3 inline-flex items-center gap-3 font-mono text-sm text-white/45"><span className="h-px w-12 bg-[var(--client-accent)]" />{acquisitionEyebrow}<span className="h-px w-12 bg-[var(--client-accent)]" /></span>
              <h2 className="text-balance font-display text-4xl leading-[0.95] tracking-tight sm:text-5xl md:text-7xl lg:text-[96px]">{acquisitionHeadingPrefix} <span className="block text-white/40">{acquisitionHeadingSuffix}</span></h2>
            </header>

            <div className="flex flex-col gap-5 lg:h-[540px] lg:flex-row">
              <VideoCard video={acquisitionVideo} bare stretch className="lg:w-[320px] lg:shrink-0" player={player} />
              <VideoCard video={presentationVideo} stretch className="lg:flex-1" player={player} />
            </div>
          </div>
        )}
      </div>
      <OfflineVideoPlayer ref={playerRef} />
    </section>
  );
}
