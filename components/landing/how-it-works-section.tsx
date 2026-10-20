"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Download, Play } from "lucide-react";
import type { ClientVideos, VideoItem } from "@/lib/clients/types";
import { VideoCard, VideoPoster } from "@/components/landing/video-card";
import type { ActiveVideo } from "@/components/landing/video-lightbox";

const VideoLightbox = dynamic(() => import("@/components/landing/video-lightbox"));

/** Contador animado em passos discretos (0 → `value`), mesmo estilo "marcador de posto" do Hero.
 *  Usado no modo "em produção" da seção de vídeos (ex.: "12 vídeos em produção"). */
function ProductionCount({ value, start }: { value: number; start: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(value);
      return;
    }
    const duration = 1400;
    const steps = Math.max(Math.min(value, 40), 1);
    let step = 0;
    let timeoutId: ReturnType<typeof setTimeout>;
    const tick = () => {
      step++;
      const progress = Math.min(step / steps, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(value * eased));
      if (step < steps) timeoutId = setTimeout(tick, duration / steps);
    };
    timeoutId = setTimeout(tick, duration / steps);
    return () => clearTimeout(timeoutId);
  }, [start, value]);

  return (
    <span key={count} className="animate-char-in inline-block">
      {String(count).padStart(2, "0")}
    </span>
  );
}

/** Grade de `count` posições verticais (9/16). As primeiras são preenchidas com os vídeos reais
 *  já prontos (clicáveis → abrem no lightbox); as restantes ficam como placeholders "Em produção".
 *  Mantém o template de "espaço pra N vídeos" (ex.: Dra. Sandra, 12 vídeos, 2 prontos). */
function ProductionSlots({ count, isVisible, videos, onOpen }: { count: number; isVisible: boolean; videos: VideoItem[]; onOpen: (video: VideoItem) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => {
        const video = videos[i];
        const reveal = isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0";
        const delay = { transitionDelay: isVisible ? `${i * 60}ms` : "0ms" };

        if (video) {
          return (
            <button
              key={video.id}
              type="button"
              onClick={() => onOpen(video)}
              aria-label={`Abrir vídeo ${i + 1} em tela cheia`}
              className={`group relative block aspect-[9/16] w-full overflow-hidden rounded-lg border border-white/10 bg-black transition-all duration-700 ${reveal}`}
              style={delay}
            >
              {/* Primeiro frame do vídeo como prévia (sem precisar de imagem de capa). */}
              <video src={video.videoSrc} muted playsInline preload="metadata" tabIndex={-1} aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
              <span className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/35" />
              <span className="absolute left-1/2 top-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-black/35 text-white backdrop-blur-sm transition-all group-hover:scale-110 group-hover:border-[var(--client-accent)] group-hover:text-[var(--client-accent)]">
                <Play className="ml-0.5 size-4 fill-current" />
              </span>
            </button>
          );
        }

        return (
          <div
            key={i}
            className={`relative flex aspect-[9/16] w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] transition-all duration-700 ${reveal}`}
            style={delay}
          >
            <span className="font-display text-xl text-white/25">{String(i + 1).padStart(2, "0")}</span>
            <span className="font-mono text-[10px] uppercase tracking-wide text-white/25">Em produção</span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Vídeo "solto": cabeçalho acima da mídia, sem card/borda envolvendo os dois.
 * Cabeçalho reaproveita EXATAMENTE as classes do header do VideoCard (referência: Conteúdos para aquisição).
 */
function VideoTile({ video, onOpen, hideMeta = false }: { video: VideoItem; onOpen: () => void; hideMeta?: boolean }) {
  const title = video.shortTitle ?? video.title;
  return (
    // `lg:flex-1 lg:basis-0` faz os 3 vídeos lado a lado ficarem EXATAMENTE do mesmo tamanho
    // (antes o `lg:w-80` fixo brigava com o `flex-1` e deixava o último com largura diferente).
    <div className="w-full lg:min-w-0 lg:max-w-[340px] lg:flex-1 lg:basis-0">
      {/* `hideMeta` (ex.: /pros/02): esconde número, título e download — fica só o vídeo clicável. */}
      {!hideMeta && (
        <div className="mb-4 flex h-10 shrink-0 items-center gap-4 lg:mb-5">
          <span className="shrink-0 font-display text-3xl text-[var(--client-accent)]">{video.number}.</span>
          <h3 className="min-w-0 shrink truncate text-left font-display text-xl leading-snug lg:text-2xl">{title}</h3>
          <span className="h-px min-w-6 flex-1 bg-white/15" />
          {video.ready && (
            <a
              href={`/api/download?src=${encodeURIComponent(video.downloadHref)}`}
              download
              className="flex size-10 shrink-0 items-center justify-center border border-white/15 text-white/55 transition-colors hover:border-[var(--client-accent)] hover:text-[var(--client-accent)]"
              aria-label={`Baixar vídeo ${video.number}`}
            >
              <Download className="size-4" />
            </a>
          )}
        </div>
      )}
      <button
        type="button"
        onClick={onOpen}
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

export type HowItWorksSectionProps = {
  videos: ClientVideos;
  eyebrow: string;
  headingPrefix: string;
  headingSuffix: string;
  blockNumber: string;
  blockTitle: string;
  subtitle: string;
  acquisitionEyebrow: string;
  acquisitionHeadingPrefix: string;
  acquisitionHeadingSuffix: string;
  /** Modo "em produção" — ver `ClientConfig.videosSection.production`. */
  production?: { count: number; label: string };
  /** `true` esconde número/título/download dos vídeos verticais (só o vídeo clicável). */
  hideVideoMeta?: boolean;
};

export function HowItWorksSection({
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
  production,
  hideVideoMeta = false,
}: HowItWorksSectionProps) {
  const [activeVideo, setActiveVideo] = useState<ActiveVideo | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setIsVisible(true), { threshold: 0.1 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const [verticalOne, verticalTwo, horizontalVideo] = videos.socialVideos;
  const { acquisitionVideo, presentationVideo } = videos;
  /** Quando os 3 vídeos sociais são do mesmo formato (ex.: todos verticais), ficam lado a lado
   *  numa única linha (empilhados no mobile) em vez do layout padrão — 2 lado a lado + 1
   *  horizontal em largura total abaixo, pensado especificamente pra mistura de formatos. */
  const allSameFormat = videos.socialVideos.length === 3 && videos.socialVideos.every((video) => video.format === videos.socialVideos[0].format);

  return (
    <section id="how-it-works" ref={sectionRef} className="relative overflow-hidden bg-[oklch(0.09_0.01_260)] pb-8 pt-8 text-white lg:pb-10 lg:pt-10">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <header className={`mx-auto mb-16 max-w-4xl text-center transition-all duration-1000 lg:mb-20 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
          <span className="mb-3 inline-flex items-center gap-3 font-mono text-sm text-white/45"><span className="h-px w-12 bg-[var(--client-accent)]" />{eyebrow}<span className="h-px w-12 bg-[var(--client-accent)]" /></span>
          <h2 className="text-balance font-display text-4xl leading-[0.95] tracking-tight sm:text-5xl md:text-7xl lg:text-[96px]">{headingPrefix} <span className="block text-white/40">{headingSuffix}</span></h2>
        </header>

        {production && (
          <div className={`mx-auto mb-14 flex max-w-4xl flex-col items-center text-center transition-all duration-1000 lg:mb-20 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
            <span className="font-display text-7xl leading-none text-[var(--client-accent)] sm:text-8xl lg:text-[120px]">
              <ProductionCount value={production.count} start={isVisible} />
            </span>
            <p className="mt-3 font-mono text-sm uppercase tracking-wide text-white/50 sm:text-base">{production.label}</p>
          </div>
        )}

        <div className="overflow-hidden bg-black text-white lg:grid lg:grid-cols-[340px_minmax(0,1fr)]">
          <div className="flex flex-col justify-center p-6 text-left sm:p-8 lg:p-12">
            <div className="flex items-baseline gap-3 sm:gap-4">
              <span className="font-mono text-sm text-white/40">{blockNumber}</span>
              <h3 className="font-display text-2xl sm:text-4xl">{blockTitle}</h3>
            </div>
            <p className="mt-4 pl-0 text-base leading-relaxed text-white/55 sm:mt-6 sm:pl-10 sm:text-lg">{subtitle}</p>
          </div>
          <div className="min-w-0 p-6 lg:p-10">
            {production ? (
              <ProductionSlots
                count={production.count}
                isVisible={isVisible}
                videos={videos.socialVideos}
                onOpen={(video) => setActiveVideo({ poster: video.poster, title: video.shortTitle ?? video.title, videoSrc: video.videoSrc })}
              />
            ) : (
              <div className={`flex w-full flex-col items-start gap-6 lg:flex-row ${allSameFormat ? "lg:justify-center" : "lg:justify-end"}`}>
                {allSameFormat ? (
                  videos.socialVideos.map((video) => (
                    <VideoTile
                      key={video.id}
                      video={video}
                      hideMeta={hideVideoMeta}
                      onOpen={() => setActiveVideo({ poster: video.poster, title: video.shortTitle ?? video.title, videoSrc: video.videoSrc })}
                    />
                  ))
                ) : (
                  <>
                    <VideoTile
                      video={verticalOne}
                      hideMeta={hideVideoMeta}
                      onOpen={() => setActiveVideo({ poster: verticalOne.poster, title: verticalOne.shortTitle ?? verticalOne.title, videoSrc: verticalOne.videoSrc })}
                    />
                    <VideoTile
                      video={verticalTwo}
                      hideMeta={hideVideoMeta}
                      onOpen={() => setActiveVideo({ poster: verticalTwo.poster, title: verticalTwo.shortTitle ?? verticalTwo.title, videoSrc: verticalTwo.videoSrc })}
                    />
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {!production && !allSameFormat && (
          <div className="mt-5">
            <VideoCard
              video={horizontalVideo}
              onOpen={() => setActiveVideo({ poster: horizontalVideo.poster, title: horizontalVideo.title, videoSrc: horizontalVideo.videoSrc })}
            />
          </div>
        )}

        {/* Conteúdos para estratégia de aquisição — só existe quando o cliente tem os dois vídeos */}
        {acquisitionVideo && presentationVideo && (
          <div className="mt-8 lg:mt-10">
            <header className="mb-8 text-center lg:mb-10">
              <span className="mb-3 inline-flex items-center gap-3 font-mono text-sm text-white/45"><span className="h-px w-12 bg-[var(--client-accent)]" />{acquisitionEyebrow}<span className="h-px w-12 bg-[var(--client-accent)]" /></span>
              <h2 className="text-balance font-display text-4xl leading-[0.95] tracking-tight sm:text-5xl md:text-7xl lg:text-[96px]">{acquisitionHeadingPrefix} <span className="block text-white/40">{acquisitionHeadingSuffix}</span></h2>
            </header>

            <div className="flex flex-col gap-5 lg:h-[540px] lg:flex-row">
              <VideoCard
                video={acquisitionVideo}
                bare
                stretch
                className="lg:w-[320px] lg:shrink-0"
                onOpen={() => setActiveVideo({ poster: acquisitionVideo.poster, title: acquisitionVideo.title, videoSrc: acquisitionVideo.videoSrc })}
              />

              <VideoCard
                video={presentationVideo}
                stretch
                className="lg:flex-1"
                onOpen={() => setActiveVideo({ poster: presentationVideo.poster, title: presentationVideo.title, videoSrc: presentationVideo.videoSrc })}
              />
            </div>
          </div>
        )}
      </div>
      {activeVideo && <VideoLightbox item={activeVideo} onClose={() => setActiveVideo(null)} />}
    </section>
  );
}
