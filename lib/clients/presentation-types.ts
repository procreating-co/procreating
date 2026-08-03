/**
 * Contrato do template "Presentation" — a primeira das 3 opções de template do Client Hub
 * (`Presentation | Portfolio | Landing Page`, ver `lib/clients/workspace-types.ts`). Cada seção
 * tem forma própria (não um `{title, body}` genérico repetido) porque cada uma pede um
 * tratamento visual diferente no template — é o que evita a apresentação parecer uma lista
 * genérica repetida 7 vezes.
 *
 * Isto é inteiramente separado de `lib/clients/types.ts` (`ClientConfig`, o formato legado só
 * da Pascoal) — um projeto novo na plataforma multi-cliente nunca usa `ClientConfig`.
 */

export type PresentationCta = {
  label: string;
  /** Âncora interna (ex.: "#sobre") — nunca um link externo inventado. */
  href: string;
};

export type PresentationHero = {
  eyebrow: string;
  positioning: string;
  /** Nota pequena, honesta, sobre o estado atual (ex.: "em construção"). */
  note: string;
  /** Legenda do placeholder de mídia principal — nunca um vídeo/imagem falso. */
  mediaLabel: string;
  cta: PresentationCta;
};

export type PresentationProse = {
  eyebrow: string;
  heading: string;
  body: string;
};

export type PresentationPillars = PresentationProse & {
  pillars: string[];
};

export type PresentationTags = PresentationProse & {
  tags: string[];
};

export type PresentationMediaSlots = PresentationProse & {
  /** Legendas dos espaços reservados — nunca uma foto/vídeo real inventado. */
  placeholders: string[];
};

export type PresentationRoadmap = PresentationProse & {
  steps: { title: string; description: string }[];
};

export type PresentationContent = {
  slug: string;
  brandName: string;
  accentColor: string;
  metaTitle: string;
  metaDescription: string;

  hero: PresentationHero;
  sobre: PresentationProse;
  projeto: PresentationPillars;
  conteudos: PresentationTags;
  galeria: PresentationMediaSlots;
  videos: PresentationMediaSlots;
  estrategia: PresentationRoadmap;
};
