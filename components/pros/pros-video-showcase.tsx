"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Play } from "lucide-react";
import type { ActiveVideo } from "@/components/landing/video-lightbox";
import type { ProsVideo } from "@/content/pros/oficinas";

const VideoLightbox = dynamic(() => import("@/components/landing/video-lightbox"));

/** Fade + slide-up ao entrar na viewport. Um observer por bloco, dispara uma vez só. Respeita
 *  `prefers-reduced-motion`: aparece direto, sem animação. */
function Reveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { threshold: 0.15, rootMargin: "-40px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
      {children}
    </div>
  );
}

/** Um vídeo horizontal — o próprio `<video>` (mudo, sem controles) serve de thumbnail real, com
 *  `IntersectionObserver` pra tocar/pausar 1 frame assim que entra na tela (corrige o card preto
 *  no Safari/iOS sem gesto do usuário). Sem número/rótulo. Clicável em tela cheia. */
function VideoTile({ video, onOpen }: { video: ProsVideo; onOpen: () => void }) {
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
      aria-label="Assistir vídeo em tela cheia"
      className="group relative block aspect-video w-full overflow-hidden rounded-lg border border-white/10 bg-black text-left"
    >
      <video ref={videoRef} muted playsInline preload="metadata" onLoadedData={(e) => e.currentTarget.pause()} aria-hidden="true" className="absolute inset-0 h-full w-full object-cover">
        <source src={video.src} type="video/mp4" />
      </video>
      <span className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/35" />
      <span className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-black/35 text-white backdrop-blur-sm transition-all group-hover:scale-110 group-hover:border-[var(--client-accent)] group-hover:text-[var(--client-accent)]">
        <Play className="ml-1 size-5 fill-current" />
      </span>
    </button>
  );
}

/**
 * Seção "O que fazemos" — pedido explícito (rodada "foco no mobile"): fluxo alternado eyebrow +
 * heading → vídeo 1 → legenda → vídeo 2, tudo em coluna única. Pensado pra celular (é exatamente
 * como a tela já lê a página de qualquer forma), mas funciona igual no desktop — só com mais
 * respiro (`max-w-4xl` centralizado). Substitui a grade de vídeos numerados da rodada anterior.
 * Cada bloco entra com scroll-reveal.
 */
export function ProsVideoShowcase({
  eyebrow,
  heading,
  video1,
  caption,
  video2,
}: {
  eyebrow: string;
  heading: string;
  video1: ProsVideo;
  caption: string;
  video2: ProsVideo;
}) {
  const [activeVideo, setActiveVideo] = useState<ActiveVideo | null>(null);
  const open = (src: string) => setActiveVideo({ poster: "", title: "Vídeo", videoSrc: src });

  return (
    <section aria-label="O que fazemos" className="relative overflow-hidden bg-[oklch(0.09_0.01_260)] px-6 py-16 text-white lg:px-12 lg:py-24">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-10 text-center lg:gap-12">
        <Reveal>
          <div className="flex flex-col items-center gap-4">
            <span className="inline-flex items-center gap-3 font-mono text-sm text-white/45">
              <span className="h-px w-12 bg-[var(--client-accent)]" />
              {eyebrow}
              <span className="h-px w-12 bg-[var(--client-accent)]" />
            </span>
            <h2 className="text-balance font-display text-3xl leading-[1.05] tracking-tight sm:text-4xl md:text-5xl">{heading}</h2>
          </div>
        </Reveal>

        <Reveal>
          <div className="w-full">
            <VideoTile video={video1} onOpen={() => open(video1.src)} />
          </div>
        </Reveal>

        <Reveal>
          <p className="text-balance font-display text-2xl leading-snug tracking-tight text-white/70 sm:text-3xl md:text-4xl">{caption}</p>
        </Reveal>

        <Reveal>
          <div className="w-full">
            <VideoTile video={video2} onOpen={() => open(video2.src)} />
          </div>
        </Reveal>
      </div>

      {activeVideo && <VideoLightbox item={activeVideo} onClose={() => setActiveVideo(null)} />}
    </section>
  );
}
