/**
 * Tipos da Proposta de Continuidade — sistema novo e isolado, irmão de
 * `presentation-types.ts`/`workspace-types.ts` mas sem nenhuma relação de código com eles.
 * Hoje só a Elenita tem uma proposta (`content/clients/elenita/proposal.ts`); um cliente futuro
 * ganharia seu próprio arquivo de conteúdo satisfazendo este mesmo tipo, registrado em
 * `lib/clients/proposal-registry.ts`.
 */

export type ProposalPillar = {
  number: string;
  title: string;
  description: string;
  items: string[];
};

/** Uma das 2 opções de vídeos/mês — `base` é o preço mensal nessa quantidade, sem nenhum toggle ligado. */
export type VideoOption = {
  id: string;
  count: number;
  label: string;
  base: number;
};

/** Um dos 2 toggles do configurador — soma `priceDelta` ao total quando ligado. */
export type ProposalToggle = {
  id: string;
  label: string;
  priceDelta: number;
  /** Nota pequena junto do toggle, ex.: aviso sobre verba de mídia. */
  note?: string;
};

export type WhyContinuityPoint = {
  number: string;
  title: string;
  description: string;
};

export type ProposalContent = {
  slug: string;
  brandName: string;
  accentColor: string;
  metaTitle: string;
  metaDescription: string;

  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
  };

  growthAnimation: {
    eyebrow: string;
    heading: string;
    steps: string[];
  };

  pillarsIntro: { eyebrow: string; heading: string };
  pillars: ProposalPillar[];

  tvProgram: {
    eyebrow: string;
    heading: string;
    description: string;
    steps: string[];
  };

  configurator: {
    eyebrow: string;
    heading: string;
    subtitle: string;
    contentLabel: string;
    videoOptions: VideoOption[];
    strategyLabel: string;
    strategyIncluded: string;
    growthLabel: string;
    expansionLabel: string;
    toggles: { traffic: ProposalToggle; prospecting: ProposalToggle };
    /** Piso absoluto do valor mensal — nunca deve ser possível ficar abaixo disso. */
    minPrice: number;
    recommendedTag: string;
    customTag: string;
  };

  whyContinuity: {
    eyebrow: string;
    heading: string;
    points: WhyContinuityPoint[];
  };

  closing: {
    heading: string;
    paragraph: string;
  };
};
