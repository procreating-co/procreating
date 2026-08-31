import type { ProposalPillar, RoadmapStage, AcquisitionCard, BudgetPillarCard } from "@/lib/clients/proposal-types";

/**
 * Shape de `ProposalSection.content` por `section_type` — espelha 1:1 as sub-partes de
 * `ProposalContent` (`lib/clients/proposal-types.ts`, sistema da Elenita, intocado), reaproveitando
 * os mesmos tipos (`ProposalPillar`/`RoadmapStage`/`AcquisitionCard`/`BudgetPillarCard`) em vez de
 * duplicá-los — os 7 tipos aqui são exatamente o que os componentes reais de
 * `components/proposal/**` esperam como prop `content`. `recurrence` em `BudgetContent` é a única
 * adição além do shape original: não existia em `ProposalContent["budget"]`, mas
 * `getAcceptedProposalPayloadAction` (`lib/comercial/proposal-actions.ts`) precisa saber se o
 * valor é mensal ou único pra pré-preencher o onboarding na conversão em cliente.
 */

export type HeroContent = { eyebrow: string; title: string; subtitle: string };
export type PillarsContent = { intro: { eyebrow: string; heading: string; subtitle: string }; pillars: ProposalPillar[] };
export type RoadmapContent = { heading: string; subtitle: string; stages: RoadmapStage[] };
export type TvProgramContent = { eyebrow: string; heading: string; subtitle: string; steps: string[] };
export type AcquisitionContent = { eyebrow: string; heading: string; cards: AcquisitionCard[] };
export type BudgetContent = {
  heroNumber: number;
  heroLabel: string;
  heroCaption: string;
  recurrence: "mensal" | "unico";
  pillars: BudgetPillarCard[];
  includedLabel: string;
  includedItems: string[];
  additionalLabel: string;
  additionalItems: string[];
  flowSteps: string[];
};
export type ClosingContent = { heading: string; paragraph: string };

export const EMPTY_CONTENT_BY_TYPE = {
  hero: { eyebrow: "", title: "", subtitle: "" } as HeroContent,
  pillars: { intro: { eyebrow: "", heading: "", subtitle: "" }, pillars: [] } as PillarsContent,
  roadmap: { heading: "", subtitle: "", stages: [] } as RoadmapContent,
  tv_program: { eyebrow: "", heading: "", subtitle: "", steps: [] } as TvProgramContent,
  acquisition: { eyebrow: "", heading: "", cards: [] } as AcquisitionContent,
  budget: {
    heroNumber: 0,
    heroLabel: "",
    heroCaption: "",
    recurrence: "mensal",
    pillars: [],
    includedLabel: "Incluso",
    includedItems: [],
    additionalLabel: "Adicionais",
    additionalItems: [],
    flowSteps: [],
  } as BudgetContent,
  closing: { heading: "", paragraph: "" } as ClosingContent,
} as const;

export const SECTION_TYPE_LABEL: Record<keyof typeof EMPTY_CONTENT_BY_TYPE, string> = {
  hero: "Hero",
  pillars: "Pilares",
  roadmap: "Roadmap",
  tv_program: "Programa de TV",
  acquisition: "Aquisição",
  budget: "Investimento",
  closing: "Fechamento",
};
