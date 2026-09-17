"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fade + slide-up ao entrar na viewport — pedido explícito: "em todos textos coloque efeito de
 * aparição". Extraído como componente compartilhado (antes vivia só dentro de
 * `pros-video-showcase.tsx`) porque agora todo bloco de texto da página usa o mesmo efeito, não
 * só os vídeos. Um observer por instância, dispara uma vez só. Respeita `prefers-reduced-motion`:
 * aparece direto, sem animação.
 */
export function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { threshold: 0.15, rootMargin: "-40px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"} ${className}`}>
      {children}
    </div>
  );
}
