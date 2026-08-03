"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type FeaturedPhoto = { src: string | null; alt: string; category: string };

function PhotoCarousel({ isVisible, photos, galleryHref }: { isVisible: boolean; photos: FeaturedPhoto[]; galleryHref: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // No touque, o track fica com `touch-action: pan-y` (rolagem vertical nativa e prioritária).
  // Só assumimos o gesto horizontal manualmente quando o próprio movimento do dedo confirma
  // uma intenção lateral — evitando que a galeria capture o swipe e trave o scroll da página.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const AXIS_LOCK_THRESHOLD = 10;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let axis: "x" | "y" | null = null;

    const settleToNearestSlide = () => {
      let nearestIndex = 0;
      let nearestDistance = Infinity;
      slideRefs.current.forEach((slide, i) => {
        if (!slide) return;
        const distance = Math.abs(slide.offsetLeft - el.scrollLeft);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = i;
        }
      });
      slideRefs.current[nearestIndex]?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    };

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      startX = lastX = touch.clientX;
      startY = touch.clientY;
      axis = null;
    };

    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;

      if (axis === null) {
        if (Math.abs(dx) < AXIS_LOCK_THRESHOLD && Math.abs(dy) < AXIS_LOCK_THRESHOLD) return;
        // Vertical tem prioridade: só travamos no eixo horizontal quando o arrasto lateral é
        // claramente dominante, não apenas ligeiramente maior — evita que um swipe de rolagem
        // levemente diagonal seja mal interpretado como um drag da galeria.
        axis = Math.abs(dx) > Math.abs(dy) * 1.25 ? "x" : "y";
        if (axis === "x") el.style.scrollSnapType = "none";
      }

      if (axis === "x") {
        event.preventDefault();
        el.scrollTo({ left: el.scrollLeft - (touch.clientX - lastX), behavior: "auto" });
      }
      lastX = touch.clientX;
    };

    const onTouchEnd = () => {
      if (axis === "x") {
        el.style.scrollSnapType = "";
        settleToNearestSlide();
      }
      axis = null;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, []);

  return (
    <div
      ref={trackRef}
      onWheel={(event) => {
        if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
          event.currentTarget.scrollBy({ left: event.deltaY, behavior: "smooth" });
        }
      }}
      className="flex w-full cursor-grab touch-pan-y snap-x snap-mandatory gap-4 overflow-x-scroll scroll-smooth pb-2 active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {photos.map((photo, index) => (
        <a
          key={photo.category}
          ref={(el) => { slideRefs.current[index] = el; }}
          href={galleryHref}
          className={`group relative h-[380px] w-[78vw] max-w-[280px] shrink-0 snap-start overflow-hidden bg-black transition-all duration-700 sm:h-[430px] sm:w-[46%] sm:max-w-none lg:w-[38%] ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          style={{ transitionDelay: isVisible ? `${index * 120}ms` : "0ms" }}
          aria-label={`Acessar galeria: ${photo.category}`}
        >
          {photo.src ? (
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(min-width: 1024px) 38vw, (min-width: 640px) 46vw, 78vw"
              loading="lazy"
              className="object-cover opacity-80 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100 group-focus-visible:scale-105 group-focus-visible:opacity-100"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-white/[0.02]">
              <span className="font-mono text-xs uppercase tracking-wide text-white/30">Em breve</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent opacity-100 transition-opacity duration-300 lg:opacity-40 lg:group-hover:opacity-100 lg:group-focus-visible:opacity-100" />
          <span className="absolute bottom-5 left-5 right-5 translate-y-0 text-left font-display text-lg text-white opacity-100 transition-all duration-300 lg:translate-y-2 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-visible:translate-y-0 lg:group-focus-visible:opacity-100">{photo.category}</span>
        </a>
      ))}
    </div>
  );
}

export type FeaturesSectionProps = {
  eyebrow: string;
  heading: string;
  blockNumber: string;
  blockTitle: string;
  subtitle: string;
  galleryButtonLabel: string;
  galleryHref: string;
  photos: FeaturedPhoto[];
  /** Opcional — vídeo de fundo do bloco preto, mesmo tratamento visual do Hero. Ausente = fundo sólido preto (padrão). */
  backgroundVideo?: string;
};

export function FeaturesSection({ eyebrow, heading, blockNumber, blockTitle, subtitle, galleryButtonLabel, galleryHref, photos, backgroundVideo }: FeaturesSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setIsVisible(true), { threshold: 0.1 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" ref={sectionRef} className="relative overflow-hidden pb-8 pt-[38px] lg:pb-10">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="mx-auto mb-4 max-w-5xl text-center md:mb-5">
          <span className="mb-4 inline-flex items-center gap-3 font-sans text-sm text-muted-foreground md:mb-5"><span className="h-px w-12 bg-[var(--client-accent)]" />{eyebrow}<span className="h-px w-12 bg-[var(--client-accent)]" /></span>
          <h2 className={`text-balance font-display text-4xl leading-[0.95] tracking-tight transition-all duration-1000 sm:text-5xl md:text-7xl lg:text-[92px] ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
            {heading}
          </h2>
        </div>

        <div id="fotos" className="relative scroll-mt-24 overflow-hidden bg-black text-white lg:grid lg:grid-cols-[340px_minmax(0,1fr)]">
          {backgroundVideo && (
            <div className="absolute inset-0 z-0">
              <video autoPlay muted loop playsInline preload="auto" aria-hidden="true" className="h-full w-full object-cover opacity-75">
                <source src={backgroundVideo} type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-black/55" />
            </div>
          )}
          <div className="relative z-10 flex flex-col justify-center p-6 text-left sm:p-8 lg:p-12">
            <div className="flex items-baseline gap-3 sm:gap-4">
              <span className="font-mono text-sm text-white/40">{blockNumber}</span>
              <h3 className="font-display text-2xl sm:text-4xl">{blockTitle}</h3>
            </div>
            <p className="mt-4 pl-0 text-base leading-relaxed text-white/55 sm:mt-6 sm:pl-10 sm:text-lg">{subtitle}</p>
            <div className="mt-4 hidden pl-0 sm:mt-6 sm:pl-10 lg:block">
              <a href={galleryHref} className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-full bg-[var(--client-accent)] px-6 text-sm font-medium text-black transition-all duration-300 hover:scale-[1.03] hover:bg-white">
                {galleryButtonLabel}
              </a>
            </div>
          </div>
          <div className="relative z-10 min-w-0 p-6 lg:p-10"><PhotoCarousel isVisible={isVisible} photos={photos} galleryHref={galleryHref} /></div>
          <div className="relative z-10 px-6 pb-6 pt-2 lg:hidden">
            <a href={galleryHref} className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-full bg-[var(--client-accent)] px-6 text-sm font-medium text-black transition-all duration-300 hover:scale-[1.03] hover:bg-white">
              {galleryButtonLabel}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
