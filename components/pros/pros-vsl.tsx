"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Play, Volume2, VolumeX } from "lucide-react";

const LOCK_DURATION_MS = 3000;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

// Tamanho inicial (progresso 0, anexo 02): "faixa" central, largura fixa de referência, cai pra
// 92vw em telas estreitas pra nunca estourar a viewport. Altura segue 16:9 dessa largura.
const WIDTH_START = "min(640px, 92vw)";
const HEIGHT_START = `calc(${WIDTH_START} * 9 / 16)`;
const RADIUS_START = "32px";

// Tamanho final (progresso 1, anexo 01): quase full-bleed do container principal do site (mesmo
// teto de 1600px usado no fallback de reduced-motion abaixo), bem mais alto (até 88% da altura
// da viewport). object-cover no vídeo garante que nada distorce nesse crescimento.
const WIDTH_END = "min(95vw, 1600px)";
const HEIGHT_END = "min(88vh, 900px)";
const RADIUS_END = "12px";

/**
 * Bloco 2 — "scroll/drag reveal de vídeo" no estilo Cosmos.so. Sem texto nenhum — só o vídeo e
 * os dois controles funcionais (play/tela cheia, mudo/som).
 *
 * `position: sticky` numa wrapper mais alta que a viewport (`h-[220svh]`) produz o "pin" com
 * scroll 100% nativo (mouse/trackpad/touch-drag idênticos). `useScroll({ target })` só LÊ o
 * progresso de 0 a 1.
 *
 * Crescimento (largura/altura/raio) via `--growth`, uma CSS custom property escrita direto pelo
 * framer-motion a cada frame (sem re-render React), combinada com `calc()` puro em CSS pra
 * interpolar entre o tamanho inicial e final — evita ficar lendo `window.innerWidth/Height` em
 * JS a cada scroll (mais barato, e responde a resize de graça, já que os valores em vw/vh do
 * `calc()` são recalculados pelo navegador sozinhos).
 *
 * TRAVA DE SCROLL: ao progresso chegar em ~1 (vídeo no tamanho máximo), intercepta wheel/touch
 * pra baixo por `LOCK_DURATION_MS` (~3s) — obrigando a visualização mínima do vídeo no tamanho
 * cheio antes de liberar o resto da página. Scroll pra cima continua livre a qualquer momento
 * (desistir e encolher de volta nunca trava). Timeout de segurança garante que o lock nunca
 * prende a página pra sempre mesmo se algo falhar. Desativado inteiro quando
 * `prefers-reduced-motion` está ativo — forçar alguém a esperar 3s parado numa animação que essa
 * pessoa pediu pra não ver seria o oposto do que a preferência pede.
 */
export function ProsVsl({ videoSrc, onOpenVideo }: { videoSrc: string; onOpenVideo: (src: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [unmuted, setUnmuted] = useState(false);
  const [locked, setLocked] = useState(false);
  const [lockCycle, setLockCycle] = useState(0); // muda a cada lock novo, só pra reiniciar a barra de progresso
  const hasLockedOnceRef = useRef(false);
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
  const playButtonOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.05, 0.45]);
  const growth = useTransform(scrollYProgress, (raw) => easeOutCubic(Math.min(Math.max(raw, 0), 1)));

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const video = videoRef.current;
    if (!video) return;

    if (v >= 0.97 && !expanded) {
      setExpanded(true);
      video.currentTime = 0;
      video.play().catch(() => {});
    } else if (v < 0.9 && expanded) {
      setExpanded(false);
      setUnmuted(false);
      video.muted = true;
    }

    // Trava só uma vez por "chegada" ao topo — scrollar de volta abaixo de 0.9 e voltar dispara
    // um novo ciclo de 3s (evita tanto travar a cada tick de scroll perto de 1 quanto nunca mais
    // travar de novo depois da primeira vez).
    if (v >= 0.995 && !prefersReducedMotion && !hasLockedOnceRef.current) {
      hasLockedOnceRef.current = true;
      setLocked(true);
      setLockCycle((c) => c + 1);
    }
    if (v < 0.9) {
      hasLockedOnceRef.current = false;
    }
  });

  // Libera a trava sozinha após LOCK_DURATION_MS. Timeout duplicado (o "safety") só por garantia
  // extra caso o principal falhe por algum motivo (ex. o componente recebeu um novo `locked` no
  // meio do caminho) — nunca deixa a página presa indefinidamente.
  useEffect(() => {
    if (!locked) return;
    const release = setTimeout(() => setLocked(false), LOCK_DURATION_MS);
    const safetyRelease = setTimeout(() => setLocked(false), LOCK_DURATION_MS + 1500);
    return () => {
      clearTimeout(release);
      clearTimeout(safetyRelease);
    };
  }, [locked, lockCycle]);

  // Intercepta wheel/touchmove só enquanto travado, e só o gesto que rolaria pra BAIXO — rolar
  // pra cima (desistir, encolher o vídeo de volta) nunca é bloqueado.
  useEffect(() => {
    if (!locked) return;

    const blockWheelDown = (e: WheelEvent) => {
      if (e.deltaY > 0) e.preventDefault();
    };

    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? 0;
    };
    const blockTouchDown = (e: TouchEvent) => {
      const currentY = e.touches[0]?.clientY ?? touchStartY;
      const draggingUp = touchStartY - currentY; // positivo = dedo subindo = página rolando pra baixo
      if (draggingUp > 0) e.preventDefault();
    };

    window.addEventListener("wheel", blockWheelDown, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", blockTouchDown, { passive: false });
    return () => {
      window.removeEventListener("wheel", blockWheelDown);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", blockTouchDown);
    };
  }, [locked]);

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
      <div className="sticky top-0 flex h-[100svh] w-full items-center justify-center overflow-hidden">
        <motion.div
          style={{
            ["--growth" as string]: growth,
            width: `calc(${WIDTH_START} + var(--growth) * (${WIDTH_END} - ${WIDTH_START}))`,
            height: `calc(${HEIGHT_START} + var(--growth) * (${HEIGHT_END} - ${HEIGHT_START}))`,
            borderRadius: `calc(${RADIUS_START} + var(--growth) * (${RADIUS_END} - ${RADIUS_START}))`,
          }}
          className="relative overflow-hidden bg-white/[0.03]"
        >
          <video ref={videoRef} loop playsInline preload="metadata" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover">
            <source src={videoSrc} type="video/mp4" />
          </video>
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

          {/* Indicador discreto da trava: barra fininha no rodapé, enche em 3s. Não é clicável,
              não tem texto — só um sinal visual sutil de que "está prestes a liberar". */}
          {locked && (
            <motion.div
              key={lockCycle}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: LOCK_DURATION_MS / 1000, ease: "linear" }}
              style={{ transformOrigin: "left" }}
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-[2px] bg-white/50"
            />
          )}
        </motion.div>
      </div>
    </section>
  );
}
