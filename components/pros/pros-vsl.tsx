"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Play, Volume2, VolumeX } from "lucide-react";

/**
 * Bloco 2 — "scroll/drag reveal de vídeo" no estilo Cosmos.so. Sem texto nenhum (pedido
 * explícito) — só o vídeo e os dois controles funcionais (play/tela cheia, mudo/som).
 *
 * `position: sticky` numa wrapper mais alta que a viewport (`h-[220svh]`) produz o "pin" com
 * scroll 100% nativo (mouse/trackpad/touch-drag idênticos, sem código separado pra touch, sem
 * riscos de overscroll do iOS Safari). `useScroll({ target })` só LÊ o progresso de 0 a 1.
 * Vídeo expande via `clip-path` (não width/height) — só propriedades leves.
 *
 * Carregamento rápido (pedido explícito): `preload="metadata"` (não "auto") + o loop mudo do
 * "pill" inicial só começa quando a seção realmente entra perto da viewport (IntersectionObserver
 * com `rootMargin`), em vez de baixar o vídeo inteiro assim que a página carrega.
 */
export function ProsVsl({ videoSrc, onOpenVideo }: { videoSrc: string; onOpenVideo: (src: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [unmuted, setUnmuted] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const trigger = wrapperRef.current;
    const video = videoRef.current;
    if (!trigger || !video) return;
    video.muted = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        video.play().catch(() => {});
        observer.disconnect();
      },
      { rootMargin: "400px" },
    );
    observer.observe(trigger);
    return () => observer.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({ target: wrapperRef, offset: ["start start", "end start"] });
  const playButtonOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.05, 0.5]);

  // Clip-path funcional — expansão real até 0.85, o resto é folga de scroll antes de soltar pro
  // próximo bloco. Ease-out cúbico: rápido no início, suave no fim.
  const clipPath = useTransform(scrollYProgress, (raw) => {
    const p = Math.min(raw / 0.85, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const insetX = 34 * (1 - eased);
    const insetY = 42 * (1 - eased);
    const radius = 180 * (1 - eased);
    return `inset(${insetY}% ${insetX}% round ${radius}px)`;
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const video = videoRef.current;
    if (!video) return;
    if (v >= 0.92 && !expanded) {
      setExpanded(true);
      video.currentTime = 0;
      video.play().catch(() => {});
    } else if (v < 0.85 && expanded) {
      setExpanded(false);
      setUnmuted(false);
      video.muted = true;
    }
  });

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.muted = !unmuted;
  }, [unmuted]);

  if (prefersReducedMotion) {
    return (
      <section aria-label="Vídeo" className="relative bg-black py-16 lg:py-24">
        <div className="mx-auto w-full max-w-[1600px] px-3 sm:px-6">
          <button type="button" onClick={() => onOpenVideo(videoSrc)} aria-label="Assistir vídeo em tela cheia" className="relative block aspect-video w-full overflow-hidden bg-white/[0.03]">
            <video muted playsInline preload="metadata" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover">
              <source src={videoSrc} type="video/mp4" />
            </video>
            <span className="absolute inset-0 flex items-center justify-center bg-black/20">
              <span className="flex size-16 items-center justify-center rounded-full border border-white/60 bg-black/40 text-white backdrop-blur-sm">
                <Play className="ml-1 size-6 fill-current" />
              </span>
            </span>
          </button>
        </div>
      </section>
    );
  }

  return (
    <section ref={wrapperRef} aria-label="Vídeo" className="relative h-[220svh] bg-black">
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        <motion.video ref={videoRef} style={{ clipPath }} loop playsInline preload="metadata" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover">
          <source src={videoSrc} type="video/mp4" />
        </motion.video>
        <motion.div style={{ opacity: overlayOpacity }} aria-hidden="true" className="absolute inset-0 bg-black" />

        <motion.button
          type="button"
          onClick={() => onOpenVideo(videoSrc)}
          style={{ opacity: playButtonOpacity }}
          aria-label="Assistir vídeo em tela cheia"
          className="absolute left-1/2 top-1/2 z-10 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-black/40 text-white backdrop-blur-sm transition-transform hover:scale-110"
        >
          <Play className="ml-1 size-5 fill-current" />
        </motion.button>

        {expanded && (
          <button
            type="button"
            onClick={() => setUnmuted((v) => !v)}
            aria-label={unmuted ? "Silenciar vídeo" : "Ativar som"}
            className="absolute bottom-6 right-6 z-10 flex size-11 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur-sm transition-colors hover:border-white/60"
          >
            {unmuted ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </button>
        )}
      </div>
    </section>
  );
}
