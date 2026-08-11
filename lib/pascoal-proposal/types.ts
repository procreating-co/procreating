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
  items: string[];
};

/** Um dos 3 blocos editoriais de metodologia (Assessoria / Posicionamento / Aquisição). */
export type MethodologyBlock = {
  number: string;
  title: string;
  paragraph: string;
  tags: string[];
};

export type ProfileCount = 1 | 2 | 3;
export type VideoCount = 4 | 8;

/**
 * Preço de uma combinação perfis×vídeos — `price: null` significa "ainda não definido pela
 * Pascoal". Só existem 3 valores-base confirmados (1×4, 2×4, 3×4); os 3 restantes (×8) ficam
 * `null` até serem definidos — nunca inventados por uma fórmula. A UI trata `null` mostrando
 * "Valor a definir" em vez de um número, nunca R$ 0.
 */
export type ContentPlanPrice = { profiles: ProfileCount; videos: VideoCount; price: number | null };

export type GrowthToggle = { id: string; label: string; price: number };

export type PascoalProposalContent = {
  slug: "pascoal";
  brandName: string;
  accentColor: string;
  metaTitle: string;
  metaDescription: string;

  hero: {
    eyebrow: string;
    title: string;
  };

  /** `badge` usa o mesmo componente visual do eyebrow da hero — pedido explícito. */
  pillarsIntro: { badge: string; heading: string };
  pillars: ProposalPillar[];

  methodology: MethodologyBlock[];

  configurator: {
    planInitial: {
      label: string;
      includedLabel: string;
      includedItem: string;
      /** Preço-base — sempre presente, exceto quando um plano de conteúdo é selecionado (aí ele SUBSTITUI, não soma). */
      price: number;
    };
    additionsLabel: string;
    additionsSubtitle: string;
    content: {
      moduleLabel: string;
      triggerLabel: string;
      profileOptions: { value: ProfileCount; label: string }[];
      videoOptions: { value: VideoCount; label: string }[];
      prices: ContentPlanPrice[];
    };
    growth: {
      moduleLabel: string;
      toggles: GrowthToggle[];
    };
  };

  closing: {
    heading: string;
    paragraph: string;
  };
};
