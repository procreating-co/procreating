"use client";

import { useEffect, useRef } from "react";
import type { ProsVideo } from "@/content/pros/oficinas";

/**
 * Um vídeo — o próprio `<video>` (mudo, sem controles) serve de thumbnail real, com
 * `IntersectionObserver` pra tocar/pausar 1 frame assim que entra na tela (corrige o card preto
 * no Safari/iOS sem gesto do usuário). Sem numeração. Clicável em tela cheia — pedido explícito
 * desta rodada: sem o ícone de play visível (o card inteiro continua clicável, só o círculo com o
 * triângulo foi removido).
 */
export function VideoTile({ video, orientation, onOpen }: { video: ProsVideo; orientation: "vertical" | "horizontal"; onOpen: () => void }) {
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
      <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
    </button>
  );
}
