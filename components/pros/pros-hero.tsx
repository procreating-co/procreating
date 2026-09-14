"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Play, Volume2, VolumeX } from "lucide-react";

/**
 * Hero — "scroll/drag reveal de vídeo" no estilo Cosmos.so (pedido explícito). Abordagem técnica
 * escolhida, conforme pedido de avisar antes de implementar:
 *
 *  - SEM GSAP/ScrollTrigger. O projeto já tem `framer-motion` (real dependência, usada em
 *    propostas/workspace/esta própria página) e JÁ implementava um pin+scrub de scroll pra esta
 *    mesma seção (a versão anterior deste arquivo) com `position: sticky` + `useScroll`/
 *    `useTransform` — a mudança aqui é só NO QUE é interpolado (antes: leve zoom-out do vídeo de
 *    fundo; agora: expansão de um vídeo pequeno até tela cheia). Adicionar GSAP só pra isto
 *    duplicaria uma capacidade que o projeto já tem, com um pacote a mais pra manter.
 *  - SEM scroll-jacking manual (sem `wheel`/`touchmove` interceptados). `position: sticky` numa
 *    wrapper mais alta que a viewport (`h-[220svh]`) já produz o "pin" — o scroll continua 100%
 *    nativo (mouse, trackpad, touch/drag no mobile funcionam idênticos, de graça, sem código
 *    separado pra touch) enquanto `useScroll({ target })` só LÊ o progresso de 0 a 1 conforme a
 *    wrapper passa pela viewport. Isso evita exatamente os problemas que o pedido original
 *    alertava (conflito com bounce/overscroll do iOS Safari, inércia de trackpad quebrada) — a
 *    solução com wheel/touchmove manuais teria esse risco; sticky+scroll nativo não tem.
 *  - Expansão do vídeo via `clip-path: inset(... round ...)` (não largura/altura) — o vídeo já
 *    ocupa `absolute inset-0` o tempo todo; o clip-path só revela progressivamente mais dele, com
 *    o raio da borda embutido no próprio valor (`round`), sem precisar animar `border-radius`
 *    separado nem lidar com mismatch de razão de aspecto entre "pill pequena" e "tela cheia". Só
 *    propriedades leves pro navegador: `clipPath` (composto, não gera reflow) e `scale`/`opacity`
 *    pro resto — nada de `width`/`height` animados de verdade.
 *
 * Progresso (`scrollYProgress`, 0→1) controla tudo:
 *  - 0 → 0.15: play button do thumbnail visível (abre em tela cheia se clicado, sem precisar rolar).
 *  - 0 → 0.4: headline esvai (opacidade + leve deslocamento).
 *  - 0 → 0.85: o vídeo expande do "pill" pequeno até cobrir a tela (`clip-path`).
 *  - >= 0.92: vídeo "trava" expandido e começa a tocar (mudo, com botão de unmute) — abaixo disso
 *    volta a pausar/resetar (reversível, pedido explícito). O restante da altura da wrapper
 *    (0.92→1) é só a folga de scroll antes de soltar pro próximo bloco (VSL) — nada mais anima
 *    aí, então rolar além disso já é scroll normal saindo da seção.
 *
 * `prefers-reduced-motion`: pula o pin/scrub inteiro — vídeo pequeno estático, botão de play abre
 * direto em tela cheia (`onOpenVideo`, o MESMO lightbox reaproveitado pela galeria).
 */
export function ProsHero({ videoSrc, headline, onOpenVideo }: { videoSrc: string; headline: string; onOpenVideo: (src: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [unmuted, setUnmuted] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => setMounted(true), []);

  // Vídeo sempre mudo/loop de fundo (thumbnail vivo) até o progresso travar em tela cheia — ver
  // useMotionValueEvent abaixo pra o play "de verdade" (mudo, autoplay-safe) no fim do scrub.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.play().catch(() => {});
  }, []);

  const { scrollYProgress } = useScroll({ target: wrapperRef, offset: ["start start", "end start"] });

  const headlineOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const headlineY = useTransform(scrollYProgress, [0, 0.4], [0, prefersReducedMotion ? 0 : -48]);
  const playButtonOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.05, 0.5]);

  // Clip-path funcional (não from/to automático) — mais fácil de reajustar curva/tamanho do
  // "pill" inicial sem depender da interpolação de string do framer-motion. `p` já vem 0-1
  // clampado pelo próprio useScroll; a expansão real acontece só até 0.85 (o resto é folga).
  const clipPath = useTransform(scrollYProgress, (raw) => {
    const p = Math.min(raw / 0.85, 1);
    const eased = 1 - Math.pow(1 - p, 3); // ease-out cúbico — expansão rápida no início, suave no fim
    const insetX = 34 * (1 - eased);
    const insetY = 42 * (1 - eased);
    const radius = 180 * (1 - eased);
    return `inset(${insetY}% ${insetX}% round ${radius}px)`;
  });

  // Play "de verdade" só quando o vídeo termina de expandir — e reversível: volta pausado/mudo se
  // o usuário rolar de volta antes de completar (pedido explícito).
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
      <section aria-labelledby="pros-hero-heading" className="relative flex min-h-[100svh] flex-col items-center justify-center gap-10 bg-black px-6 py-20 text-center">
        <h1 id="pros-hero-heading" className="max-w-3xl text-balance font-display text-[clamp(1.75rem,4.6vw,3.75rem)] font-light leading-[1.15] tracking-wide text-white">
          {headline}
        </h1>
        <button
          type="button"
          onClick={() => onOpenVideo(videoSrc)}
          aria-label="Assistir vídeo em tela cheia"
          className="relative aspect-video w-full max-w-md overflow-hidden rounded-2xl border border-white/15"
        >
          <video muted playsInline preload="metadata" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover">
            <source src={videoSrc} type="video/mp4" />
          </video>
          <span className="absolute inset-0 flex items-center justify-center bg-black/20">
            <span className="flex size-14 items-center justify-center rounded-full border border-white/60 bg-black/40 text-white backdrop-blur-sm">
              <Play className="ml-1 size-5 fill-current" />
            </span>
          </span>
        </button>
      </section>
    );
  }

  return (
    <section ref={wrapperRef} aria-labelledby="pros-hero-heading" className="relative h-[220svh] bg-black">
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        <motion.video ref={videoRef} style={{ clipPath }} loop playsInline preload="auto" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover">
          <source src={videoSrc} type="video/mp4" />
        </motion.video>
        <motion.div style={{ opacity: overlayOpacity }} aria-hidden="true" className="absolute inset-0 bg-black" />

        {/* Play do estado "pill" — clicável mesmo sem rolar, abre a MESMA tela cheia que o fim do
         *  scrub liga (pedido explícito: todo vídeo precisa ser clicável em tela cheia). */}
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

        <div className="relative z-[5] flex h-full w-full items-center justify-center px-6 text-center">
          {/* Duas camadas de propósito: a de fora cuida só da entrada ao montar (blur→nítido,
           *  pedido explícito); a de dentro só do fade/deslocamento ligado ao scroll. */}
          <motion.div
            initial={{ opacity: 0, y: 14, filter: "blur(14px)" }}
            animate={mounted ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.h1
              id="pros-hero-heading"
              style={{ opacity: headlineOpacity, y: headlineY }}
              className="max-w-3xl text-balance font-display text-[clamp(1.75rem,4.6vw,3.75rem)] font-light leading-[1.15] tracking-wide text-white"
            >
              {headline}
            </motion.h1>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
