/**
 * Contrato do template "Presentation" — a primeira das 3 opções de template do Client Hub
 * (`Presentation | Portfolio | Landing Page`, ver `lib/clients/workspace-types.ts`). Cada
 * template teria seu próprio tipo de conteúdo aqui quando existir (ex.:
 * `lib/clients/portfolio-types.ts`) — não criado agora, sem cliente usando ainda.
 *
 * Isto é inteiramente separado de `lib/clients/types.ts` (`ClientConfig`, o formato legado só
 * da Pascoal) — um projeto novo na plataforma multi-cliente nunca usa `ClientConfig`.
 */
export type PresentationSection = {
  key: string;
  title: string;
  body: string;
};

export type PresentationContent = {
  slug: string;
  brandName: string;
  /** Frase de posicionamento — a linha principal do hero, abaixo do nome. */
  positioning: string;
  /** Nota pequena, honesta, sobre o estado atual da apresentação (ex.: "em construção"). */
  heroNote: string;
  accentColor: string;
  metaTitle: string;
  metaDescription: string;
  /** Seções preparadas — Sobre/Projeto/Conteúdos/Fotos/Vídeos/Estratégia, nesta ordem. */
  sections: PresentationSection[];
};
