"use client";

import { useEffect, useRef } from "react";

/**
 * Hero — pedido explícito: sem header, sem menu, sem CTA, sem subheadline. Só o vídeo da Pascoal
 * (protagonista, ~100% da tela) com a H1 por cima. Mesma técnica de autoplay/retry de
 * `hero-section.tsx` (o vídeo de fundo da Home da Pascoal) — reaproveitada aqui de propósito.
 */
export function ProsHero({ videoSrc, headline }: { videoSrc: string; headline: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

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
    <section className="relative h-[100svh] w-full overflow-hidden bg-black">
      <video ref={videoRef} autoPlay muted loop playsInline preload="auto" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-80">
        <source src={videoSrc} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/70" aria-hidden="true" />
      <div className="relative z-10 flex h-full w-full items-center justify-center px-6 text-center">
        <h1 className="max-w-4xl text-balance font-display text-[clamp(1.9rem,5.2vw,4.5rem)] font-medium leading-[1.08] tracking-tight text-white">{headline}</h1>
      </div>
    </section>
  );
}
