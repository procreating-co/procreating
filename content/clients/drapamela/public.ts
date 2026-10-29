/**
 * Dra. Pâmela — duplicata da arquitetura da Elenita. O conteúdo real (hero, features, vídeos,
 * galeria) mora em `data/drapamela/{config,videos,gallery}.ts`, servido pelo pipeline legado
 * `ClientConfig` via `lib/clients/registry.ts`. Este arquivo só declara pro `presentation-registry`
 * qual template ela usa (mesma convenção de `elenita/public.ts` e `pascoal/public.ts`).
 */
export const drapamelaPresentationEntry = {
  slug: "drapamela",
  template: "posicionamento-pro",
} as const;
