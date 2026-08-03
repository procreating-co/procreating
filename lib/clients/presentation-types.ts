/**
 * Contrato do template "Presentation" — a primeira das 3 opções de template do Client Hub
 * (`Presentation | Portfolio | Landing Page`, ver `lib/clients/workspace-types.ts`).
 *
 * Seções configuráveis: `PresentationContent.sections` é uma lista, não um objeto de campos
 * fixos — um cliente novo troca inteiramente sua apresentação editando `content/clients/<slug>/
 * public.ts` (habilitar/desabilitar/reordenar/trocar seção), sem tocar em nenhum componente. O
 * template (`components/templates/presentation-template.tsx`) percorre a lista e escolhe o
 * renderer certo por `section.type` — nenhuma seção é hardcoded na estrutura da página.
 *
 * `content` é polimórfico por `type` (mesmo espírito de `BlockDataByType` em
 * `lib/platform/blocks.ts`, a arquitetura ainda maior e não implementada do Core Platform) —
 * aqui, pragmático e já real: só os 7 tipos que a Elenita usa hoje, mais tipos que entrarem
 * quando um cliente futuro precisar (`services`, `portfolio`, `testimonials`, `contact`...).
 *
 * Isto é inteiramente separado de `lib/clients/types.ts` (`ClientConfig`, o formato legado só
 * da Pascoal) — um projeto novo na plataforma multi-cliente nunca usa `ClientConfig`.
 */

export type PresentationSectionType = "hero" | "about" | "project" | "content" | "gallery" | "videos" | "strategy";

export type HeroContent = {
  positioning: string;
  note: string;
  mediaLabel: string;
  cta: { label: string; href: string };
};

export type AboutContent = {
  heading: string;
  body: string;
};

export type ProjectContent = {
  heading: string;
  body: string;
  pillars: string[];
};

export type ContentSectionData = {
  heading: string;
  body: string;
  tags: string[];
};

export type GalleryContent = {
  heading: string;
  body: string;
  /** Legendas dos espaços reservados — nunca uma foto real inventada. */
  placeholders: string[];
};

export type VideosContent = {
  heading: string;
  body: string;
  /** Legendas dos espaços reservados — nunca um vídeo real inventado. */
  placeholders: string[];
};

export type StrategyContent = {
  heading: string;
  body: string;
  steps: { title: string; description: string }[];
};

/** Mapa type → shape do `content` — usado só a nível de tipo, pra `PresentationSection` inferir o `content` certo. */
export type PresentationContentByType = {
  hero: HeroContent;
  about: AboutContent;
  project: ProjectContent;
  content: ContentSectionData;
  gallery: GalleryContent;
  videos: VideosContent;
  strategy: StrategyContent;
};

/**
 * Uma seção da apresentação. `title` é o rótulo curto exibido (o antigo "eyebrow") — sempre
 * presente, independente do tipo. `enabled` permite desligar uma seção sem removê-la da lista
 * (útil pra reservar espaço antes do conteúdo existir de verdade).
 */
export type PresentationSection = {
  [K in PresentationSectionType]: {
    id: string;
    type: K;
    title: string;
    enabled: boolean;
    content: PresentationContentByType[K];
  };
}[PresentationSectionType];

export type PresentationContent = {
  slug: string;
  brandName: string;
  accentColor: string;
  metaTitle: string;
  metaDescription: string;
  sections: PresentationSection[];
};
