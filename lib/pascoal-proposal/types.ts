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

export type AcquisitionCard = {
  number: string;
  title: string;
  description: string;
  items: string[];
};

/** Item fixo do orçamento — sempre incluso, indicador discreto, nunca clicável, nunca pesa no preço. */
export type FixedBudgetItem = { id: string; label: string };

/**
 * Item variável do orçamento — 2 formas:
 *  - "toggle": liga/desliga, soma `price` ao total quando ligado.
 *  - "video-tier": grupo de opções mutuamente exclusivas (rádio) — só uma fica acesa por vez,
 *    cada uma com seu próprio `price` (o preço da opção SUBSTITUI, não soma). `unlockedBy`
 *    opcional — se presente, o item só aparece (e só conta no total) quando o toggle com esse
 *    `id` estiver ativo; ausente = sempre visível.
 * Preço nunca aparece na interface — só o total geral muda.
 */
export type VariableBudgetItem =
  | { kind: "toggle"; id: string; label: string; price: number; defaultOn: boolean }
  | { kind: "video-tier"; id: string; label: string; options: { id: string; count: number; label: string; price: number }[]; defaultOptionId: string; unlockedBy?: string };

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

  pillarsIntro: { eyebrow: string; heading: string; subtitle: string };
  pillars: ProposalPillar[];

  operacao: {
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

  configurator: {
    heading: string;
    fixedLabel: string;
    /** Preço-base da estrutura fixa — sempre presente no total, independente de qualquer toggle. */
    fixedPrice: number;
    fixedItems: FixedBudgetItem[];
    variableLabel: string;
    variableItems: VariableBudgetItem[];
  };

  closing: {
    heading: string;
    paragraph: string;
  };
};
