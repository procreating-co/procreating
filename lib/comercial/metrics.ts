import "server-only";
import { createClient } from "@/lib/supabase/server";
import { listPipelineStages, listStrategies } from "@/lib/comercial/queries";
import { computeStrategyFunnel } from "@/lib/comercial/funnel";
import type { Strategy } from "@/lib/supabase/types/database";

export type ComercialMetrics = {
  openLeads: number;
  newLeadsThisMonth: number;
  inNegotiation: number;
  closedThisMonth: number;
  pipelineValue: number;
  conversionRate: number | null;
};

function startOfMonthISO(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

export async function computeComercialMetrics(): Promise<ComercialMetrics> {
  const supabase = await createClient();
  const stages = await listPipelineStages();
  const negotiationStageIds = stages.filter((stage) => stage.key === "negociacao" || stage.key === "proposta_enviada").map((stage) => stage.id);

  const [{ data: openLeads }, { data: newLeads }, { count: closedThisMonthCount }, { count: totalLeadsEverCount }, { count: wonLeadsCount }] =
    await Promise.all([
      supabase.from("leads").select("*").is("client_id", null),
      supabase.from("leads").select("*").gte("created_at", startOfMonthISO()),
      supabase.from("events").select("*", { count: "exact", head: true }).eq("type", "client_created").gte("created_at", startOfMonthISO()),
      supabase.from("leads").select("*", { count: "exact", head: true }),
      supabase.from("leads").select("*", { count: "exact", head: true }).not("client_id", "is", null),
    ]);

  const open = openLeads ?? [];
  const pipelineValue = open.reduce((sum, lead) => sum + Number(lead.potential_value ?? 0), 0);
  const inNegotiation = open.filter((lead) => negotiationStageIds.includes(lead.stage_id)).length;

  return {
    openLeads: open.length,
    newLeadsThisMonth: newLeads?.length ?? 0,
    inNegotiation,
    closedThisMonth: closedThisMonthCount ?? 0,
    pipelineValue,
    conversionRate: totalLeadsEverCount && totalLeadsEverCount > 0 ? (wonLeadsCount ?? 0) / totalLeadsEverCount : null,
  };
}

export type StrategyComparisonRow = {
  strategy: Strategy;
  totalLeads: number;
  wonLeads: number;
  totalRevenue: number;
  averageTicket: number | null;
};

/** Comparação simples entre estratégias — roda `computeStrategyFunnel` uma vez por estratégia.
 *  Aceitável pro volume de uma agência pequena (poucas estratégias ativas por vez); se isso
 *  crescer muito, vira candidato a paralelizar ou cachear, não a mudar de forma. */
export async function compareStrategies(): Promise<StrategyComparisonRow[]> {
  const strategies = await listStrategies();
  const rows = await Promise.all(
    strategies.map(async (strategy) => {
      const funnel = await computeStrategyFunnel(strategy.id);
      return { strategy, totalLeads: funnel.totalLeads, wonLeads: funnel.wonLeads, totalRevenue: funnel.totalRevenue, averageTicket: funnel.averageTicket };
    }),
  );
  return rows.sort((a, b) => b.totalRevenue - a.totalRevenue);
}
