/**
 * Tipos da Proposta de Continuidade — sistema novo e isolado, irmão de
 * `presentation-types.ts`/`workspace-types.ts` mas sem nenhuma relação de código com eles.
 * Hoje só a Elenita tem uma proposta (`content/clients/elenita/proposal.ts`); um cliente futuro
 * ganharia seu próprio arquivo de conteúdo satisfazendo este mesmo tipo, registrado em
 * `lib/clients/proposal-registry.ts`.
 */

export type ProposalPillar = {
  title: string;
  description: string;
  items: string[];
  /** Nota de rodapé do card, ex.: aviso sobre verba de mídia paga não incluída. */
  note?: string;
};

export type VideoTier = {
  id: string;
  count: number;
  label: string;
  price: number;
  recommended?: boolean;
};

export type ProposalModule = {
  id: string;
  label: string;
  description: string;
  price: number;
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
    dateRange: string;
    ctaLabel: string;
    ctaHref: string;
  };

  positioning: {
    eyebrow: string;
    heading: string;
    paragraphs: string[];
  };

  pillars: ProposalPillar[];

  configurator: {
    eyebrow: string;
    heading: string;
    subtitle: string;
    videoTiersLabel: string;
    videoTiers: VideoTier[];
    modulesLabel: string;
    /** Módulo sempre incluso, sem preço/toggle próprio (ex.: Posicionamento). */
    includedModule: { label: string; description: string };
    /** Módulos opcionais, com preço adicional e toggle. */
    optionalModules: ProposalModule[];
  };

  recommendation: {
    eyebrow: string;
    heading: string;
    contractNote: string;
    ctaLabel: string;
    ctaHref: string;
  };

  investmentNote: {
    heading: string;
    paragraphs: string[];
  };

  whyContinuity: {
    eyebrow: string;
    heading: string;
    points: WhyContinuityPoint[];
  };

  closing: {
    heading: string;
    paragraphs: string[];
    dateRange: string;
    ctaLabel: string;
    ctaHref: string;
  };
};
