"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Mesmo mecanismo de entrada-ao-rolar já usado em `components/landing/*` (IntersectionObserver
 *  + transição CSS), só extraído num hook — aqui é reaproveitado em quase toda seção da página,
 *  então vale a pena não repetir o boilerplate 10 vezes. */
export function useScrollReveal<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setIsVisible(true), { threshold });
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

export function Reveal({
  children,
  className,
  style,
  delayMs = 0,
  threshold,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  delayMs?: number;
  threshold?: number;
}) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>(threshold);
  return (
    <div
      ref={ref}
      style={{ ...style, transitionDelay: isVisible ? `${delayMs}ms` : "0ms" }}
      className={cn("transition-all duration-1000 ease-out motion-reduce:transition-none", isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0", className)}
    >
      {children}
    </div>
  );
}
