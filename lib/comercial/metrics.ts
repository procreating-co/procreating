import "server-only";
import { createClient } from "@/lib/supabase/server";
import { listPipelineStages, listStrategies } from "@/lib/comercial/queries";
import { computeStrategyFunnel } from "@/lib/comercial/funnel";
import { resolvePeriod, type PeriodRange } from "@/lib/comercial/period";
import { listUsers } from "@/lib/admin/users/queries";
import { formatDateOnly } from "@/lib/date";
import type { Strategy } from "@/lib/supabase/types/database";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

/** Mesmo formato de `DetailEntry` (`lib/dashboard/executive-metrics.ts`) — duplicado aqui de
 *  propósito, mesmo motivo de `FinancialDetailEntry` (`lib/financeiro/types.ts`): `lib/comercial`
 *  não deveria depender de `lib/dashboard`. */
export type ComercialDetailEntry = { label: string; value?: string; meta?: string };

export type ComercialMetrics = {
  openLeads: number;
  /** Rótulo dinâmico agora — era sempre "este mês"; segue "novos"/"fechados" do período pedido. */
  newLeadsInPeriod: number;
  inNegotiation: number;
  closedInPeriod: number;
  pipelineValue: number;
  conversionRate: number | null;
  period: PeriodRange;
  /** Lista real por trás de cada bloco da Visão Geral — mesmo padrão de clique-pra-detalhe do
   *  Dashboard/Financeiro, extensão direta do mesmo pedido pra deixar as 3 telas consistentes.
   *  `pipelineValue` reaproveita `openLeadsEntries` (mesmo conjunto de leads, só o total exibido
   *  no bloco muda — soma de valor em vez de contagem). `conversionBreakdown` não é uma lista de
   *  linhas, é a conta em si (numerador/denominador), já que "conversão" não tem uma entidade
   *  própria por trás — mesmo espírito do detalhe de "Lucro Líquido" na Home. */
  openLeadsEntries: ComercialDetailEntry[];
  newLeadsEntries: ComercialDetailEntry[];
  inNegotiationEntries: ComercialDetailEntry[];
  closedInPeriodEntries: ComercialDetailEntry[];
  conversionBreakdown: ComercialDetailEntry[];
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

  const [{ data: openLeads }, { data: newLeads }, { data: closedInPeriodEvents }, { count: leadsInPeriodCount }, { count: wonInPeriodCount }, { data: clients }] =
    await Promise.all([
      supabase.from("leads").select("*").is("client_id", null),
      supabase.from("leads").select("*").gte("created_at", period.fromISO).lt("created_at", period.toISO),
      // Não mais `head: true` — precisa das linhas de verdade agora pro detalhe clicável do bloco
      // "Fechados (período)", não só a contagem.
      supabase.from("events").select("entity_id, created_at").eq("type", "client_created").gte("created_at", period.fromISO).lt("created_at", period.toISO),
      supabase.from("leads").select("*", { count: "exact", head: true }).gte("created_at", period.fromISO).lt("created_at", period.toISO),
      supabase.from("leads").select("*", { count: "exact", head: true }).not("client_id", "is", null).gte("created_at", period.fromISO).lt("created_at", period.toISO),
      supabase.from("clients").select("id, name"),
    ]);

  const open = openLeads ?? [];
  const pipelineValue = open.reduce((sum, lead) => sum + Number(lead.potential_value ?? 0), 0);
  const inNegotiationLeads = open.filter((lead) => negotiationStageIds.includes(lead.stage_id));
  const inNegotiation = inNegotiationLeads.length;

  const stageById = new Map(stages.map((stage) => [stage.id, stage]));
  const clientNameById = new Map((clients ?? []).map((client) => [client.id, client.name]));
  const leadEntry = (lead: (typeof open)[number]): ComercialDetailEntry => ({
    label: lead.company_name,
    value: lead.potential_value != null ? currency.format(Number(lead.potential_value)) : undefined,
    meta: stageById.get(lead.stage_id)?.label,
  });
  const openLeadsEntries = open.map(leadEntry);
  const newLeadsEntries = (newLeads ?? []).map((lead) => ({ ...leadEntry(lead), meta: `Criado ${formatDateOnly(lead.created_at.slice(0, 10))}` }));
  const inNegotiationEntries = inNegotiationLeads.map(leadEntry);
  const closedInPeriodEntries: ComercialDetailEntry[] = (closedInPeriodEvents ?? []).map((event) => ({
    label: (event.entity_id && clientNameById.get(event.entity_id)) || "Cliente removido",
    meta: `Fechado ${formatDateOnly(event.created_at.slice(0, 10))}`,
  }));
  const conversionBreakdown: ComercialDetailEntry[] = [
    { label: "Leads criados no período", value: String(leadsInPeriodCount ?? 0) },
    { label: "Fechados (desses mesmos leads)", value: String(wonInPeriodCount ?? 0) },
  ];

  return {
    openLeads: open.length,
    newLeadsInPeriod: newLeads?.length ?? 0,
    inNegotiation,
    closedInPeriod: closedInPeriodEvents?.length ?? 0,
    pipelineValue,
    conversionRate: leadsInPeriodCount && leadsInPeriodCount > 0 ? (wonInPeriodCount ?? 0) / leadsInPeriodCount : null,
    openLeadsEntries,
    newLeadsEntries,
    inNegotiationEntries,
    closedInPeriodEntries,
    conversionBreakdown,
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

export type OwnerRevenueRow = { ownerId: string | null; ownerName: string; totalRevenue: number; wonLeads: number };
export type SourceRevenueRow = { source: string; totalRevenue: number; wonLeads: number };
export type RevenueBySource = { rows: SourceRevenueRow[]; fromRealData: boolean };

/** Amostra mínima antes de considerar "by Source" confiável — mesmo raciocínio de
 *  `MIN_SAMPLE_SIZE` em `lib/simulation/defaults.ts` (1 de 1 preenchido = "100%" distorceria). */
const MIN_SOURCE_SAMPLE = 3;

/**
 * "Revenue by Owner"/"Revenue by Source" (§65) — uma passada só (não N queries por owner/source,
 * §69 Performance), a partir de leads FECHADOS (`client_id` não nulo) + `revenue` do cliente que
 * cada um virou (mesma definição de receita de `computeStrategyFunnel`/`compareStrategies` acima
 * — soma de `revenue`, contratada, não só paga).
 *
 * `source` é preenchimento livre no cadastro do lead (nunca obrigatório) — construir um breakdown
 * sobre um campo majoritariamente vazio mostraria uma fatia gigante de "sem origem" que não ajuda
 * ninguém a decidir nada. `fromRealData` fica falso (e `rows` vem vazio) quando menos da metade
 * dos negócios fechados tem a origem preenchida — o caller decide como comunicar isso, nunca
 * escondido silenciosamente.
 */
export async function computeRevenueByOwnerAndSource(): Promise<{ byOwner: OwnerRevenueRow[]; bySource: RevenueBySource }> {
  const supabase = await createClient();
  const [{ data: wonLeadsRaw }, { data: revenueRows }, users] = await Promise.all([
    supabase.from("leads").select("client_id, owner_id, source").not("client_id", "is", null),
    supabase.from("revenue").select("client_id, amount"),
    listUsers(),
  ]);

  const userNameById = new Map(users.map((user) => [user.id, user.name]));
  const revenueByClient = new Map<string, number>();
  for (const row of revenueRows ?? []) {
    if (!row.client_id) continue;
    revenueByClient.set(row.client_id, (revenueByClient.get(row.client_id) ?? 0) + Number(row.amount));
  }

  const wonLeads = wonLeadsRaw ?? [];
  const ownerTotals = new Map<string, OwnerRevenueRow>();
  const sourceTotals = new Map<string, SourceRevenueRow>();
  let leadsWithSource = 0;

  for (const lead of wonLeads) {
    const revenue = lead.client_id ? (revenueByClient.get(lead.client_id) ?? 0) : 0;

    const ownerKey = lead.owner_id ?? "__sem_responsavel__";
    const ownerRow = ownerTotals.get(ownerKey) ?? {
      ownerId: lead.owner_id,
      ownerName: lead.owner_id ? (userNameById.get(lead.owner_id) ?? "Removido") : "Sem responsável",
      totalRevenue: 0,
      wonLeads: 0,
    };
    ownerRow.totalRevenue += revenue;
    ownerRow.wonLeads += 1;
    ownerTotals.set(ownerKey, ownerRow);

    const source = lead.source?.trim();
    if (source) {
      leadsWithSource += 1;
      const sourceRow = sourceTotals.get(source) ?? { source, totalRevenue: 0, wonLeads: 0 };
      sourceRow.totalRevenue += revenue;
      sourceRow.wonLeads += 1;
      sourceTotals.set(source, sourceRow);
    }
  }

  const byOwner = Array.from(ownerTotals.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
  const fromRealData = wonLeads.length >= MIN_SOURCE_SAMPLE && leadsWithSource / wonLeads.length > 0.5;
  const bySource: RevenueBySource = {
    rows: fromRealData ? Array.from(sourceTotals.values()).sort((a, b) => b.totalRevenue - a.totalRevenue) : [],
    fromRealData,
  };

  return { byOwner, bySource };
}
