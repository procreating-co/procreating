"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import type { ProsMediaItem } from "@/content/pros/oficinas";
import { cn } from "@/lib/utils";

const ASPECT_CLASS: Record<ProsMediaItem["orientation"], string> = {
  vertical: "aspect-[9/16]",
  horizontal: "aspect-video",
  square: "aspect-square",
};

/**
 * Uma peça de mídia real (foto ou vídeo) da grade editorial — usada em "O que fizemos", no
 * "depois" do case e em "o que pode ser mostrado". Vídeo usa a MESMA técnica corrigida em
 * `videos-placeholder-section.tsx` (a própria `<video>` muda + `.play()`/`.pause()` assim que
 * entra na tela, via IntersectionObserver) pra pintar um frame real em qualquer navegador,
 * inclusive iOS — sem poster inventado. Clique abre em tela cheia (`VideoLightbox`, mesmo
 * componente reaproveitado em toda a Home da Pascoal).
 */
export function ProsMediaTile({ item, onOpenVideo, className }: { item: ProsMediaItem; onOpenVideo?: (src: string) => void; className?: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (item.kind !== "video") return;
    const trigger = wrapperRef.current;
    const v = videoRef.current;
    if (!trigger || !v) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        v.play().catch(() => {});
        observer.disconnect();
      },
      { rootMargin: "200px" },
    );
    observer.observe(trigger);
    return () => observer.disconnect();
  }, [item]);

  return (
    <div ref={wrapperRef} className={cn("relative overflow-hidden rounded-md bg-white/[0.03]", ASPECT_CLASS[item.orientation], className)}>
      {item.kind === "image" ? (
        <Image src={item.src} alt={item.alt} fill sizes="(min-width: 1024px) 45vw, 90vw" className="object-cover" />
      ) : (
        <button type="button" onClick={() => onOpenVideo?.(item.src)} aria-label="Abrir vídeo em tela cheia" className="group absolute inset-0 block h-full w-full text-left">
          <video ref={videoRef} muted playsInline preload="metadata" aria-hidden="true" onLoadedData={(e) => e.currentTarget.pause()} className="absolute inset-0 h-full w-full object-cover">
            <source src={item.src} type="video/mp4" />
          </video>
          <span className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/30" />
          <span className="absolute left-1/2 top-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-black/30 text-white backdrop-blur-sm transition-transform group-hover:scale-110">
            <Play className="ml-0.5 size-4 fill-current" />
          </span>
        </button>
      )}
    </div>
  );
}
