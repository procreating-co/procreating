/**
 * Tipos da Proposta de Continuidade da Pascoal Bombas — sistema próprio e isolado, sem nenhuma
 * relação de código com `lib/clients/proposal-types.ts` (usado pela proposta da Elenita). Existe
 * outro agente trabalhando simultaneamente em outras partes do projeto; para não correr nenhum
 * risco de conflito, este arquivo é uma cópia conceitual independente, com sua própria evolução.
 *
 * Versão final da proposta (pedido explícito de "execução única") — substitui inteiramente o
 * criador conversacional e a matriz de preços por combinação: agora é uma proposta estática,
 * já alinhada com a Júlia numa reunião anterior, com um preço final único (R$7.500/mês).
 */

export type PositioningCard = { title: string; description: string };

export type ScopeItem = { title: string; description: string };

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

  /** Seção 1 — "Como projetamos sua operação": título + parágrafo + animação de assinatura (3 perfis conectados). */
  operationSystem: {
    badge: string;
    heading: string;
    paragraph: string;
  };

  /** Seção 2 — "Posicionamento": só 2 cards, direto. */
  positioning: {
    heading: string;
    cards: PositioningCard[];
  };

  /** Seção 3 — "O que a proposta contempla": escopo completo em 6 itens escaneáveis. */
  scope: {
    heading: string;
    items: ScopeItem[];
    closing: string;
  };

  /** Seção 4 — "Formato: teste e continuidade": 2 etapas no tempo. */
  format: {
    heading: string;
    steps: FormatStep[];
  };

  /** Seção 5 — "Investimento": ancoragem de preço, sem interatividade. */
  investment: {
    heading: string;
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
