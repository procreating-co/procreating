"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Play, Volume2, VolumeX } from "lucide-react";

/**
 * Bloco 2 — "scroll/drag reveal de vídeo" no estilo Cosmos.so (pedido explícito, movido do Hero
 * nesta rodada — "o efeito de useScroll/useTransform deve ser no bloco 2"). Sem texto/headline ao
 * redor (pedido original do bloco: o vídeo é o protagonista, nada antes dele).
 *
 * Abordagem técnica (mesma já usada e aprovada quando isto vivia no Hero): SEM GSAP — o projeto
 * já tem `framer-motion`; `position: sticky` numa wrapper mais alta que a viewport (`h-[220svh]`)
 * produz o "pin" com scroll 100% nativo (mouse/trackpad/touch-drag idênticos, sem código
 * separado pra touch, sem os riscos de overscroll do iOS Safari que interceptar wheel/touchmove
 * manualmente teria). `useScroll({ target })` só LÊ o progresso de 0 a 1.
 *
 * Progresso:
 *  - 0 → 0.15: play button do "pill" visível (clicável, abre em tela cheia sem precisar rolar).
 *  - 0 → 0.85: vídeo expande do "pill" pequeno até cobrir a tela via `clip-path` (não width/
 *    height — só propriedades leves: `clip-path` composto + `opacity`).
 *  - >= 0.92: vídeo "trava" expandido e toca de verdade (mudo, botão de unmute); abaixo de 0.85
 *    volta a pausar/mutar — reversível (pedido explícito).
 */
export function ProsVsl({ videoSrc, onOpenVideo }: { videoSrc: string; onOpenVideo: (src: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [unmuted, setUnmuted] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.play().catch(() => {});
  }, []);

  const { scrollYProgress } = useScroll({ target: wrapperRef, offset: ["start start", "end start"] });
  const playButtonOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.05, 0.5]);

  // Clip-path funcional (não from/to automático) — mais fácil de reajustar curva/tamanho do
  // "pill" inicial sem depender da interpolação de string do framer-motion.
  const clipPath = useTransform(scrollYProgress, (raw) => {
    const p = Math.min(raw / 0.85, 1);
    const eased = 1 - Math.pow(1 - p, 3); // ease-out cúbico — expansão rápida no início, suave no fim
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
      <section aria-label="Vídeo de apresentação" className="relative bg-black py-16 lg:py-24">
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
    <section ref={wrapperRef} aria-label="Vídeo de apresentação" className="relative h-[220svh] bg-black">
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        <motion.video ref={videoRef} style={{ clipPath }} loop playsInline preload="auto" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover">
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
