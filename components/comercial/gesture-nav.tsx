"use client";

import { useCallback, useRef, type ReactNode, type WheelEvent } from "react";
import { useRouter } from "next/navigation";

export type GestureTab = { key: string; href: string };

const H_THRESHOLD = 60; // acumulado mínimo de deltaX pra virar navegação — abaixo disso é ruído normal de scroll
const COOLDOWN_MS = 550; // um swipe físico de trackpad dispara dezenas de eventos wheel; sem isso navegaria várias abas de uma vez

/**
 * Navegação por gesto (seções 27-28) — swipe horizontal de dois dedos troca de contexto dentro do
 * Comercial (CRM/Prospecção/Estratégias/Planejamento), sem quebrar o scroll vertical normal da
 * página nem o scroll horizontal PRÓPRIO do Kanban (`.scrollbar-hide`, ver `pipeline-board.tsx`).
 *
 * Regra de decisão a cada evento `wheel` (trackpad manda `deltaX`/`deltaY` nativamente, sem
 * biblioteca): (1) `|deltaX| <= |deltaY|` → é scroll vertical, ignora e zera o acumulador; (2) o
 * alvo está dentro do board do Pipeline → o scroll horizontal ali já tem dono, não competir; (3)
 * em cooldown → ignora (evita pular 2+ abas num gesto só); (4) acumula `deltaX` até passar do
 * threshold, aí navega UMA aba na direção do gesto e entra em cooldown.
 */
export function GestureNav({ tabs, activeKey, children }: { tabs: GestureTab[]; activeKey: string; children: ReactNode }) {
  const router = useRouter();
  const cooldown = useRef(false);
  const accumulated = useRef(0);

  const handleWheel = useCallback(
    (e: WheelEvent<HTMLDivElement>) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) {
        accumulated.current = 0;
        return;
      }
      if ((e.target as HTMLElement).closest(".scrollbar-hide")) return;
      if (cooldown.current) return;

      accumulated.current += e.deltaX;
      if (Math.abs(accumulated.current) < H_THRESHOLD) return;

      const direction = accumulated.current > 0 ? 1 : -1;
      accumulated.current = 0;
      const index = tabs.findIndex((tab) => tab.key === activeKey);
      const nextIndex = index + direction;
      if (index === -1 || nextIndex < 0 || nextIndex >= tabs.length) return;

      cooldown.current = true;
      router.push(tabs[nextIndex].href, { scroll: false });
      window.setTimeout(() => {
        cooldown.current = false;
      }, COOLDOWN_MS);
    },
    [tabs, activeKey, router]
  );

  return (
    <div onWheel={handleWheel} className="flex flex-col gap-8">
      {children}
    </div>
  );
}
