import "server-only";
import { createClient } from "@/lib/supabase/server";
import { listPipelineStages, listStrategies } from "@/lib/comercial/queries";
import { computeStrategyFunnel } from "@/lib/comercial/funnel";
import { resolvePeriod, type PeriodRange } from "@/lib/comercial/period";
import type { Strategy } from "@/lib/supabase/types/database";

export type ComercialMetrics = {
  openLeads: number;
  /** Rótulo dinâmico agora — era sempre "este mês"; segue "novos"/"fechados" do período pedido. */
  newLeadsInPeriod: number;
  inNegotiation: number;
  closedInPeriod: number;
  pipelineValue: number;
  conversionRate: number | null;
  period: PeriodRange;
};

/**
 * `period` opcional — default "este mês" (`resolvePeriod("month")`), preserva o comportamento
 * de sempre pra quem chama sem escolher período (Home dashboard, `lib/dashboard/executive-
 * metrics.ts`). A página de Comercial passa o preset escolhido no filtro (`?period=`, master
 * prompt §65-66).
 *
 * Bug real corrigido aqui: a versão anterior calculava "início do mês" com `new Date()` cru +
 * `getFullYear()`/`getMonth()` locais — o mesmo viés de fuso que `lib/date.ts` inteiro existe
 * pra evitar (perto da virada do mês, o servidor em UTC já podia estar no mês seguinte enquanto
 * ainda era o mês corrente em Brasília). `resolvePeriod()` já é timezone-safe.
 */
export async function computeComercialMetrics(period: PeriodRange = resolvePeriod("month")): Promise<ComercialMetrics> {
  const supabase = await createClient();
  const stages = await listPipelineStages();
  const negotiationStageIds = stages.filter((stage) => stage.key === "negociacao" || stage.key === "proposta_enviada").map((stage) => stage.id);

  const [{ data: openLeads }, { data: newLeads }, { count: closedInPeriodCount }, { count: leadsInPeriodCount }, { count: wonInPeriodCount }] =
    await Promise.all([
      supabase.from("leads").select("*").is("client_id", null),
      supabase.from("leads").select("*").gte("created_at", period.fromISO).lt("created_at", period.toISO),
      supabase.from("events").select("*", { count: "exact", head: true }).eq("type", "client_created").gte("created_at", period.fromISO).lt("created_at", period.toISO),
      supabase.from("leads").select("*", { count: "exact", head: true }).gte("created_at", period.fromISO).lt("created_at", period.toISO),
      supabase.from("leads").select("*", { count: "exact", head: true }).not("client_id", "is", null).gte("created_at", period.fromISO).lt("created_at", period.toISO),
    ]);

  const open = openLeads ?? [];
  const pipelineValue = open.reduce((sum, lead) => sum + Number(lead.potential_value ?? 0), 0);
  const inNegotiation = open.filter((lead) => negotiationStageIds.includes(lead.stage_id)).length;

  return {
    openLeads: open.length,
    newLeadsInPeriod: newLeads?.length ?? 0,
    inNegotiation,
    closedInPeriod: closedInPeriodCount ?? 0,
    pipelineValue,
    conversionRate: leadsInPeriodCount && leadsInPeriodCount > 0 ? (wonInPeriodCount ?? 0) / leadsInPeriodCount : null,
    period,
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
