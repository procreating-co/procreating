/**
 * Shape de `ProposalSection.content` por `section_type` — não faz parte de `database.ts` (que só
 * conhece `Record<string, unknown>`, ver comentário lá) pra esse arquivo não virar uma union
 * gigante. Cada tipo aqui é o "molde" que tanto o Template (`section_blueprint`) quanto uma
 * Proposal real (`proposal_sections.content`) satisfazem — mesmo shape nos dois, só o conteúdo
 * muda. Ver `docs/proposal-system-architecture.md`, seção 11.3.
 */

export type HeroContent = { eyebrow: string; title: string; subtitle: string };
export type ContextContent = { heading: string; body: string };
export type DiagnosisContent = { heading: string; body: string; points: string[] };
export type StrategyContent = { heading: string; body: string; pillars: { title: string; description: string }[] };
export type ServicesContent = { heading: string; items: { title: string; description: string }[] };
export type DeliverablesContent = { heading: string; items: string[] };
export type InvestmentContent = { heading: string; value: number; recurrence: "mensal" | "unico"; setupFee: number | null; additionalItems: { label: string; value: number }[]; notes: string };
export type ConditionsContent = { heading: string; body: string };
export type TestimonialContent = { quote: string; author: string; role: string };
export type CtaContent = { heading: string; buttonLabel: string; note: string };
export type FooterContent = { text: string };
export type CustomContent = { heading: string; body: string };

export const EMPTY_CONTENT_BY_TYPE = {
  hero: { eyebrow: "", title: "", subtitle: "" } as HeroContent,
  context: { heading: "", body: "" } as ContextContent,
  diagnosis: { heading: "", body: "", points: [] } as DiagnosisContent,
  strategy: { heading: "", body: "", pillars: [] } as StrategyContent,
  services: { heading: "", items: [] } as ServicesContent,
  deliverables: { heading: "", items: [] } as DeliverablesContent,
  investment: { heading: "Investimento", value: 0, recurrence: "mensal", setupFee: null, additionalItems: [], notes: "" } as InvestmentContent,
  conditions: { heading: "", body: "" } as ConditionsContent,
  testimonial: { quote: "", author: "", role: "" } as TestimonialContent,
  cta: { heading: "", buttonLabel: "Aceitar proposta", note: "" } as CtaContent,
  footer: { text: "" } as FooterContent,
  custom: { heading: "", body: "" } as CustomContent,
} as const;

export const SECTION_TYPE_LABEL: Record<keyof typeof EMPTY_CONTENT_BY_TYPE, string> = {
  hero: "Hero",
  context: "Contexto",
  diagnosis: "Diagnóstico",
  strategy: "Estratégia",
  services: "Serviços",
  deliverables: "Entregáveis",
  investment: "Investimento",
  conditions: "Condições",
  testimonial: "Depoimento",
  cta: "CTA",
  footer: "Footer",
  custom: "Seção livre",
};
