/**
 * Tipos da Proposta de Continuidade da Pascoal Bombas — sistema próprio e isolado, sem nenhuma
 * relação de código com `lib/clients/proposal-types.ts` (usado pela proposta da Elenita). Existe
 * outro agente trabalhando simultaneamente em outras partes do projeto; para não correr nenhum
 * risco de conflito, este arquivo é uma cópia conceitual independente, com sua própria evolução.
 */

/** Uma das 3 etapas da jornada ("Nossos Serviços" virou timeline vertical numerada). */
export type ServiceStep = {
  number: string;
  title: string;
  copy: string;
  includesLabel: string;
  /** Etapas 01/02 usam lista simples. */
  includeItems?: string[];
  /** Só a etapa 03 usa isso — 2 frentes em vez de bullets soltos. */
  includeFronts?: { title: string; description: string }[];
  excludesLabel: string;
  excludeItems: string[];
  closing: string;
};

export type PerfilId = "zona-sul" | "zona-norte" | "julia";

export type Perfil = {
  id: PerfilId;
  name: string;
  description: string;
  /** Só a Julia — não existe fora do Plano Completo. */
  exclusiveToCompleto?: boolean;
};

export type VideoCadence = 4 | 8;

/**
 * Preço da matriz normal — até 2 perfis (Pascoal Zona Sul + Pascoal Zona Norte); 2 perfis × 8
 * vídeos/perfil não é oferecido (estouraria o teto de R$7.000–8.000 no topo da matriz normal —
 * ver memória de cálculo em content/clients/pascoal/proposal.ts). Com 2 perfis, a cadência de
 * vídeo fica fixa em 4/perfil — no fluxo conversacional isso significa que a Pergunta 3
 * (frequência) é pulada quando o cliente escolhe 2 perfis.
 */
export type NormalMatrixPrice = { perfilCount: 1 | 2; videos: VideoCadence; price: number };

export type GrowthFront = { id: string; label: string; price: number };

/** Uma pergunta de múltipla escolha do criador de orçamento conversacional. */
export type ConversationalQuestion<TValue extends string> = {
  question: string;
  options: { label: string; value: TValue }[];
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
  };

  servicesIntro: { badge: string; heading: string };
  serviceSteps: ServiceStep[];

  configurator: {
    /** Ponto de partida do total — só a Assessoria, antes de qualquer resposta com valor. */
    baseLabel: string;
    basePrice: number;
    matrixPrices: NormalMatrixPrice[];
    perfis: Perfil[];
    growthFronts: GrowthFront[];

    questions: {
      scope: ConversationalQuestion<"1" | "2" | "3+">;
      perfil: ConversationalQuestion<PerfilId>;
      cadence: ConversationalQuestion<"1x" | "2x">;
      intent: ConversationalQuestion<"visibilidade" | "vendas" | "ambas" | "nenhum">;
      upsell: ConversationalQuestion<"sim" | "nao">;
    };

    completo: {
      headline: string;
      description: string;
      detailsLine: string;
      price: number;
      mediaInvestment: number;
      mediaNote: string;
      chooseLabel: string;
      backLabel: string;
    };

    summary: {
      heading: string;
      mediaWarning: string;
    };
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
