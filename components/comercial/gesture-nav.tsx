"use client";

import { useCallback, useEffect, useRef, type ReactNode, type TouchEvent, type WheelEvent } from "react";
import { useRouter } from "next/navigation";

const FOCUSABLE_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

function isTypingContext(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (FOCUSABLE_TAGS.has(target.tagName)) return true;
  return target.isContentEditable;
}

export type GestureTab = { key: string; href: string };

const H_THRESHOLD = 60; // acumulado mínimo de deltaX (wheel) / deslocamento (touch) pra virar navegação — abaixo disso é ruído normal de scroll
const COOLDOWN_MS = 550; // um swipe físico dispara vários eventos seguidos; sem isso navegaria várias abas de uma vez

/**
 * Navegação por gesto (seções 27-28) — swipe horizontal troca de contexto dentro do Comercial
 * (CRM/Prospecção/Estratégias/Planejamento), sem quebrar o scroll vertical normal da página nem o
 * scroll horizontal PRÓPRIO do Kanban (`.scrollbar-hide`, ver `pipeline-board.tsx`).
 *
 * Dois canais, mesma regra de fundo (horizontal domina vertical → navega; senão ignora e deixa o
 * scroll normal acontecer), cada um na "linguagem" do dispositivo que o gera:
 *
 * `wheel` (trackpad/mouse, evento nativo manda `deltaX`/`deltaY`): acumula `deltaX` a cada evento
 * até passar do threshold — o gesto físico dispara dezenas de eventos, não dá pra decidir num só.
 *
 * `touch` (celular/tablet — sem trackpad, `GestureNav` não tinha suporte nenhum a isto antes):
 * mede o deslocamento total entre `touchstart` e `touchend` de um só toque — mais simples que
 * acumular a cada `touchmove` porque não precisa de `preventDefault()` no meio do gesto (que
 * brigaria com o scroll nativo do browser); decide só quando o dedo já soltou. Convenção padrão
 * de carrossel mobile: arrastar pra ESQUERDA avança (próxima aba), pra DIREITA volta.
 *
 * Os dois canais compartilham `cooldown`/`navigate()` — nunca pulam 2+ abas de um gesto só, e a
 * navegação em si é sempre um `router.push` pra uma URL `?tab=` normal (deep-link/back-forward
 * continuam de graça, não existe estado de carrossel paralelo à URL).
 */
export function GestureNav({ tabs, activeKey, children }: { tabs: GestureTab[]; activeKey: string; children: ReactNode }) {
  const router = useRouter();
  const cooldown = useRef(false);
  const accumulated = useRef(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const navigate = useCallback(
    (direction: 1 | -1) => {
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
      navigate(direction);
    },
    [navigate]
  );

  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest(".scrollbar-hide")) {
      touchStart.current = null;
      return;
    }
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback(
    (e: TouchEvent<HTMLDivElement>) => {
      const start = touchStart.current;
      touchStart.current = null;
      if (!start || cooldown.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - start.x;
      const deltaY = touch.clientY - start.y;
      if (Math.abs(deltaX) <= Math.abs(deltaY)) return;
      if (Math.abs(deltaX) < H_THRESHOLD) return;

      navigate(deltaX < 0 ? 1 : -1); // arrastar pra esquerda = avança
    },
    [navigate]
  );

  // Terceiro canal — teclado (§61: "Arrow Left → contexto anterior, Arrow Right → próximo"),
  // mesmo `navigate()`/cooldown dos outros dois. Listener em `document` (não no `onKeyDown` da
  // div) porque a seta precisa funcionar mesmo sem nada dentro do Comercial estar focado — só se
  // guarda de disparar com um campo de texto focado (mesma checagem de `KeyboardShortcuts`).
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      if (isTypingContext(e.target)) return;
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (cooldown.current) return;

      e.preventDefault();
      navigate(e.key === "ArrowRight" ? 1 : -1);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [navigate]);

  return (
    <div onWheel={handleWheel} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} className="flex flex-col gap-8">
      {children}
    </div>
  );
}
