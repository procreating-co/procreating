"use client";

import { useEffect, useRef, useState } from "react";

const WELCOME_TYPE_MS = 40;

/** Digita as duas linhas uma única vez ao carregar — mesma mecânica do `HeroSection`
 *  compartilhado (`components/landing/hero-section.tsx`), duplicada aqui (componente pequeno,
 *  não vale a pena extrair um hook compartilhado só por isso) pra não mexer em nada usado pelo
 *  site real do cliente. */
function useTypedWelcome(lines: [string, string]) {
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [activeLine, setActiveLine] = useState<1 | 2 | null>(1);

  useEffect(() => {
    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const schedule = (fn: () => void, delay: number) => {
      timeouts.push(setTimeout(() => !cancelled && fn(), delay));
    };

    const typeText = (text: string, setter: (value: string) => void, onDone: () => void) => {
      let i = 0;
      const step = () => {
        if (cancelled) return;
        setter(text.slice(0, i));
        if (i >= text.length) return onDone();
        i++;
        schedule(step, WELCOME_TYPE_MS);
      };
      step();
    };

    setActiveLine(1);
    typeText(lines[0], setLine1, () => {
      setActiveLine(2);
      typeText(lines[1], setLine2, () => setActiveLine(null));
    });

    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { line1, line2, activeLine };
}

/**
 * Hero — réplica do `HeroSection` compartilhado, sem o parágrafo e sem a estatística numérica de
 * baixo (pedido explícito: excluir "Os novos materiais estão aqui..." e qualquer número, "isso de
 * vídeo 01, 02, 03..."). Vídeo de fundo ambiente, sem clique/fullscreen — igual ao Hero real do
 * cliente, que também não abre em tela cheia.
 */
export function ProsHero({ videoSrc, welcomeLines }: { videoSrc: string; welcomeLines: [string, string] }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { line1, line2, activeLine } = useTypedWelcome(welcomeLines);

  useEffect(() => setIsVisible(true), []);

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
    <section className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0 z-0">
        <video ref={videoRef} autoPlay muted loop playsInline preload="auto" aria-hidden="true" className="h-full w-full object-cover object-center opacity-75">
          <source src={videoSrc} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/55" />
      </div>
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1400px] flex-col justify-center px-6 lg:px-12">
        <div className={`max-w-6xl transition-all duration-1000 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
          <h1 className="text-balance font-display text-[clamp(2.25rem,5vw,5rem)] leading-[1.02] tracking-tight">
            <span aria-label={`${welcomeLines[0]} ${welcomeLines[1]}`}>
              <span className="block" aria-hidden="true">
                {line1}
                {activeLine === 1 && <span className="animate-pulse">|</span>}
              </span>
              <span className="block font-medium text-white" aria-hidden="true">
                {line2}
                {activeLine === 2 && <span className="animate-pulse">|</span>}
              </span>
            </span>
          </h1>
        </div>
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-44 bg-gradient-to-b from-transparent via-black/55 to-black" />
    </section>
  );
}
