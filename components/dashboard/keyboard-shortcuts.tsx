"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export const QUICK_ADD_SHORTCUT_EVENT = "procreating:quick-add-shortcut";

const FOCUSABLE_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

function isTypingContext(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (FOCUSABLE_TAGS.has(target.tagName)) return true;
  return target.isContentEditable;
}

/**
 * Atalhos de letra única (master prompt §61) — `N`/`C`/`I`/`P`, montado uma vez em
 * `DashboardHeader` (mesmo lugar de `CommandPalette`/`QuickAddMenu`, nunca em `/admin`/`/clients`).
 * `⌘K` já existe (`CommandPalette`) e continua tratado lá — este componente só cobre os de letra
 * solta, sem modificador, então a guarda mais importante é: NUNCA disparar com um campo de
 * texto focado (`isTypingContext`) nem quando algum modificador está pressionado (evita brigar
 * com atalho nativo do browser/SO em cima da mesma tecla).
 *
 * `N`/`C` reaproveitam o `QuickAddMenu` já existente — não duplicam formulário/Server Action,
 * só pedem pra ele abrir num passo específico via um evento DOM simples (`QUICK_ADD_SHORTCUT_EVENT`)
 * em vez de levantar estado global novo pra uma coisa tão pequena. `I`/`P` são navegação pura —
 * a URL já é a fonte de verdade de estado neste produto (mesmo padrão de `?tab=`/`?period=`), então
 * "abrir o drawer de importação" vira só um `?import=1` que `ProspeccaoView` lê ao montar.
 */
export function KeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingContext(event.target)) return;

      switch (event.key.toLowerCase()) {
        case "n":
          event.preventDefault();
          window.dispatchEvent(new CustomEvent(QUICK_ADD_SHORTCUT_EVENT, { detail: "tarefa" }));
          break;
        case "c":
          event.preventDefault();
          window.dispatchEvent(new CustomEvent(QUICK_ADD_SHORTCUT_EVENT, { detail: "lead" }));
          break;
        case "i":
          event.preventDefault();
          router.push("/comercial?tab=commercial&panel=lists&import=1");
          break;
        case "p":
          event.preventDefault();
          router.push("/comercial?tab=commercial&panel=lists");
          break;
        default:
          break;
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [router]);

  return null;
}
