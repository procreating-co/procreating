/**
 * Dra. Sandra Gomboski — mesma convenção da Elenita (`content/clients/elenita/public.ts`): o
 * conteúdo real (hero, features, vídeos, galeria) mora em `data/drasandragomboski/*`, servido pelo
 * pipeline legado `ClientConfig`. Este arquivo só declara pro `presentation-registry` qual
 * template ela usa.
 */
export const drasandragomboskiPresentationEntry = {
  slug: "drasandragomboski",
  template: "posicionamento-pro",
} as const;
