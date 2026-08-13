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

export type AcquisitionCard = {
  number: string;
  title: string;
  description: string;
  items: string[];
};

export type RoadmapStage = {
  number: string;
  title: string;
  items: string[];
};

export type BudgetPillarCard = {
  title: string;
  items: string[];
};

export type UpsellItem = {
  id: string;
  label: string;
  description: string;
  price: number;
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

  pillarsIntro: { eyebrow: string; heading: string; subtitle: string };
  pillars: ProposalPillar[];

  roadmap: {
    heading: string;
    subtitle: string;
    stages: RoadmapStage[];
  };

  tvProgram: {
    eyebrow: string;
    heading: string;
    subtitle: string;
    steps: string[];
  };

  acquisition: {
    eyebrow: string;
    heading: string;
    cards: AcquisitionCard[];
  };

  budget: {
    heroNumber: number;
    heroLabel: string;
    heroCaption: string;
    pillars: BudgetPillarCard[];
    includedLabel: string;
    includedItems: string[];
    additionalLabel: string;
    additionalItems: string[];
    flowSteps: string[];
  };

  upsell: {
    heading: string;
    subtitle: string;
    items: UpsellItem[];
  };

  closing: {
    heading: string;
    paragraph: string;
  };
};
