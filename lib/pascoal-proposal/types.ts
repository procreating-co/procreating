/**
 * Tipos da Proposta de Continuidade da Pascoal Bombas — sistema próprio e isolado, sem nenhuma
 * relação de código com `lib/clients/proposal-types.ts` (usado pela proposta da Elenita). Existe
 * outro agente trabalhando simultaneamente em outras partes do projeto; para não correr nenhum
 * risco de conflito, este arquivo é uma cópia conceitual independente, com sua própria evolução.
 */

/** Um dos 3 pilares de serviço (Assessoria / Plano de Posicionamento / Crescimento e Aquisição). */
export type ServicePillar = {
  title: string;
  copy: string;
  bullets: string[];
  closing: string;
  /** Só a Assessoria tem isso — área discreta deixando claro o que NÃO está incluso na camada estratégica. */
  exclusions?: { label: string; items: string[] };
};

export type OficinaCount = 1 | 2 | 3;
export type VideoCount = 4 | 8;

/**
 * Preço de uma combinação oficinas×vídeos — `price: null` significa "ainda não definido pela
 * Pascoal". Renomeado de "perfis" pra "oficinas" (linguagem da própria Pascoal Bombas), mesma
 * lógica e mesmos valores já validados de antes.
 */
export type ContentPlanPrice = { oficinas: OficinaCount; videos: VideoCount; price: number | null };

export type GrowthToggle = { id: string; label: string; benefit: string; price: number };

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

  /** `badge` usa o mesmo componente visual do eyebrow da hero. */
  pillarsIntro: { badge: string; heading: string };
  servicePillars: ServicePillar[];

  configurator: {
    /** "Assessoria de Marketing" — sempre incluída, é a fundação de todo o resto. */
    base: { label: string; stepLabel: string; includedItem: string; price: number };
    steps: {
      content: {
        stepLabel: string;
        moduleLabel: string;
        moduleBenefit: string;
        triggerLabel: string;
        highlightTag?: string;
        oficinaOptions: { value: OficinaCount; label: string }[];
        videoOptions: { value: VideoCount; label: string }[];
        prices: ContentPlanPrice[];
      };
      growth: {
        stepLabel: string;
        toggles: GrowthToggle[];
      };
    };
  };

  whatsapp: {
    /** Só dígitos, com DDI — ex.: "5551982020591". Formato exigido pelo link wa.me. */
    phoneDigits: string;
    ceoFirstName: string;
  };

  cta: {
    label: string;
    note: string;
    confirmationHeading: string;
    confirmationSubheading: string;
    confirmedLabel: string;
  };
};
