import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getCurrentMonthGoal } from "@/lib/dashboard/goals";
import { computeComercialMetrics } from "@/lib/comercial/metrics";
import { listPipelineStages } from "@/lib/comercial/queries";
import { computeFinanceiroMetrics } from "@/lib/financeiro/queries";
import { dayOfMonthOf, todayUTCAnchor } from "@/lib/date";
import type { Client, Contract, Lead } from "@/lib/supabase/types/database";

// ---------------------------------------------------------------------------
// Query central do Dashboard executivo — junta o que já existe (lib/comercial, lib/financeiro,
// lib/dashboard/goals) com o que precisou de query nova, sempre marcando explicitamente o que
// não tem dado suficiente (`null`/array vazio) em vez de inventar. Ver decisões documentadas no
// plano aprovado — "Revenue" aqui é REALIZADO (status='pago', paid_at no mês), diferente do
// `revenueThisMonth` de `computeFinanceiroMetrics()` (tudo com due_date no mês, sem filtrar
// status) — os dois convivem, só nomeados sem ambiguidade.
//
// `details` — todo card do Dashboard é clicável e abre um modal com a lista real por trás do
// número (pedido explícito). Cada campo de `details` é a lista que alimenta o modal do card
// correspondente; nunca um resumo recalculado, sempre os mesmos dados-fonte.
// ---------------------------------------------------------------------------

// Toda a aritmética de mês abaixo é sobre um `Date` já ancorado em `todayUTCAnchor()` (hoje em
// Brasília, representado como UTC-midnight) — por isso os getters/construtores são sempre `UTC*`,
// nunca os locais (`getFullYear`/`getMonth`/`getDate`/`new Date(y,m,d)`): misturar os dois é
// exatamente o viés de fuso descrito em `lib/date.ts` — funciona só "por coincidência" quando o
// runtime do servidor está em UTC (caso da Vercel hoje), quebra em qualquer outro fuso.
function daysInMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

function startOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function startOfPreviousMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1));
}

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export type GoalProgress = { amount: number; realized: number; percentage: number; expectedPacePercentage: number };

export type RevenueVsTargetPoint = { day: number; realized: number | null; pace: number };

export type KpiCard = { value: number; sparkline?: number[]; deltaPct?: number | null };

export type DetailEntry = { label: string; value?: string; meta?: string };

export type ExecutiveMetrics = {
  goal: GoalProgress | null;
  kpis: {
    revenue: KpiCard;
    netProfit: KpiCard;
    cashFlow: KpiCard;
    pipeline: { value: number; openCount: number };
    activeClients: { value: number; deltaCount: number | null };
    team: { value: number };
  };
  revenueVsTarget: { points: RevenueVsTargetPoint[]; goalAmount: number | null };
  financialHealth: {
    revenue: number;
    expenses: number;
    netProfit: number;
    cashFlow: number;
    monthlyEvolution: { month: string; revenue: number; expenses: number }[];
  };
  salesPipeline: {
    stages: { label: string; value: number; count: number }[];
    conversionRate: number | null;
    averageDeal: number | null;
    weightedPipeline: number | null;
  };
  customerHealth: {
    activeClients: number;
    concentrationTop5Pct: number | null;
    churnPct: number | null;
    averageClientValue: number | null;
  };
  operations: { headcount: number };
  team: { headcount: number };
  attention: { label: string; detail: string; tone: "danger" | "warning" | "success"; kind?: "overdue_revenue" | "overdue_expenses" | "cash_flow" }[];
  pulse: string[];
  details: {
    revenueEntries: DetailEntry[];
    expenseEntries: DetailEntry[];
    openLeads: DetailEntry[];
    wonDeals: DetailEntry[];
    activeClients: DetailEntry[];
    churnedClients: DetailEntry[];
    topClients: DetailEntry[];
    teamMembers: DetailEntry[];
    overdueRevenue: DetailEntry[];
    overdueExpenses: DetailEntry[];
  };
};

const currency = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
const shortDate = (iso: string | null) => (iso ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date(iso)) : "—");

const ROLE_LABEL: Record<string, string> = {
  owner: "Sócio",
  admin: "Administrador",
  commercial: "Comercial",
  marketing: "Marketing",
  operations: "Operações",
  finance: "Financeiro",
  production: "Produção",
  client: "Cliente",
};

/** Soma de `revenue.amount` com `status='pago'` cujo `paid_at` cai no intervalo — "realizado",
 *  não "previsto" (ver nota do módulo). */
async function sumRealizedRevenue(fromISO: string, toISO: string): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase.from("revenue").select("amount").eq("status", "pago").gte("paid_at", fromISO).lt("paid_at", toISO);
  return (data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
}

async function sumRealizedExpenses(fromISO: string, toISO: string): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase.from("expenses").select("amount").eq("status", "pago").gte("paid_at", fromISO).lt("paid_at", toISO);
  return (data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
}

/** Série mensal (últimos `months` meses) de receita/despesa REALIZADA — base dos sparklines do
 *  KPI row. Uma query por tipo (não por mês) pra não fazer N chamadas. */
async function monthlyRealizedSeries(months: number): Promise<{ revenue: number[]; expenses: number[] }> {
  const supabase = await createClient();
  const now = todayUTCAnchor();
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1), 1));

  const [{ data: revenueRows }, { data: expenseRows }] = await Promise.all([
    supabase.from("revenue").select("amount, paid_at").eq("status", "pago").gte("paid_at", toISODate(from)),
    supabase.from("expenses").select("amount, paid_at").eq("status", "pago").gte("paid_at", toISODate(from)),
  ]);

  const bucket = (rows: { amount: number; paid_at: string | null }[] | null) => {
    const sums = new Array(months).fill(0);
    for (const row of rows ?? []) {
      if (!row.paid_at) continue;
      // `paid_at` é `date` (sem hora, ex. "2026-08-14") — `new Date(str)` é sempre parseado como
      // UTC-midnight pra strings ISO date-only, e `from` já é UTC-anchored acima, então os
      // getters UTC dos dois lados são consistentes entre si (nunca misturar com getters locais).
      const paid = new Date(row.paid_at);
      const index = (paid.getUTCFullYear() - from.getUTCFullYear()) * 12 + (paid.getUTCMonth() - from.getUTCMonth());
      if (index >= 0 && index < months) sums[index] += Number(row.amount);
    }
    return sums;
  };

  return { revenue: bucket(revenueRows), expenses: bucket(expenseRows) };
}

/** `cashFlowMonths` controla só a janela do gráfico "Cash Flow — Last 6 Months" (Financial
 *  Health) — o resto do Dashboard (KPIs do mês, meta, pipeline) não muda com isso. */
export async function computeExecutiveDashboard(cashFlowMonths = 6): Promise<ExecutiveMetrics> {
  const supabase = await createClient();
  const now = todayUTCAnchor();
  const monthStart = startOfMonth(now);
  const nextMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const prevMonthStart = startOfPreviousMonth(now);

  const [
    goalRow,
    comercial,
    financeiro,
    stages,
    { data: openLeads },
    { data: wonLeads },
    { data: allClients },
    { data: activeContracts },
    { data: costs },
    { data: users },
    revenueThisMonthRealized,
    revenueLastMonthRealized,
    expensesThisMonthRealized,
    monthlySeries,
    { data: revenueDaily },
    { data: overdueRevenue },
    { data: overdueExpenses },
    { data: revenueEntriesThisMonth },
    { data: expenseEntriesThisMonth },
  ] = await Promise.all([
    getCurrentMonthGoal(),
    computeComercialMetrics(),
    computeFinanceiroMetrics(cashFlowMonths),
    listPipelineStages(),
    supabase.from("leads").select("*").is("client_id", null),
    supabase.from("leads").select("company_name, potential_value, updated_at").not("client_id", "is", null),
    supabase.from("clients").select("*"),
    // "Ativo agora" = `category` explícita (`recorrente_ativo`/`pontual_em_andamento`), não mais
    // `status='ativo'` cru — esse filtro sozinho misturava recorrência de verdade com contrato
    // pontual há muito entregue mas nunca fechado no banco, e não distinguia tipo nenhum (ver
    // `contracts.category`, `lib/supabase/types/database.ts`).
    supabase.from("contracts").select("*").in("category", ["recorrente_ativo", "pontual_em_andamento"]),
    supabase.from("costs").select("amount"),
    supabase.from("users").select("id, name, role"),
    sumRealizedRevenue(toISODate(monthStart), toISODate(nextMonthStart)),
    sumRealizedRevenue(toISODate(prevMonthStart), toISODate(monthStart)),
    sumRealizedExpenses(toISODate(monthStart), toISODate(nextMonthStart)),
    monthlyRealizedSeries(6),
    supabase.from("revenue").select("amount, paid_at").eq("status", "pago").gte("paid_at", toISODate(monthStart)).lt("paid_at", toISODate(nextMonthStart)),
    supabase.from("revenue").select("client_id, description, amount, due_date").eq("status", "atrasado"),
    supabase.from("expenses").select("category, description, amount, due_date").eq("status", "atrasado"),
    supabase.from("revenue").select("client_id, description, amount, paid_at").eq("status", "pago").gte("paid_at", toISODate(monthStart)).lt("paid_at", toISODate(nextMonthStart)),
    supabase.from("expenses").select("category, description, amount, paid_at").eq("status", "pago").gte("paid_at", toISODate(monthStart)).lt("paid_at", toISODate(nextMonthStart)),
  ]);

  const monthlyCostsTotal = (costs ?? []).reduce((sum, cost) => sum + Number(cost.amount), 0);
  const netProfitThisMonth = revenueThisMonthRealized - expensesThisMonthRealized - monthlyCostsTotal;
  const netProfitSeries = monthlySeries.revenue.map((rev, i) => rev - monthlySeries.expenses[i] - monthlyCostsTotal);
  const cashFlowSeries = monthlySeries.revenue.map((rev, i) => rev - monthlySeries.expenses[i]);
  const cashFlowThisMonth = revenueThisMonthRealized - expensesThisMonthRealized;

  const revenueDeltaPct = revenueLastMonthRealized > 0 ? ((revenueThisMonthRealized - revenueLastMonthRealized) / revenueLastMonthRealized) * 100 : null;

  const clients: Client[] = allClients ?? [];
  const clientNameById = new Map(clients.map((client) => [client.id, client.name]));

  // --- Goal / Revenue vs. Target ---
  const daysThisMonth = daysInMonth(now.getUTCFullYear(), now.getUTCMonth());
  const dayOfMonth = now.getUTCDate();
  const goal: GoalProgress | null = goalRow
    ? {
        amount: Number(goalRow.amount),
        realized: revenueThisMonthRealized,
        percentage: (revenueThisMonthRealized / Number(goalRow.amount)) * 100,
        expectedPacePercentage: (dayOfMonth / daysThisMonth) * 100,
      }
    : null;

  const dailyRealizedMap = new Map<number, number>();
  for (const row of revenueDaily ?? []) {
    if (!row.paid_at) continue;
    // `paid_at` é `date` (sem hora) — extrai o dia direto da string, nunca via `new Date(str).getDate()`
    // (que reintroduziria o mesmo viés de fuso que este arquivo inteiro está corrigindo).
    const day = dayOfMonthOf(row.paid_at);
    dailyRealizedMap.set(day, (dailyRealizedMap.get(day) ?? 0) + Number(row.amount));
  }
  let cumulative = 0;
  const revenueVsTargetPoints: RevenueVsTargetPoint[] = Array.from({ length: daysThisMonth }, (_, i) => {
    const day = i + 1;
    if (day <= dayOfMonth) cumulative += dailyRealizedMap.get(day) ?? 0;
    return {
      day,
      realized: day <= dayOfMonth ? cumulative : null,
      pace: goalRow ? Number(goalRow.amount) * (day / daysThisMonth) : 0,
    };
  });

  // --- Sales Pipeline ---
  const leadsOpen: Lead[] = openLeads ?? [];
  const stageById = new Map(stages.map((stage) => [stage.id, stage]));
  const openStages = stages
    .filter((stage) => !stage.is_won && !stage.is_lost)
    .sort((a, b) => a.sort_order - b.sort_order);
  const pipelineByStage = openStages.map((stage) => {
    const leadsInStage = leadsOpen.filter((lead) => lead.stage_id === stage.id);
    return { label: stage.label, value: leadsInStage.reduce((sum, lead) => sum + Number(lead.potential_value ?? 0), 0), count: leadsInStage.length };
  });

  const wonLeadsList = wonLeads ?? [];
  const wonLeadValues = wonLeadsList.map((lead) => Number(lead.potential_value ?? 0)).filter((value) => value > 0);
  const averageDeal = wonLeadValues.length > 0 ? wonLeadValues.reduce((sum, value) => sum + value, 0) / wonLeadValues.length : null;

  const allOpenStagesHaveProbability = openStages.length > 0 && openStages.every((stage) => stage.probability != null);
  const weightedPipeline = allOpenStagesHaveProbability
    ? leadsOpen.reduce((sum, lead) => {
        const stage = stageById.get(lead.stage_id);
        const probability = stage?.probability != null ? Number(stage.probability) : 0;
        return sum + Number(lead.potential_value ?? 0) * (probability / 100);
      }, 0)
    : null;

  // --- Customer Health ---
  const activeClientsList = clients.filter((client) => client.status === "ativo");
  const churnedClientsList = clients.filter((client) => client.status === "churn");
  const churnPct = clients.length > 0 ? (churnedClientsList.length / clients.length) * 100 : null;

  const contracts: Contract[] = activeContracts ?? [];
  const revenueByClient = new Map<string, number>();
  for (const contract of contracts) {
    const value = contract.type === "recorrente" ? Number(contract.monthly_value ?? 0) : Number(contract.total_value ?? 0);
    revenueByClient.set(contract.client_id, (revenueByClient.get(contract.client_id) ?? 0) + value);
  }
  const clientRevenueValues = Array.from(revenueByClient.values()).sort((a, b) => b - a);
  const totalClientRevenue = clientRevenueValues.reduce((sum, value) => sum + value, 0);
  const top5Revenue = clientRevenueValues.slice(0, 5).reduce((sum, value) => sum + value, 0);
  const concentrationTop5Pct = totalClientRevenue > 0 ? (top5Revenue / totalClientRevenue) * 100 : null;
  const averageClientValue = clientRevenueValues.length > 0 ? totalClientRevenue / clientRevenueValues.length : null;

  const topClientsRanked = Array.from(revenueByClient.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([clientId, amount]) => ({
      label: clientNameById.get(clientId) ?? "Cliente removido",
      value: currency(amount),
      meta: totalClientRevenue > 0 ? `${((amount / totalClientRevenue) * 100).toFixed(1)}%` : undefined,
    }));

  // --- Attention required ---
  const overdueRevenueList = overdueRevenue ?? [];
  const overdueExpensesList = overdueExpenses ?? [];
  const overdueRevenueTotal = overdueRevenueList.reduce((sum, row) => sum + Number(row.amount), 0);
  const overdueExpensesTotal = overdueExpensesList.reduce((sum, row) => sum + Number(row.amount), 0);
  const attention: ExecutiveMetrics["attention"] = [];
  if (overdueRevenueList.length > 0) {
    attention.push({
      label: `${overdueRevenueList.length} fatura${overdueRevenueList.length === 1 ? "" : "s"} atrasada${overdueRevenueList.length === 1 ? "" : "s"}`,
      detail: `${formatCurrency(overdueRevenueTotal)} em aberto`,
      tone: "danger",
      kind: "overdue_revenue",
    });
  }
  if (overdueExpensesList.length > 0) {
    attention.push({
      label: `${overdueExpensesList.length} conta${overdueExpensesList.length === 1 ? "" : "s"} atrasada${overdueExpensesList.length === 1 ? "" : "s"}`,
      detail: `${formatCurrency(overdueExpensesTotal)} em aberto`,
      tone: "warning",
      kind: "overdue_expenses",
    });
  }
  attention.push({
    label: cashFlowThisMonth >= 0 ? "Fluxo de caixa positivo" : "Fluxo de caixa negativo",
    detail: `${cashFlowThisMonth >= 0 ? "+" : ""}${formatCurrency(cashFlowThisMonth)} este mês`,
    tone: cashFlowThisMonth >= 0 ? "success" : "danger",
    kind: "cash_flow",
  });

  // --- Business pulse (template, não IA — preparado pra virar isso depois) ---
  const pulse: string[] = [];
  if (revenueDeltaPct != null) {
    pulse.push(`Receita ${revenueDeltaPct >= 0 ? "aumentou" : "caiu"} ${Math.abs(revenueDeltaPct).toFixed(0)}% este mês em relação ao mês passado.`);
  }
  if (comercial.newLeadsThisMonth > 0) {
    pulse.push(
      comercial.newLeadsThisMonth === 1
        ? `1 novo lead entrou no pipeline este mês.`
        : `${comercial.newLeadsThisMonth} novos leads entraram no pipeline este mês.`,
    );
  }
  if (goal) {
    const gap = goal.percentage - goal.expectedPacePercentage;
    pulse.push(
      gap >= 0
        ? `O ritmo de receita está ${gap.toFixed(0)}pp acima do esperado pra este ponto do mês.`
        : `O ritmo de receita está ${Math.abs(gap).toFixed(0)}pp abaixo do esperado pra este ponto do mês.`,
    );
  }

  return {
    goal,
    kpis: {
      revenue: { value: revenueThisMonthRealized, sparkline: monthlySeries.revenue, deltaPct: revenueDeltaPct },
      netProfit: { value: netProfitThisMonth, sparkline: netProfitSeries },
      cashFlow: { value: cashFlowThisMonth, sparkline: cashFlowSeries },
      pipeline: { value: comercial.pipelineValue, openCount: comercial.openLeads },
      activeClients: { value: activeClientsList.length, deltaCount: null },
      team: { value: users?.length ?? 0 },
    },
    revenueVsTarget: { points: revenueVsTargetPoints, goalAmount: goalRow ? Number(goalRow.amount) : null },
    financialHealth: {
      revenue: revenueThisMonthRealized,
      expenses: expensesThisMonthRealized,
      netProfit: netProfitThisMonth,
      cashFlow: cashFlowThisMonth,
      monthlyEvolution: financeiro.monthlyEvolution,
    },
    salesPipeline: {
      stages: pipelineByStage,
      conversionRate: comercial.conversionRate,
      averageDeal,
      weightedPipeline,
    },
    customerHealth: {
      activeClients: activeClientsList.length,
      concentrationTop5Pct,
      churnPct,
      averageClientValue,
    },
    operations: { headcount: users?.length ?? 0 },
    team: { headcount: users?.length ?? 0 },
    attention,
    pulse,
    details: {
      revenueEntries: (revenueEntriesThisMonth ?? []).map((row) => ({
        label: row.description || clientNameById.get(row.client_id ?? "") || "Receita",
        value: currency(Number(row.amount)),
        meta: shortDate(row.paid_at),
      })),
      expenseEntries: (expenseEntriesThisMonth ?? []).map((row) => ({
        label: row.description || row.category,
        value: currency(Number(row.amount)),
        meta: shortDate(row.paid_at),
      })),
      openLeads: leadsOpen.map((lead) => ({
        label: lead.company_name,
        value: currency(Number(lead.potential_value ?? 0)),
        meta: stageById.get(lead.stage_id)?.label,
      })),
      wonDeals: wonLeadsList
        .filter((lead) => Number(lead.potential_value ?? 0) > 0)
        .map((lead) => ({ label: lead.company_name, value: currency(Number(lead.potential_value ?? 0)) })),
      activeClients: activeClientsList.map((client) => ({ label: client.name, meta: client.segment ?? undefined })),
      churnedClients: churnedClientsList.map((client) => ({ label: client.name, meta: client.segment ?? undefined })),
      topClients: topClientsRanked,
      teamMembers: (users ?? []).map((user) => ({ label: user.name, meta: ROLE_LABEL[user.role] ?? user.role })),
      overdueRevenue: overdueRevenueList.map((row) => ({
        label: row.description || clientNameById.get(row.client_id ?? "") || "Receita",
        value: currency(Number(row.amount)),
        meta: `venceu ${shortDate(row.due_date)}`,
      })),
      overdueExpenses: overdueExpensesList.map((row) => ({
        label: row.description || row.category,
        value: currency(Number(row.amount)),
        meta: `venceu ${shortDate(row.due_date)}`,
      })),
    },
  };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}
