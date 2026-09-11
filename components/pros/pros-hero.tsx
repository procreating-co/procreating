"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/**
 * Hero — pedido explícito: sem header/menu/subheadline/botão, só o vídeo da Pascoal (protagonista)
 * com a H1 "Seu negócio merece ser memorável." por cima. Fonte fina/editorial: `font-light` +
 * `tracking-wide` na família sans já usada em todo o site (`font-display` → Instrument Sans) — sem
 * carregar uma serifa nova, que fica banida do projeto inteiro (pedido explícito reafirmado em
 * outra rodada: "a serif de exibição nunca deve ser usada em NENHUMA página, sem exceção").
 *
 * A entrada da headline (blur→nítido, leve deslocamento, opacidade) é a mesma transição
 * cinematográfica pedida; a transição Hero→VSL é a parte mais importante do pedido — reproduz a
 * lógica do Cosmos (scroll contínuo, sem corte seco) com o Hero fixo (`position: sticky`) numa
 * wrapper alta (`180vh`): enquanto o usuário rola por essa altura, o vídeo/headline ficam
 * ancorados na tela e se transformam (leve zoom-out, escurece, a H1 sai) conforme o progresso do
 * scroll — só então o bloco seguinte (VSL) desliza por cima. `useScroll`/`useTransform` do
 * framer-motion (já dependência real do projeto — usado em propostas/workspace) fazem só a
 * leitura do progresso; o scroll nativo continua 100% intacto, nada de scroll-jacking.
 */
export function ProsHero({ videoSrc, headline }: { videoSrc: string; headline: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => setMounted(true), []);

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

  const { scrollYProgress } = useScroll({ target: wrapperRef, offset: ["start start", "end start"] });
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, prefersReducedMotion ? 1 : 0.94]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.32, 0.8]);
  const headlineOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const headlineY = useTransform(scrollYProgress, [0, 0.4], [0, prefersReducedMotion ? 0 : -48]);

  return (
    <div ref={wrapperRef} className="relative h-[180svh] bg-black">
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        <motion.video
          ref={videoRef}
          style={{ scale: videoScale }}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={videoSrc} type="video/mp4" />
        </motion.video>
        <motion.div style={{ opacity: overlayOpacity }} aria-hidden="true" className="absolute inset-0 bg-black" />
        <div className="relative z-10 flex h-full w-full items-center justify-center px-6 text-center">
          {/* Duas camadas de propósito: a de fora cuida só da entrada ao montar (blur→nítido,
           *  pedido explícito); a de dentro só do fade/deslocamento ligado ao scroll. Misturar os
           *  dois no mesmo elemento via `animate` + `style` (motion value) conflita — o
           *  framer-motion tentaria "possuir" `opacity` dos dois jeitos ao mesmo tempo. Compostas
           *  (opacidade multiplica, Y soma), o resultado visual é o esperado: aparece suave ao
           *  carregar, depois esvai conforme rola. */}
          <motion.div
            initial={{ opacity: 0, y: 14, filter: "blur(14px)" }}
            animate={mounted ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
            transition={{ duration: prefersReducedMotion ? 0.4 : 1.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.h1
              style={{ opacity: headlineOpacity, y: headlineY }}
              className="max-w-3xl text-balance font-display text-[clamp(1.75rem,4.6vw,3.75rem)] font-light leading-[1.15] tracking-wide text-white"
            >
              {headline}
            </motion.h1>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
