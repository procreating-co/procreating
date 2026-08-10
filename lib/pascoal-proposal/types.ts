/**
 * Tipos da Proposta de Continuidade da Pascoal Bombas — sistema próprio e isolado, sem nenhuma
 * relação de código com `lib/clients/proposal-types.ts` (usado pela proposta da Elenita). Existe
 * outro agente trabalhando simultaneamente naquele arquivo; para não correr nenhum risco de
 * conflito ou de a Pascoal quebrar por causa de uma mudança lá, este arquivo é uma cópia
 * conceitual independente, com sua própria evolução.
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

/** Um dos toggles do configurador — soma `priceDelta` ao total quando ligado. */
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

export type PascoalProposalContent = {
  slug: "pascoal";
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
