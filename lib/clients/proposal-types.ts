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

/**
 * Item do orçamento — 3 formas:
 *  - "static": sempre incluso, círculo sempre aceso, não clicável (ex.: Estratégia, Posicionamento).
 *  - "toggle": liga/desliga, soma `price` ao total quando ligado.
 *  - "video-tier": grupo de opções mutuamente exclusivas (rádio) — só uma fica acesa por vez,
 *    cada uma com seu próprio `price` (o preço da opção SUBSTITUI, não soma).
 * Preço nunca aparece na interface — só o total geral muda.
 */
export type BudgetItem =
  | { kind: "static"; id: string; label: string }
  | { kind: "toggle"; id: string; label: string; price: number; defaultOn: boolean }
  | { kind: "video-tier"; id: string; options: { id: string; count: number; label: string; price: number }[]; defaultOptionId: string };

export type BudgetGroup = {
  label: string;
  items: BudgetItem[];
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

  tvProgram: {
    eyebrow: string;
    heading: string;
    description: string;
    steps: string[];
  };

  configurator: {
    heading: string;
    groups: BudgetGroup[];
  };

  closing: {
    heading: string;
    paragraph: string;
  };
};
