/**
 * Pascoal não duplica conteúdo aqui, de propósito — o conteúdo real (hero, features, vídeos,
 * galeria, prospecção) continua inteiramente em `data/pascoal/{config,videos,gallery}.ts`,
 * intocado, servido pelo pipeline legado `ClientConfig` via `lib/clients/registry.ts`. Este
 * arquivo só declara pro `presentation-registry` qual template a Pascoal usa — mesma convenção
 * de "uma pasta por cliente em content/clients/" que `elenita/public.ts` segue, sem duplicar
 * dado que já existe em outro lugar.
 */
export const pascoalPresentationEntry = {
  slug: "pascoal",
  template: "posicionamento-pro",
} as const;
