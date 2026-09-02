"use client";

import { useEffect } from "react";

/**
 * Porta 1:1 do `<script>` inline da referência — `IntersectionObserver` que adiciona `.cc-visible`
 * a cada `.cc-slide-in` quando 12% dele entra na viewport, e para de observar (dispara uma vez só,
 * igual ao original). Client component só pelo efeito, não renderiza nada.
 */
export function ScrollRevealObserver() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("cc-visible");
            obs.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 },
    );
    const targets = document.querySelectorAll(".cc-slide-in");
    for (const el of targets) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return null;
}
