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

/** Orientação detectada no upload (`video.videoWidth` × `video.videoHeight`, ver
 *  `video-upload-field.tsx`) — decide o enquadramento no layout público (full-bleed horizontal
 *  vs. coluna estreita vertical, `proposal-portfolio.tsx`), nunca recalculada no render. */
export type VideoOrientation = "horizontal" | "vertical";
export type ProposalVideo = { url: string; orientation: VideoOrientation };

export type HeroContent = {
  eyebrow: string;
  title: string;
  subtitle: string;
  /** Vídeo de fundo do Hero (opcional) — quando ausente, `ProposalHero` renderiza exatamente
   *  como antes (`ProposalHeroAtmosphere`); a proposta da Elenita não tem esses campos
   *  preenchidos, então sua página não muda em nada. */
  backgroundVideoUrl: string | null;
  backgroundVideoOrientation: VideoOrientation | null;
};
/** Item de pilar "trancado" — usado quando um serviço ainda não está disponível pro cliente
 *  contratar agora (ex.: Prospecção Ativa, Aquisição de Leads — pedido explícito: "colocar um
 *  cadeado"). String plana continua funcionando (compatível com `ProposalPillar` original, usado
 *  pela Elenita) — só quando o item é um objeto com `locked: true` que o cadeado aparece. */
export type PillarItem = string | { label: string; locked: true };
export type ProposalPillarWithLocks = Omit<ProposalPillar, "items"> & { items: PillarItem[] };

export type PillarsContent = { intro: { eyebrow: string; heading: string; subtitle: string }; pillars: ProposalPillarWithLocks[] };

/** Bloco "captação" do Roadmap (opcional) — dias de captação + composição de equipe + entregável.
 *  Ausente = `ProposalRoadmap` não renderiza esse bloco (Elenita não tem). */
export type RoadmapProductionBlock = { heading: string; items: string[]; deliverable: string };

/** Uma etapa de funil (Topo/Meio/Fundo) dentro do bloco "estratégia por trás" do Roadmap —
 *  objetivo em texto + até 2 vídeos explicativos (mesmo `ProposalVideo` do Portfólio, reaproveitado
 *  — nunca um tipo de vídeo próprio). Vídeos ficam vazios até o upload real acontecer no editor;
 *  a seção já existe/renderiza com o "espaço" mesmo sem vídeo nenhum ainda. */
export type RoadmapFunnelStage = { heading: string; objective: string; videos: ProposalVideo[] };

/** Bloco "estratégia por trás" (opcional) — matriz perfis × etapas de funil + o detalhe de cada
 *  etapa. Ausente = `ProposalRoadmap` não renderiza esse bloco. */
export type RoadmapFunnel = { heading: string; profiles: string[]; stages: RoadmapFunnelStage[] };

export type RoadmapContent = {
  heading: string;
  subtitle: string;
  stages: RoadmapStage[];
  production: RoadmapProductionBlock | null;
  funnel: RoadmapFunnel | null;
};
export type TvProgramContent = { eyebrow: string; heading: string; subtitle: string; steps: string[] };
export type AcquisitionContent = { eyebrow: string; heading: string; cards: AcquisitionCard[] };
/** Upsell interativo simples (opcional, versão 1) — contador +/- que soma ao total sem nunca
 *  mostrar o preço unitário. Superado por `BudgetConfigurator` (abaixo) pra propostas que
 *  precisam de um configurador completo — mantido pra compatibilidade/casos simples. */
export type BudgetUpsell = { label: string; unitPrice: number; max: number };

/** Item que SOMA ao total (grupo "Adicionar") — pedido explícito, mockup completo de
 *  configurador. `kind` marca os dois addons especiais que também mudam a "linha de escopo"
 *  dinâmica (nº de locações/vídeos entregues, ex.: "03 captações em 03 locações · 09 vídeos");
 *  `"other"` só soma ao total, sem afetar essas contagens. */
export type BudgetConfiguratorAddon = { id: string; label: string; sublabel: string; unitPrice: number; unitLabel: string; max: number; kind: "location" | "video" | "other" };

/** Item que SUBTRAI do total via toggle (grupo "Reduzir") — ex.: remover um membro de equipe. */
export type BudgetConfiguratorRemovable = { id: string; label: string; sublabel: string; savings: number; defaultOn: boolean };

/** Contador de vídeos entregues no pacote base (reduz o total conforme diminui) — item especial
 *  do grupo "Reduzir", separado de `removables` (é um range, não um toggle binário). */
export type BudgetConfiguratorVideoRange = { label: string; sublabel: string; unitPrice: number; min: number; max: number; initial: number };

/**
 * Configurador de investimento completo (opcional) — pedido explícito, baseado num mockup:
 * preço-âncora riscado (opcional), pill de condição de pagamento, linha de escopo dinâmica,
 * 2 cards (Captação/Entrega), grupos "Adicionar"/"Reduzir" com steppers/toggles, recibo ao vivo
 * somando cada ajuste, rodapé "Incluso"/"Adicionais avulsos" com preço unitário visível (design
 * transparente — diferente do `BudgetUpsell` v1, que escondia o preço unitário de propósito;
 * este mockup mostra tudo, é a direção nova). Ausente = `ProposalBudget` renderiza a versão
 * clássica (4 pilares + incluso/adicionais estáticos + cascata) — a Elenita não preenche isso,
 * continua exatamente como sempre.
 */
export type BudgetConfigurator = {
  anchorPrice: number | null;
  anchorLabel: string;
  paymentTerms: string;
  baseLocations: number;
  baseVideos: number;
  captureLabel: string;
  teamSummary: string;
  deliveryLabel: string;
  deliveryNote: string;
  addons: BudgetConfiguratorAddon[];
  removables: BudgetConfiguratorRemovable[];
  videoRange: BudgetConfiguratorVideoRange | null;
};

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
  upsell: BudgetUpsell | null;
  configurator: BudgetConfigurator | null;
};
export type ClosingContent = { heading: string; paragraph: string };

/** Até 5 vídeos (limite aplicado no editor — `section-editor-card.tsx` —, não em RLS/DB), mistura
 *  livre de horizontal/vertical — cada um leva seu próprio enquadramento no grid público. */
export type PortfolioContent = { eyebrow: string; heading: string; subtitle: string; videos: ProposalVideo[] };

export const EMPTY_CONTENT_BY_TYPE = {
  hero: { eyebrow: "", title: "", subtitle: "", backgroundVideoUrl: null, backgroundVideoOrientation: null } as HeroContent,
  pillars: { intro: { eyebrow: "", heading: "", subtitle: "" }, pillars: [] } as PillarsContent,
  roadmap: { heading: "", subtitle: "", stages: [], production: null, funnel: null } as RoadmapContent,
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
    upsell: null,
    configurator: null,
  } as BudgetContent,
  closing: { heading: "", paragraph: "" } as ClosingContent,
  portfolio: { eyebrow: "", heading: "", subtitle: "", videos: [] } as PortfolioContent,
} as const;

export const SECTION_TYPE_LABEL: Record<keyof typeof EMPTY_CONTENT_BY_TYPE, string> = {
  hero: "Hero",
  pillars: "Pilares",
  roadmap: "Roadmap",
  tv_program: "Programa de TV",
  acquisition: "Aquisição",
  budget: "Investimento",
  closing: "Fechamento",
  portfolio: "Portfólio",
};

export const MAX_PORTFOLIO_VIDEOS = 5;
