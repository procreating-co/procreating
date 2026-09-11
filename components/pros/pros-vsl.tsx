"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Volume2, VolumeX } from "lucide-react";
import { Reveal } from "@/components/pros/reveal";

/**
 * VSL — pedido explícito: logo após a transição do Hero, sem texto/headline ao redor, largura
 * muito grande (full-bleed, sem `max-w`/borda), autoplay mudo ao entrar na viewport, com opção
 * de ativar o som. O arquivo real "será enviado posteriormente" — enquanto `videoSrc` não existe,
 * fica um placeholder honesto (mesma convenção "Em produção" já usada no resto do projeto), já no
 * tamanho/proporção que o vídeo real vai ocupar.
 */
export function ProsVsl({ videoSrc, label }: { videoSrc?: string; label: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [unmuted, setUnmuted] = useState(false);

  useEffect(() => {
    if (!videoSrc) return;
    const trigger = wrapperRef.current;
    const video = videoRef.current;
    if (!trigger || !video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.3 },
    );
    observer.observe(trigger);
    return () => observer.disconnect();
  }, [videoSrc]);

  return (
    <section aria-label="Vídeo de apresentação" className="bg-black py-16 lg:py-24">
      <Reveal className="mx-auto w-full max-w-[1600px] px-3 sm:px-6">
        <div ref={wrapperRef} className="relative aspect-video w-full overflow-hidden bg-white/[0.03]">
          {videoSrc ? (
            <>
              <video ref={videoRef} muted={!unmuted} loop playsInline preload="none" className="absolute inset-0 h-full w-full object-cover">
                <source src={videoSrc} type="video/mp4" />
              </video>
              <button
                type="button"
                onClick={() => setUnmuted((v) => !v)}
                aria-label={unmuted ? "Silenciar vídeo" : "Ativar som"}
                className="absolute bottom-4 right-4 flex size-10 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur-sm transition-colors hover:border-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:bottom-6 sm:right-6"
              >
                {unmuted ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
              </button>
            </>
          ) : (
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white/30">
              <span className="flex size-16 items-center justify-center rounded-full border border-white/20 sm:size-20">
                <Play className="ml-1 size-6 sm:size-7" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-wide">{label}</span>
            </span>
          )}
        </div>
      </Reveal>
    </section>
  );
}
