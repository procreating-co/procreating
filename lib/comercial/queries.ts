import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Event, Lead, PipelineStage, Strategy } from "@/lib/supabase/types/database";
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

function joinLeads(leads: Lead[], stages: PipelineStage[], strategies: Strategy[]): LeadWithRelations[] {
  const stageById = new Map(stages.map((stage) => [stage.id, stage]));
  const strategyById = new Map(strategies.map((strategy) => [strategy.id, strategy]));

  return leads
    .map((lead) => {
      const stage = stageById.get(lead.stage_id);
      if (!stage) return null; // nunca deveria acontecer (FK not null) — só protege contra corrida entre queries
      const strategy = lead.strategy_id ? strategyById.get(lead.strategy_id) : undefined;
      return { ...lead, stage, strategy: strategy ? { id: strategy.id, name: strategy.name } : null };
    })
    .filter((lead): lead is LeadWithRelations => lead !== null);
}

/** Leads ainda abertos (não convertidos) — o que o Kanban/tabela de Leads mostra por padrão. */
export async function listOpenLeads(): Promise<LeadWithRelations[]> {
  const supabase = await createClient();
  const [{ data: leads }, stages, strategies] = await Promise.all([
    supabase.from("leads").select("*").is("client_id", null).order("created_at", { ascending: false }),
    listPipelineStages(),
    listStrategies(),
  ]);
  return joinLeads(leads ?? [], stages, strategies);
}

export async function listLeadsByStrategy(strategyId: string): Promise<LeadWithRelations[]> {
  const supabase = await createClient();
  const [{ data: leads }, stages, strategies] = await Promise.all([
    supabase.from("leads").select("*").eq("strategy_id", strategyId),
    listPipelineStages(),
    listStrategies(),
  ]);
  return joinLeads(leads ?? [], stages, strategies);
}

export async function getLead(id: string): Promise<LeadWithRelations | null> {
  const supabase = await createClient();
  const [{ data: lead }, stages, strategies] = await Promise.all([
    supabase.from("leads").select("*").eq("id", id).maybeSingle(),
    listPipelineStages(),
    listStrategies(),
  ]);
  if (!lead) return null;
  return joinLeads([lead], stages, strategies)[0] ?? null;
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
