/**
 * Tipos da Proposta de Continuidade da Pascoal Bombas — sistema próprio e isolado, sem nenhuma
 * relação de código com `lib/clients/proposal-types.ts` (usado pela proposta da Elenita). Existe
 * outro agente trabalhando simultaneamente em outras partes do projeto; para não correr nenhum
 * risco de conflito, este arquivo é uma cópia conceitual independente, com sua própria evolução.
 *
 * Reformulação de copy/design (pedido explícito): os 3 perfis (Pascoal Bombas Zona Sul, Pascoal
 * Bombas Zona Norte, Julia Brigidio) agora são nomeados desde a primeira seção depois do Hero,
 * em vez de ficarem implícitos. Rota, preços e formato de 2 etapas continuam intocados.
 */

export type Profile = { name: string; tag: string; strategy: string };

export type PositioningCard = { title: string; description: string };

export type ScopeItem = { title: string; description: string };

/** Um grupo de entregas por dono — substitui a lista solta de 6 itens sem dono claro. */
export type ScopeGroup = { label: string; tag: string; items: ScopeItem[] };

export type FormatStep = { number: string; title: string; description: string };

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

  /** Seção 1 — "Como projetamos sua operação": título + parágrafo + os 3 perfis nomeados + animação. */
  operationSystem: {
    badge: string;
    heading: string;
    paragraph: string;
    profiles: Profile[];
    diagramCaption: string;
  };

  /** Seção 2 — "Posicionamento": só 2 cards, direto. */
  positioning: {
    heading: string;
    cards: PositioningCard[];
  };

  /** Seção 3 — "O que a proposta contempla": escopo organizado por dono (fundação, lojas, Julia). */
  scope: {
    heading: string;
    groups: ScopeGroup[];
    closing: string;
  };

  /** Seção 4 — "Formato: teste e continuidade": 2 etapas reais no tempo. */
  format: {
    heading: string;
    steps: FormatStep[];
  };

  /** Seção 5 — "Investimento": ancoragem de preço, sem interatividade. */
  investment: {
    heading: string;
    coverageNote: string;
    perfilLabel: string;
    perfilPrice: number;
    referenceLabel: string;
    referencePrice: number;
    finalPrice: number;
    reinforcement: string;
    note: string;
  };

  whatsapp: {
    /** Só dígitos, com DDI — formato exigido pelo link wa.me. */
    phoneDigits: string;
    ceoFirstName: string;
  };

  cta: {
    label: string;
    note: string;
  };
};
