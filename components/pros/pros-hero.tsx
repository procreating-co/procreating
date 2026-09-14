"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

/**
 * Hero — pedido explícito (correção desta rodada): volta a ser o vídeo original de fundo
 * (`/videos/hero-background.mp4`, "a versão anterior"), como loop simples — o efeito de
 * scroll/drag reveal saiu daqui e foi pro bloco 2 (`ProsVsl`). Headline + subheadline + 2 CTAs
 * (principal: contato; secundário: âncora pro Case) — únicos elementos comerciais desta seção.
 *
 * "Todo vídeo clicável em tela cheia" (pedido explícito, mantido): um botão discreto no canto,
 * não competindo com a headline, abre o mesmo `VideoLightbox` reaproveitado no resto da página.
 */
export function ProsHero({
  videoSrc,
  headline,
  subheadline,
  primaryCta,
  primaryCtaHref,
  secondaryCta,
  secondaryCtaHref,
  onOpenVideo,
}: {
  videoSrc: string;
  headline: string;
  subheadline: string;
  primaryCta: string;
  primaryCtaHref: string;
  secondaryCta: string;
  secondaryCtaHref: string;
  onOpenVideo: (src: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    const tryPlay = () => video.play().catch(() => {});
    tryPlay();
    const retryOnInteraction = () => {
      tryPlay();
      document.removeEventListener("touchstart", retryOnInteraction);
      document.removeEventListener("click", retryOnInteraction);
    };
    document.addEventListener("touchstart", retryOnInteraction, { once: true, passive: true });
    document.addEventListener("click", retryOnInteraction, { once: true });
    return () => {
      document.removeEventListener("touchstart", retryOnInteraction);
      document.removeEventListener("click", retryOnInteraction);
    };
  }, []);

  return (
    <section id="hero" className="relative flex h-[100svh] w-full items-center justify-center overflow-hidden bg-black text-center">
      <video ref={videoRef} autoPlay muted loop playsInline preload="auto" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-70">
        <source src={videoSrc} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/70" aria-hidden="true" />

      <button
        type="button"
        onClick={() => onOpenVideo(videoSrc)}
        aria-label="Assistir vídeo em tela cheia"
        className="absolute bottom-6 left-6 z-10 flex items-center gap-2 text-xs text-white/50 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <span className="flex size-8 items-center justify-center rounded-full border border-white/30">
          <Play className="ml-0.5 size-3 fill-current" />
        </span>
        Assistir
      </button>

      <motion.div
        initial={{ opacity: 0, y: 16, filter: "blur(14px)" }}
        animate={mounted ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-[5] mx-auto flex max-w-3xl flex-col items-center gap-6 px-6"
      >
        <h1 className="text-balance font-display text-[clamp(2rem,5.2vw,4.25rem)] font-light leading-[1.1] tracking-wide text-white">{headline}</h1>
        <p className="max-w-xl text-balance text-base leading-relaxed text-white/60 sm:text-lg">{subheadline}</p>
        <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
          <a
            href={primaryCtaHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-medium text-black transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            {primaryCta}
          </a>
          <a
            href={secondaryCtaHref}
            className="inline-flex items-center justify-center rounded-full border border-white/30 px-7 py-3.5 text-sm text-white transition-colors hover:border-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            {secondaryCta}
          </a>
        </div>
      </motion.div>
    </section>
  );
}
