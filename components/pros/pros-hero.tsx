"use client";

import { useEffect, useRef } from "react";
import { useTypewriter } from "@/hooks/use-typewriter";

/**
 * Hero — vídeo de fundo + headline em duas linhas (linha 1 fixa, linha 2 digitada em loop) +
 * subheadline. Sem botão de assistir (pedido explícito, ainda vale: é o único vídeo da página
 * que não abre em tela cheia).
 *
 * Tipografia replica a referência (print do hero do cosmos.so — "Your space for inspiration"):
 * sans-serif grande, peso forte, duas linhas com line-height bem compacto (quase coladas),
 * tracking neutro/levemente negativo, centralizado. Fonte: `font-display` (Instrument Sans, já
 * carregada no projeto — ver app/layout.tsx) é o grotesco mais próximo do original que já temos,
 * sem precisar adicionar uma fonte nova só pra isso. Cor: a referência é preta sobre fundo claro,
 * mas nosso Hero tem vídeo escuro atrás — mantemos peso/tamanho/line-height/tracking idênticos,
 * só a cor vira branco (senão o texto fica ilegível sobre o vídeo).
 */
export function ProsHero({
  videoSrc,
  headlineLine1,
  rotatingWords,
  subheadline,
}: {
  videoSrc: string;
  headlineLine1: string;
  rotatingWords: string[];
  subheadline: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { text } = useTypewriter(rotatingWords, { typingSpeed: 70, deletingSpeed: 35, pauseDuration: 3000 });

  // Frase mais longa da lista — reserva a largura da linha 2 pra ela não "pular" o layout
  // enquanto digita/apaga (renderizada invisível, só pra ocupar espaço; o texto visível fica
  // absolutamente posicionado por cima, centralizado).
  const longestWord = rotatingWords.reduce((a, b) => (b.length > a.length ? b : a), "");

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
    <section aria-label={`${headlineLine1} ${longestWord}`} className="relative flex h-[100svh] w-full items-center justify-center overflow-hidden bg-black text-center">
      <video ref={videoRef} autoPlay muted loop playsInline preload="auto" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-60">
        <source src={videoSrc} type="video/mp4" />
      </video>
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-5 px-6">
        <h1 aria-hidden="true" className="text-balance font-display text-[clamp(2.25rem,6.5vw,5.5rem)] font-bold leading-[0.95] tracking-tight text-white">
          <span className="block">{headlineLine1}</span>
          <span className="relative mt-1 inline-block align-top">
            {/* Ghost invisível — define a largura pela maior frase, sem afetar layout. */}
            <span aria-hidden="true" className="invisible block whitespace-nowrap">
              {longestWord}
            </span>
            <span className="absolute inset-0 flex items-center justify-center whitespace-nowrap">
              {text}
              <span className="ml-1 inline-block w-[0.06em] animate-pulse bg-white align-middle" style={{ height: "0.85em" }} />
            </span>
          </span>
        </h1>
        <p className="max-w-xl text-balance text-base leading-relaxed text-white/70 sm:text-lg">{subheadline}</p>
      </div>
    </section>
  );
}
