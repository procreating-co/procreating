/**
 * Elenita não duplica conteúdo aqui, de propósito — o conteúdo real (hero, features, vídeos,
 * galeria) mora inteiramente em `data/elenita/{config,videos,gallery}.ts`, servido pelo mesmo
 * pipeline legado `ClientConfig` via `lib/clients/registry.ts` que a Pascoal usa. Pivô explícito:
 * a entrega pública da Elenita passa a ter a MESMA arquitetura da Pascoal (não mais o template
 * `Presentation` de seções dinâmicas) — só copy e vídeos mudam depois, direto em `data/elenita/**`.
 * Este arquivo só declara pro `presentation-registry` qual template ela usa, mesma convenção que
 * `pascoal/public.ts` segue.
 */
export const elenitaPresentationEntry = {
  slug: "elenita",
  template: "posicionamento-pro",
} as const;
