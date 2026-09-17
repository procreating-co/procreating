"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Reveal } from "@/components/pros/reveal";
import type { ProsPhoto } from "@/content/pros/oficinas";

const STEP_MS = 2000;
const SETTLE_MS = 700; // tem que ser >= duração da transição de scroll suave

/**
 * "Ensaio Fotográfico" — pedido explícito: visual IDÊNTICO ao carrossel de fotos do site do
 * cliente (`features-section.tsx`/`PhotoCarousel` — mesmo overlay de gradiente, legenda da
 * categoria e opacidade da foto), mas SEM link pra galeria (aqui são `<div>`, não `<a>` — nada
 * clicável) e avançando sozinho a cada 2s em vez de arrastar manualmente (confirmado
 * explicitamente: só o visual muda pra bater com a referência, o comportamento continua o
 * pedido da rodada anterior).
 *
 * Técnica: a lista real vem duplicada uma vez (`[...items, ...items]`); um `setInterval` avança o
 * índice e rola o track até o `offsetLeft` real de cada slide (`scrollTo`, funciona mesmo com
 * `overflow-hidden` — só bloqueia o drag do usuário, não o scroll programático). Ao alcançar a
 * cópia duplicada do primeiro slide, espera a rolagem suave terminar e reseta pro slide 0 real
 * sem transição — o "loop infinito" sem nenhum salto visível. Desativado com
 * `prefers-reduced-motion` (fica parado no primeiro slide).
 */
export function ProsPhotoCarousel({ heading, items }: { heading: string; items: ProsPhoto[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [index, setIndex] = useState(0);
  const doubled = [...items, ...items];

  useEffect(() => {
    if (items.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIndex((i) => i + 1), STEP_MS);
    return () => clearInterval(id);
  }, [items.length]);

  useEffect(() => {
    const track = trackRef.current;
    const target = slideRefs.current[index];
    if (!track || !target) return;
    track.scrollTo({ left: target.offsetLeft, behavior: "smooth" });

    if (index === items.length) {
      const timeout = setTimeout(() => {
        const first = slideRefs.current[0];
        if (first) track.scrollTo({ left: first.offsetLeft, behavior: "auto" });
        setIndex(0);
      }, SETTLE_MS);
      return () => clearTimeout(timeout);
    }
  }, [index, items.length]);

  if (items.length === 0) return null;

  return (
    <section aria-label={heading} className="relative overflow-hidden bg-black py-16 text-white lg:py-20">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <Reveal className="mb-10 text-center lg:mb-12">
          <h2 className="text-balance font-display text-3xl leading-[1.02] tracking-tight sm:text-4xl md:text-6xl lg:text-7xl">{heading}</h2>
        </Reveal>
      </div>

      <Reveal>
        <div ref={trackRef} aria-hidden="true" className="flex gap-4 overflow-hidden px-6 lg:px-12">
          {doubled.map((photo, i) => (
            <div
              key={i}
              ref={(el) => {
                slideRefs.current[i] = el;
              }}
              className="relative h-[380px] w-[78vw] max-w-[280px] shrink-0 overflow-hidden bg-black sm:h-[430px] sm:w-[46%] sm:max-w-none lg:w-[38%]"
            >
              <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 1024px) 38vw, (min-width: 640px) 46vw, 78vw" loading="lazy" className="object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent" />
              <span className="absolute bottom-5 left-5 right-5 text-left font-display text-lg text-white">{photo.category}</span>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
