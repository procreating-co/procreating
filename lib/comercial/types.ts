import type { Lead, PipelineStage, ProspectingList, Strategy } from "@/lib/supabase/types/database";

export type { Lead, PipelineStage, Strategy, ProspectingList } from "@/lib/supabase/types/database";

/** Lead com o estágio já resolvido — evita todo consumidor ter que cruzar `stage_id` com a lista
 *  de estágios na mão. `strategy`/`list` são `null` quando o lead não veio de uma estratégia
 *  formal / não foi importado de uma lista (criado manualmente). */
export type LeadWithRelations = Lead & {
  stage: PipelineStage;
  strategy: Pick<Strategy, "id" | "name"> | null;
  list: Pick<ProspectingList, "id" | "name"> | null;
};

/** Payload de criação de lead — o que o formulário/drawer coleta; `stage_id`/`id`/timestamps
 *  ficam por conta do banco/da action (estágio inicial = menor `sort_order`, ver
 *  `lib/comercial/actions.ts`). */
export type LeadInput = {
  companyName: string;
  contactName: string;
  roleTitle: string;
  whatsapp: string;
  email: string;
  source: string;
  strategyId: string | null;
  potentialValue: number | null;
  notes: string;
};

export type LeadPatch = Partial<{
  contactName: string;
  roleTitle: string;
  whatsapp: string;
  email: string;
  potentialValue: number | null;
  ownerId: string | null;
  nextContactAt: string | null;
  notes: string;
}>;

export type StrategyInput = {
  name: string;
  targetAudience: string;
  segment: string;
  location: string;
  icp: string;
  qualificationCriteria: string;
  offer: string;
  salesPitch: string;
  prospectingChannel: string;
  prospectingGoal: number | null;
  meetingsGoal: number | null;
  closingGoal: number | null;
  revenueGoal: number | null;
};

/** Um passo do funil de uma estratégia — ver `lib/comercial/funnel.ts` pra como é calculado. */
export type FunnelStep = {
  stage: PipelineStage;
  /** Quantidade de leads que já passaram por este estágio (atual ou histórico via `events`). */
  count: number;
  /** Conversão em relação ao passo anterior — `null` no primeiro passo. */
  conversionFromPrevious: number | null;
};

export type StrategyFunnel = {
  steps: FunnelStep[];
  totalLeads: number;
  wonLeads: number;
  totalRevenue: number;
  averageTicket: number | null;
};

// ---------------------------------------------------------------------------
// Motor de Listas — ver `lib/comercial/csv.ts` (parser) e `components/comercial/list-import-
// drawer.tsx` (fluxo: importar → mapear → deduplicar → confirmar).
// ---------------------------------------------------------------------------
import type { ParsedLeadRow } from "@/lib/comercial/csv";

/** Resultado da checagem de duplicados — computado no servidor (nunca traz a base inteira de
 *  leads pro navegador, só compara chaves normalizadas). `duplicateOf` aponta o motivo pra UI
 *  poder mostrar "já existe por WhatsApp"/"por e-mail"/etc. */
export type DedupCheckResult = {
  rows: Array<{ row: ParsedLeadRow; status: "novo" | "existente" | "duplicado_na_lista"; duplicateOf?: string }>;
  newCount: number;
  existingCount: number;
  duplicateInListCount: number;
};

export type ImportListInput = {
  listName: string;
  strategyId: string | null;
  rows: ParsedLeadRow[];
};
