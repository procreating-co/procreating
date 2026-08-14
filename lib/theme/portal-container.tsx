"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Radix `Portal` (usado por `Dialog`/`Sheet`/`DropdownMenu`/`Tooltip`) renderiza direto em
 * `document.body` por padrão — FORA da árvore DOM de `.os-shell`. Como o tema novo (paleta
 * monocromática, Geist) é escopado via CSS custom property em `.os-shell` (`app/globals.css`,
 * mesmo raciocínio de sempre: nunca em `:root` global, que continua servindo `/admin` e o
 * workspace de cliente), qualquer conteúdo portalado ficava fora do escopo — herdando os tokens
 * antigos do `:root` (o dourado, a fonte antiga). Achado ao ver a cor do item ativo do drawer
 * mobile sair dourada em vez de monocromática.
 *
 * Este contexto guarda o nó DOM de `.os-shell` (`DashboardLayout` é quem provê) — os componentes
 * de portal (`dialog.tsx`, `sheet.tsx`) leem e passam como `container` do `Portal`, então o
 * conteúdo portalado nasce DENTRO de `.os-shell`, herda os tokens certos. Fora do shell interno
 * (`/admin`, `/clients`) o contexto fica `null` — Radix cai no padrão de sempre
 * (`document.body`), zero mudança de comportamento lá.
 */
const PortalContainerContext = createContext<HTMLElement | null>(null);

export function PortalContainerProvider({ children }: { children: (ref: React.RefObject<HTMLDivElement | null>) => ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setContainer(ref.current);
  }, []);

  return <PortalContainerContext.Provider value={container}>{children(ref)}</PortalContainerContext.Provider>;
}

/** `undefined` (não `null`) quando não há provider — é o valor que o Radix `Portal` espera pra
 *  cair no comportamento padrão (`document.body`). */
export function usePortalContainer(): HTMLElement | undefined {
  return useContext(PortalContainerContext) ?? undefined;
}
