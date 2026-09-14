"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Play, Volume2, VolumeX } from "lucide-react";

const LOCK_DURATION_MS = 3000;
const OPEN_DURATION_S = 0.9;
const CLOSE_DURATION_S = 0.7;
const EASE = [0.16, 1, 0.3, 1] as const;

function computeBoxSizes() {
  const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const smallWidth = Math.min(640, vw * 0.92);
  const largeWidth = Math.min(vw * 0.95, 1600);
  return {
    small: { width: smallWidth, height: (smallWidth * 9) / 16, borderRadius: 32 },
    large: { width: largeWidth, height: Math.min(vh * 0.88, 900), borderRadius: 12 },
  };
}

/**
 * Bloco 2 — pedido explícito (ajuste desta rodada, substitui o scrub contínuo por scroll que
 * existia antes): não é mais "acompanha o progresso do scroll pixel a pixel". Agora é um gatilho
 * — o vídeo começa pequeno (pill, ~640px), e o PRIMEIRO gesto de rolar pra baixo enquanto essa
 * seção está em foco já abre ele no tamanho grande (animação de tamanho fixo, não presa ao
 * scroll). Rolar pra baixo durante a animação/trava é absorvido (não deixa a página passar);
 * rolar pra CIMA a qualquer momento antes ou durante a trava fecha e devolve o controle.
 *
 * Depois de aberto, trava o scroll pra baixo por `LOCK_DURATION_MS` (~3s de visualização mínima
 * no tamanho grande) antes de liberar a página pra continuar. Timeout de segurança garante que
 * nunca fica preso pra sempre. Tudo desativado com `prefers-reduced-motion` (mostra só um botão
 * de assistir, sem nenhum scroll-jacking).
 *
 * Vídeo deslocado 3cm pra cima (pedido explícito) via `translateY(-3cm)` — ajuste fino de
 * posição, não interfere na animação de tamanho.
 */
export function ProsVsl({ videoSrc, onOpenVideo }: { videoSrc: string; onOpenVideo: (src: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const [boxSizes, setBoxSizes] = useState(computeBoxSizes);
  const [stage, setStage] = useState<"small" | "large">("small");
  const [transitioning, setTransitioning] = useState(false);
  const [locked, setLocked] = useState(false);
  const [unmuted, setUnmuted] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const releasedRef = useRef(false);

  useEffect(() => {
    const onResize = () => setBoxSizes(computeBoxSizes());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Loop mudo do "pill" inicial só começa perto da viewport (carregamento rápido), não assim que
  // a página carrega.
  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;
    video.muted = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        video.play().catch(() => {});
        observer.disconnect();
      },
      { rootMargin: "400px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Detecta quando a seção está "em foco" (dominando a viewport) — só aí o primeiro scroll pra
  // baixo abre o vídeo. Ao sair de vista rolando de volta pra cima (retirada), reseta pra small,
  // permitindo a experiência de novo numa próxima passagem.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsActive(entry.isIntersecting);
        if (!entry.isIntersecting && entry.boundingClientRect.top > 0) {
          releasedRef.current = false;
          setStage("small");
          setLocked(false);
          setTransitioning(false);
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const openVideo = () => {
    setTransitioning(true);
    setStage("large");
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => {});
    }
  };

  const closeVideo = () => {
    setTransitioning(true);
    setStage("small");
    setUnmuted(false);
    const video = videoRef.current;
    if (video) video.muted = true;
  };

  // Libera a trava sozinha após LOCK_DURATION_MS. Timeout de segurança extra por garantia — nunca
  // deixa a página presa indefinidamente mesmo se algo falhar.
  useEffect(() => {
    if (!locked) return;
    const release = setTimeout(() => {
      setLocked(false);
      releasedRef.current = true;
    }, LOCK_DURATION_MS);
    const safety = setTimeout(() => {
      setLocked(false);
      releasedRef.current = true;
    }, LOCK_DURATION_MS + 1500);
    return () => {
      clearTimeout(release);
      clearTimeout(safety);
    };
  }, [locked]);

  // Intercepta wheel/touch: "small" + em foco → primeiro gesto pra baixo abre (em vez de rolar a
  // página). Durante a animação de abrir/fechar, absorve tudo. Travado (grande, dwell de 3s), só
  // intercepta pra baixo — pra cima sempre cancela a trava e fecha, devolvendo o scroll.
  useEffect(() => {
    if (prefersReducedMotion || releasedRef.current) return;
    if (!isActive && stage === "small" && !transitioning && !locked) return;

    const handleWheel = (e: WheelEvent) => {
      if (releasedRef.current) return;
      if (transitioning) {
        e.preventDefault();
        return;
      }
      if (stage === "small") {
        if (e.deltaY > 0 && isActive) {
          e.preventDefault();
          openVideo();
        }
        return;
      }
      if (locked) {
        if (e.deltaY > 0) {
          e.preventDefault();
        } else if (e.deltaY < 0) {
          e.preventDefault();
          setLocked(false);
          closeVideo();
        }
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? 0;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (releasedRef.current) return;
      const currentY = e.touches[0]?.clientY ?? touchStartY;
      const draggingDown = touchStartY - currentY; // positivo = dedo subindo = página rolando pra baixo
      if (transitioning) {
        e.preventDefault();
        return;
      }
      if (stage === "small") {
        if (draggingDown > 8 && isActive) {
          e.preventDefault();
          openVideo();
        }
        return;
      }
      if (locked) {
        if (draggingDown > 0) {
          e.preventDefault();
        } else if (draggingDown < -8) {
          e.preventDefault();
          setLocked(false);
          closeVideo();
        }
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [isActive, stage, transitioning, locked, prefersReducedMotion]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.muted = !unmuted;
  }, [unmuted]);

  const expanded = stage === "large";

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

  const box = boxSizes[stage];

  return (
    <section ref={sectionRef} aria-label="Vídeo" className="relative flex h-[100svh] w-full items-center justify-center overflow-hidden bg-black">
      <motion.div
        animate={{ width: box.width, height: box.height, borderRadius: box.borderRadius }}
        transition={{ duration: stage === "large" ? OPEN_DURATION_S : CLOSE_DURATION_S, ease: EASE }}
        onAnimationComplete={() => {
          setTransitioning(false);
          if (stage === "large") setLocked(true);
        }}
        style={{ transform: "translateY(-3cm)" }}
        className="relative overflow-hidden bg-white/[0.03]"
      >
        <video ref={videoRef} loop playsInline preload="metadata" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover">
          <source src={videoSrc} type="video/mp4" />
        </video>
        <div aria-hidden="true" className="absolute inset-0 bg-black transition-opacity duration-700" style={{ opacity: expanded ? 0.35 : 0.05 }} />

        {stage === "small" && (
          <button
            type="button"
            onClick={() => onOpenVideo(videoSrc)}
            aria-label="Assistir vídeo em tela cheia"
            className="absolute left-1/2 top-1/2 z-10 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-black/40 text-white backdrop-blur-sm transition-transform hover:scale-110"
          >
            <Play className="ml-1 size-5 fill-current" />
          </button>
        )}

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

        {/* Indicador discreto da trava: barra fininha no rodapé, enche em 3s. */}
        {locked && (
          <motion.div
            key="lock-bar"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: LOCK_DURATION_MS / 1000, ease: "linear" }}
            style={{ transformOrigin: "left" }}
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-[2px] bg-white/50"
          />
        )}
      </motion.div>
    </section>
  );
}
