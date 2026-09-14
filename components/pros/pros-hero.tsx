"use client";

import { useEffect, useRef } from "react";

/**
 * Hero — pedido explícito (simplificação radical desta rodada): SÓ o vídeo, sem headline, sem
 * subheadline, sem CTA, sem botão de assistir. É o único vídeo da página que não pode ser aberto
 * em tela cheia (pedido explícito) — por isso, ao contrário de todo o resto, não tem `onOpenVideo`
 * nenhum, nem elemento clicável.
 */
export function ProsHero({ videoSrc }: { videoSrc: string }) {
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
    <section aria-label="Vídeo" className="relative h-[100svh] w-full overflow-hidden bg-black">
      <video ref={videoRef} autoPlay muted loop playsInline preload="auto" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover">
        <source src={videoSrc} type="video/mp4" />
      </video>
    </section>
  );
}
