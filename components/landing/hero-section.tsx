"use client";

import { useEffect, useRef, useState } from "react";
import type { Metric } from "@/lib/clients/types";

const WELCOME_TYPE_MS = 40;

/** Digita as duas linhas de boas-vindas uma \u00FAnica vez ao carregar a p\u00E1gina. */
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

function AnimatedTitle({ lines }: { lines: [string, string] }) {
  const { line1, line2, activeLine } = useTypedWelcome(lines);
  return (
    <span aria-label={`${lines[0]} ${lines[1]}`}>
      <span className="block" aria-hidden="true">
        {line1}
        {activeLine === 1 && <span className="animate-pulse">|</span>}
      </span>
      <span className="block font-medium text-white" aria-hidden="true">
        {line2}
        {activeLine === 2 && <span className="animate-pulse">|</span>}
      </span>
    </span>
  );
}

/** Duração compartilhada por toda animação de entrada do bloco (parágrafo + números + rótulos),
 *  para que tudo aparece junto, de forma fluida e padronizada. */
const STATS_REVEAL_MS = 900;

/** Contador em passos discretos, cada um com um leve "rolar" — como o marcador de um posto de gasolina. */
function AnimatedNumber({ value, pad = 0, start, duration = STATS_REVEAL_MS }: { value: number; pad?: number; start: boolean; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(value);
      return;
    }
    const steps = Math.max(Math.min(value, 40), 1);
    let step = 0;
    let timeoutId: ReturnType<typeof setTimeout>;
    const tick = () => {
      step++;
      const progress = Math.min(step / steps, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(value * eased));
      if (step < steps) timeoutId = setTimeout(tick, duration / steps);
    };
    timeoutId = setTimeout(tick, duration / steps);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, value, duration]);

  return (
    <span key={count} className="animate-char-in inline-block">
      {String(count).padStart(pad, "0")}
    </span>
  );
}

export type HeroSectionProps = {
  welcomeLines: [string, string];
  backgroundVideo: string;
  paragraph: string;
  stats: { videos: Metric; photos: Metric };
};

export function HeroSection({ welcomeLines, backgroundVideo, paragraph, stats }: HeroSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => setIsVisible(true), []);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setStatsVisible(true), { threshold: 0.35 });
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // Alguns navegadores mobile ignoram o atributo `muted` do JSX na primeira renderização
    // e bloqueiam o autoplay; setar a propriedade via ref e tentar de novo no primeiro toque resolve.
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
        <video ref={videoRef} autoPlay muted loop playsInline preload="auto" aria-hidden="true" className="hero-bg-video h-full w-full object-cover object-center opacity-75">
          <source src={backgroundVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/55" />
      </div>
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1400px] flex-col justify-center px-6 lg:px-12">
        <div className={`max-w-6xl transition-all duration-1000 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
          <h1 className="text-balance font-display text-[clamp(2.25rem,5vw,5rem)] leading-[1.02] tracking-tight"><AnimatedTitle lines={welcomeLines} /></h1>
        </div>
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-44 bg-gradient-to-b from-transparent via-black/55 to-background" />
      <div ref={statsRef} className={`absolute bottom-10 left-0 right-0 z-10 transition-all delay-500 duration-1000 sm:bottom-[57px] ${isVisible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}`}>
        <div
          className={`mx-auto flex max-w-[1400px] flex-col gap-4 px-6 transition-all ease-out sm:grid sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-baseline sm:gap-x-8 sm:gap-y-0 lg:gap-x-12 lg:pl-12 lg:pr-[88px] ${statsVisible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
          style={{ transitionDuration: `${STATS_REVEAL_MS}ms` }}
        >
          <p className="text-balance text-center font-display text-2xl font-light leading-snug tracking-tight sm:truncate sm:text-left sm:text-3xl sm:leading-none md:text-4xl">{paragraph}</p>
          <div className="flex items-start justify-center gap-8 sm:contents">
            <div className="flex shrink-0 flex-col items-center gap-1 text-center sm:flex-row sm:items-baseline sm:gap-2 sm:text-left">
              <span className="font-display text-3xl leading-none text-[var(--client-accent)] sm:text-4xl"><AnimatedNumber value={stats.videos.count} pad={2} start={statsVisible} /></span>
              <span className="whitespace-nowrap text-xs leading-none text-white/50 sm:text-sm">{stats.videos.label}</span>
            </div>
            <div className="flex shrink-0 flex-col items-center gap-1 text-center sm:flex-row sm:items-baseline sm:gap-2 sm:text-left">
              <span className="font-display text-3xl leading-none text-[var(--client-accent)] sm:text-4xl"><AnimatedNumber value={stats.photos.count} start={statsVisible} /></span>
              <span className="whitespace-nowrap text-xs leading-none text-white/50 sm:text-sm">{stats.photos.label}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
