"use client";

import type { ReactNode } from "react";

/**
 * Transição sutil ao trocar de aba/gesto dentro do Comercial — `key={tab}` no chamador força
 * remount a cada troca, o que reinicia a animação (`tailwindcss-animate`, já usado por
 * `sheet.tsx`/`dialog.tsx`). Rápida e discreta de propósito (seção 28: "não exagerar") — um
 * fade + leve deslize, nunca uma transição de página cheia.
 */
export function TabTransition({ children }: { children: ReactNode }) {
  return <div className="animate-in fade-in-0 slide-in-from-bottom-1 duration-200">{children}</div>;
}
