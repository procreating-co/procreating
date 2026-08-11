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
 * Preço da matriz normal — chave é `${perfilCount}x${videos}`. A matriz normal vai até 2 perfis
 * (Pascoal Zona Sul + Pascoal Zona Norte); 2 perfis × 8 vídeos/perfil não é oferecido (estouraria
 * o teto de R$ 7.000–8.000 no topo da matriz normal — ver comentário em
 * content/clients/pascoal/proposal.ts). Com 2 perfis, a cadência de vídeo fica fixa em 4/perfil.
 */
export type NormalMatrixPrice = { perfilCount: 1 | 2; videos: VideoCadence; price: number };

export type PlanoCompleto = {
  sectionTitle: string;
  headline: string;
  description: string;
  conditionNote: string;
  price: number;
  perfis: Perfil[];
  videosTotal: number;
  videosNote: string;
  trafficFollowersNote: string;
  trafficLeadsNote: string;
  mediaInvestment: number;
  mediaNote: string;
  acquisitionNote: string;
  rateioNote: string;
};

export type GrowthFront = { id: string; label: string; benefit: string; price: number };

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
    eyebrow: string;
    heading: string;
    subheading: string;
    /** Assessoria de Marketing — sempre incluída, ponto de partida do total. Não é card selecionável. */
    baseLabel: string;
    basePrice: number;
    content: {
      stepLabel: string;
      moduleLabel: string;
      moduleBenefit: string;
      perfis: Perfil[];
      videoOptions: { value: VideoCadence; label: string }[];
      matrixPrices: NormalMatrixPrice[];
      planoCompleto: PlanoCompleto;
    };
    growth: {
      stepLabel: string;
      moduleLabel: string;
      lockedNote: string;
      fronts: GrowthFront[];
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
    confirmationHeading: string;
    confirmationSubheading: string;
  };
};
