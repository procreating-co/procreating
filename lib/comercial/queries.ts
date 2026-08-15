import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Event, Lead, PipelineStage, ProspectingList, Strategy } from "@/lib/supabase/types/database";
import type { LeadWithRelations } from "@/lib/comercial/types";

/**
 * Todas as queries daqui usam `.select("*")` + junção manual em TypeScript, nunca uma lista
 * explícita de colunas nem embed aninhado do PostgREST (`select("*, stage:pipeline_stages(*)")`)
 * — o `Database` deste projeto é uma aproximação manual (não gerada por `supabase gen types`),
 * que já provou inferir `never` em seleção parcial de coluna (ver nota em
 * `lib/admin/auth/supabase-provider.ts`); embed aninhado tem o mesmo risco e não vale o ganho de
 * uma query a menos numa ferramenta interna de baixo volume.
 */

export async function listPipelineStages(): Promise<PipelineStage[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("pipeline_stages").select("*").order("sort_order");
  return data ?? [];
}

export async function getInitialStage(stages?: PipelineStage[]): Promise<PipelineStage | null> {
  const list = stages ?? (await listPipelineStages());
  const open = list.filter((stage) => !stage.is_won && !stage.is_lost);
  return open[0] ?? null;
}

export async function getWonStage(stages?: PipelineStage[]): Promise<PipelineStage | null> {
  const list = stages ?? (await listPipelineStages());
  return list.find((stage) => stage.is_won) ?? null;
}

export async function listStrategies(): Promise<Strategy[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("strategies").select("*").order("name");
  return data ?? [];
}

export async function getStrategy(id: string): Promise<Strategy | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("strategies").select("*").eq("id", id).maybeSingle();
  return data ?? null;
}

export async function listProspectingLists(): Promise<ProspectingList[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("prospecting_lists").select("*").order("created_at", { ascending: false });
  return data ?? [];
}

export async function getProspectingList(id: string): Promise<ProspectingList | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("prospecting_lists").select("*").eq("id", id).maybeSingle();
  return data ?? null;
}

function joinLeads(leads: Lead[], stages: PipelineStage[], strategies: Strategy[], lists: ProspectingList[]): LeadWithRelations[] {
  const stageById = new Map(stages.map((stage) => [stage.id, stage]));
  const strategyById = new Map(strategies.map((strategy) => [strategy.id, strategy]));
  const listById = new Map(lists.map((list) => [list.id, list]));

  return leads
    .map((lead) => {
      const stage = stageById.get(lead.stage_id);
      if (!stage) return null; // nunca deveria acontecer (FK not null) — só protege contra corrida entre queries
      const strategy = lead.strategy_id ? strategyById.get(lead.strategy_id) : undefined;
      const list = lead.list_id ? listById.get(lead.list_id) : undefined;
      return {
        ...lead,
        stage,
        strategy: strategy ? { id: strategy.id, name: strategy.name } : null,
        list: list ? { id: list.id, name: list.name } : null,
      };
    })
    .filter((lead): lead is LeadWithRelations => lead !== null);
}

/** Leads ainda abertos (não convertidos) — o que o Kanban/tabela de Leads mostra por padrão. */
export async function listOpenLeads(): Promise<LeadWithRelations[]> {
  const supabase = await createClient();
  const [{ data: leads }, stages, strategies, lists] = await Promise.all([
    supabase.from("leads").select("*").is("client_id", null).order("created_at", { ascending: false }),
    listPipelineStages(),
    listStrategies(),
    listProspectingLists(),
  ]);
  return joinLeads(leads ?? [], stages, strategies, lists);
}

export type LeadFilters = { ownerId?: string; strategyId?: string; listId?: string };

/** Teto de segurança pro Kanban — ele precisa ver leads de TODOS os estágios de uma vez pra
 *  agrupar em colunas (não dá pra paginar uma lista "achatada" e continuar agrupando certo), mas
 *  sem limite nenhum uma base de dezenas de milhares de leads (a meta do motor de listas)
 *  derrubaria a página. Acima disso, é hora de trabalhar pela Lista (paginada de verdade) em vez
 *  do Kanban — `truncated` avisa a UI disso. */
const PIPELINE_LEADS_CAP = 500;

export async function listOpenLeadsForPipeline(filters: LeadFilters): Promise<{ leads: LeadWithRelations[]; truncated: boolean }> {
  const supabase = await createClient();
  // Filtros DIRETO na query (não `.filter()` em memória) — mesmo motivo de `listOpenLeadsPaginated`
  // abaixo: com `.limit()`/`.range()` no banco, filtrar depois de buscar cortaria a página errada.
  let query = supabase.from("leads").select("*", { count: "exact" }).is("client_id", null);
  if (filters.ownerId) query = query.eq("owner_id", filters.ownerId);
  if (filters.strategyId) query = query.eq("strategy_id", filters.strategyId);
  if (filters.listId) query = query.eq("list_id", filters.listId);

  const [{ data: leads, count }, stages, strategies, lists] = await Promise.all([
    query.order("created_at", { ascending: false }).limit(PIPELINE_LEADS_CAP),
    listPipelineStages(),
    listStrategies(),
    listProspectingLists(),
  ]);
  return { leads: joinLeads(leads ?? [], stages, strategies, lists), truncated: (count ?? 0) > PIPELINE_LEADS_CAP };
}

export const LEADS_PAGE_SIZE = 50;

export type LeadsPage = { leads: LeadWithRelations[]; totalCount: number; page: number; pageSize: number };

/** Paginação de verdade (LIMIT/OFFSET no banco, não no array já carregado) — a visão Lista do
 *  CRM é onde o volume do motor de listas efetivamente aparece pro usuário (a auditoria apontou
 *  isto como risco real antes de ter dado em escala: "nenhuma query de listagem tem paginação"). */
export async function listOpenLeadsPaginated(filters: LeadFilters, page = 1): Promise<LeadsPage> {
  const supabase = await createClient();
  let query = supabase.from("leads").select("*", { count: "exact" }).is("client_id", null);
  if (filters.ownerId) query = query.eq("owner_id", filters.ownerId);
  if (filters.strategyId) query = query.eq("strategy_id", filters.strategyId);
  if (filters.listId) query = query.eq("list_id", filters.listId);

  const from = (page - 1) * LEADS_PAGE_SIZE;
  const to = from + LEADS_PAGE_SIZE - 1;
  const [{ data: leads, count }, stages, strategies, lists] = await Promise.all([
    query.order("created_at", { ascending: false }).range(from, to),
    listPipelineStages(),
    listStrategies(),
    listProspectingLists(),
  ]);
  return { leads: joinLeads(leads ?? [], stages, strategies, lists), totalCount: count ?? 0, page, pageSize: LEADS_PAGE_SIZE };
}

export async function listLeadsByStrategy(strategyId: string): Promise<LeadWithRelations[]> {
  const supabase = await createClient();
  const [{ data: leads }, stages, strategies, lists] = await Promise.all([
    supabase.from("leads").select("*").eq("strategy_id", strategyId),
    listPipelineStages(),
    listStrategies(),
    listProspectingLists(),
  ]);
  return joinLeads(leads ?? [], stages, strategies, lists);
}

export async function getLead(id: string): Promise<LeadWithRelations | null> {
  const supabase = await createClient();
  const [{ data: lead }, stages, strategies, lists] = await Promise.all([
    supabase.from("leads").select("*").eq("id", id).maybeSingle(),
    listPipelineStages(),
    listStrategies(),
    listProspectingLists(),
  ]);
  if (!lead) return null;
  return joinLeads([lead], stages, strategies, lists)[0] ?? null;
}

/** Histórico do lead — `public.events` com `entity_type = "lead"` (Fase 1, generalizado; ver
 *  comentário na migration Comercial/Financeiro/Onboarding sobre não existir `lead_activities`). */
export async function getLeadEvents(leadId: string): Promise<Event[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("entity_type", "lead")
    .eq("entity_id", leadId)
    .order("created_at", { ascending: false });
  return data ?? [];
}
