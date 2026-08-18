import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getCurrentMonthGoal, type GoalProgress } from "@/lib/dashboard/goals";
import { computeComercialMetrics } from "@/lib/comercial/metrics";
import { listPipelineStages } from "@/lib/comercial/queries";
import { computeFinanceiroMetrics } from "@/lib/financeiro/queries";
import { computeTopClientConcentration } from "@/lib/financeiro/calculations";
import { dayOfMonthOf, daysInMonth, todayUTCAnchor } from "@/lib/date";
import type { Client, Contract, Lead } from "@/lib/supabase/types/database";
import type { MonthlyEvolutionPoint } from "@/lib/financeiro/types";

// ---------------------------------------------------------------------------
// Query central do Dashboard executivo — junta o que já existe (lib/comercial, lib/financeiro,
// lib/dashboard/goals) com o que precisou de query nova, sempre marcando explicitamente o que
// não tem dado suficiente (`null`/array vazio) em vez de inventar.
//
// BUG REAL corrigido nesta rodada (reportado pelo usuário, "erro grave"): "Receita"/"Lucro
// Líquido"/"Fluxo de Caixa" aqui usavam uma definição PRÓPRIA (REALIZADO — só `status='pago'`,
// por `paid_at`), diferente do `revenueThisMonth` de `computeFinanceiroMetrics()` (tudo com
// `due_date` no mês, sem filtrar status) — os dois "conviviam", mas mostravam números diferentes
// pro mesmo mês em telas diferentes, exatamente o tipo de inconsistência que o usuário rejeitou
// explicitamente ("o dashboard deve ser o resultado do financeiro"). Corrigido: Receita/Despesas/
// Lucro Líquido/Fluxo de Caixa/Meta/sparklines agora vêm TODOS de `financeiro` (o mesmo
// `computeFinanceiroMetrics()` que a página Financeiro usa) — nunca mais uma segunda conta em
// paralelo pro mesmo número. O gráfico dia-a-dia "Receita vs Meta" também foi migrado de
// `paid_at` pra `due_date` (mesma base), pelo mesmo motivo.
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
// `GoalProgress` reexportado por compatibilidade — quem já importava daqui (`dashboard-date-
// header.tsx`) continua funcionando sem mudar o import; a definição real mora em `goals.ts`
// agora (Financeiro também precisa, e `lib/financeiro` não pode depender deste arquivo — ele já
// depende de `lib/financeiro/queries.ts`, seria import circular).
export type { GoalProgress };

function startOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function startOfPreviousMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1));
}

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

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
    /** Linha de KPIs do topo (redesign) — "Clientes Recorrentes"/"Projetos" substituem
     *  "Clientes Ativos"/"Equipe" ali especificamente (as duas seções mais abaixo que também
     *  usam "Clientes Ativos"/"Equipe" continuam com o significado de sempre, sem mudança). */
    recurringClients: { value: number };
    projectClients: { value: number };
  };
  revenueVsTarget: { points: RevenueVsTargetPoint[]; goalAmount: number | null };
  financialHealth: {
    revenue: number;
    expenses: number;
    netProfit: number;
    cashFlow: number;
    monthlyEvolution: MonthlyEvolutionPoint[];
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
  attention: { label: string; detail: string; tone: "danger" | "warning" | "success"; kind?: "overdue_revenue" | "overdue_expenses" | "upcoming_revenue" | "cash_flow" }[];
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
    recurringClients: DetailEntry[];
    projectClients: DetailEntry[];
    overdueRevenue: DetailEntry[];
    overdueExpenses: DetailEntry[];
    upcomingRevenue: DetailEntry[];
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
    // Dia-a-dia do mês (gráfico "Receita vs Meta") — mesma base de `financeiro.revenueThisMonth`
    // agora: `due_date`, qualquer status que não `cancelado` (era `paid_at`+`status='pago'`, a
    // fonte da inconsistência corrigida nesta rodada).
    supabase.from("revenue").select("amount, due_date").neq("status", "cancelado").gte("due_date", toISODate(monthStart)).lt("due_date", toISODate(nextMonthStart)),
    supabase.from("revenue").select("client_id, description, amount, due_date").eq("status", "atrasado"),
    supabase.from("expenses").select("category, description, amount, due_date").eq("status", "atrasado"),
    supabase.from("revenue").select("client_id, description, amount, due_date, status").neq("status", "cancelado").gte("due_date", toISODate(monthStart)).lt("due_date", toISODate(nextMonthStart)),
    supabase.from("expenses").select("category, description, amount, due_date, status").neq("status", "cancelado").gte("due_date", toISODate(monthStart)).lt("due_date", toISODate(nextMonthStart)),
  ]);

  const monthlyCostsTotal = (costs ?? []).reduce((sum, cost) => sum + Number(cost.amount), 0);
  // Receita/Despesas/Lucro Líquido/Fluxo de Caixa vêm de `financeiro` agora — mesma fonte que a
  // página Financeiro usa, nunca mais uma segunda conta em paralelo (ver comentário do módulo).
  const revenueThisMonth = financeiro.revenueThisMonth;
  const expensesThisMonth = financeiro.expensesThisMonth;
  const netProfitThisMonth = financeiro.margin;
  const cashFlowThisMonth = financeiro.revenueThisMonth - financeiro.expensesThisMonth;
  const monthlySeries = { revenue: financeiro.monthlyEvolution.map((point) => point.revenue), expenses: financeiro.monthlyEvolution.map((point) => point.expenses) };
  const netProfitSeries = monthlySeries.revenue.map((rev, i) => rev - monthlySeries.expenses[i] - monthlyCostsTotal);
  const cashFlowSeries = monthlySeries.revenue.map((rev, i) => rev - monthlySeries.expenses[i]);

  // `monthlyEvolution` vem do mais antigo pro mais recente (mesma ordem de `lastMonthKeys`) — o
  // último ponto é o mês corrente, o penúltimo é o mês passado.
  const revenueLastMonth = financeiro.monthlyEvolution.length >= 2 ? financeiro.monthlyEvolution[financeiro.monthlyEvolution.length - 2].revenue : 0;
  const revenueDeltaPct = revenueLastMonth > 0 ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100 : null;

  const clients: Client[] = allClients ?? [];
  const clientNameById = new Map(clients.map((client) => [client.id, client.name]));

  // --- Goal / Revenue vs. Target ---
  const daysThisMonth = daysInMonth(now.getUTCFullYear(), now.getUTCMonth() + 1);
  const dayOfMonth = now.getUTCDate();
  const goal: GoalProgress | null = goalRow
    ? {
        amount: Number(goalRow.amount),
        realized: revenueThisMonth,
        percentage: (revenueThisMonth / Number(goalRow.amount)) * 100,
        expectedPacePercentage: (dayOfMonth / daysThisMonth) * 100,
      }
    : null;

  const dailyRevenueMap = new Map<number, number>();
  for (const row of revenueDaily ?? []) {
    // `due_date` é `date` (sem hora) — extrai o dia direto da string, nunca via `new Date(str).getDate()`
    // (que reintroduziria o mesmo viés de fuso que este arquivo inteiro está corrigindo).
    const day = dayOfMonthOf(row.due_date);
    dailyRevenueMap.set(day, (dailyRevenueMap.get(day) ?? 0) + Number(row.amount));
  }
  let cumulative = 0;
  const revenueVsTargetPoints: RevenueVsTargetPoint[] = Array.from({ length: daysThisMonth }, (_, i) => {
    const day = i + 1;
    if (day <= dayOfMonth) cumulative += dailyRevenueMap.get(day) ?? 0;
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

  // "Clientes Recorrentes"/"Projetos" (redesign, linha de KPIs do topo) — cliente ativo com
  // contrato `type='recorrente'` vs `type='pontual'` (dentro dos mesmos `activeContracts` já
  // buscados). Um cliente com os dois tipos de contrato conta nas duas listas — são contratos
  // sendo classificados, não o cliente em si.
  const recurringContractClientIds = new Set(contracts.filter((c) => c.type === "recorrente").map((c) => c.client_id));
  const pontualContractClientIds = new Set(contracts.filter((c) => c.type === "pontual").map((c) => c.client_id));
  const recurringClientsList = activeClientsList.filter((client) => recurringContractClientIds.has(client.id));
  const projectClientsList = activeClientsList.filter((client) => pontualContractClientIds.has(client.id));
  // Ranking + % do Top 5 — função compartilhada com o Financeiro (Bloco 4 item 4 do redesign,
  // `lib/financeiro/calculations.ts`), mesma matemática, cada página decide só quais contratos
  // entram no `revenueByClient` acima.
  const { top5Percentage: concentrationTop5Pct, ranked: clientConcentrationRanked } = computeTopClientConcentration(revenueByClient, clientNameById);
  const totalClientRevenue = clientConcentrationRanked.reduce((sum, row) => sum + row.amount, 0);
  const averageClientValue = clientConcentrationRanked.length > 0 ? totalClientRevenue / clientConcentrationRanked.length : null;

  const topClientsRanked = clientConcentrationRanked.slice(0, 5).map((row) => ({
    label: row.clientName,
    value: currency(row.amount),
    meta: totalClientRevenue > 0 ? `${row.percentage.toFixed(1)}%` : undefined,
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
  // Automação §72 regra 3 — "conta a receber vencendo em N dias → alerta interno". Distinto de
  // `overdue_revenue` acima (isto ainda não venceu, é aviso antecipado).
  if (financeiro.upcomingReceivables.entries.length > 0) {
    const count = financeiro.upcomingReceivables.entries.length;
    attention.push({
      label: `${count} conta${count === 1 ? "" : "s"} a receber vencendo em até ${financeiro.upcomingReceivables.windowDays} dias`,
      detail: `${formatCurrency(financeiro.upcomingReceivables.total)} a confirmar`,
      tone: "warning",
      kind: "upcoming_revenue",
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
  if (comercial.newLeadsInPeriod > 0) {
    pulse.push(
      comercial.newLeadsInPeriod === 1
        ? `1 novo lead entrou no pipeline este mês.`
        : `${comercial.newLeadsInPeriod} novos leads entraram no pipeline este mês.`,
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
      revenue: { value: revenueThisMonth, sparkline: monthlySeries.revenue, deltaPct: revenueDeltaPct },
      netProfit: { value: netProfitThisMonth, sparkline: netProfitSeries },
      cashFlow: { value: cashFlowThisMonth, sparkline: cashFlowSeries },
      pipeline: { value: comercial.pipelineValue, openCount: comercial.openLeads },
      activeClients: { value: activeClientsList.length, deltaCount: null },
      team: { value: users?.length ?? 0 },
      recurringClients: { value: recurringClientsList.length },
      projectClients: { value: projectClientsList.length },
    },
    revenueVsTarget: { points: revenueVsTargetPoints, goalAmount: goalRow ? Number(goalRow.amount) : null },
    financialHealth: {
      revenue: revenueThisMonth,
      expenses: expensesThisMonth,
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
      // Nome do cliente primeiro, descrição ("Mensalidade 08/2026") como meta — mesmo ajuste
      // pedido explicitamente pro Financeiro ("A Receber... mude pro nome do cliente"), aplicado
      // aqui também pela mesma razão (mostrar "Mensalidade" como se fosse o nome não ajuda a
      // reconhecer de relance quem é).
      revenueEntries: (revenueEntriesThisMonth ?? []).map((row) => ({
        label: (row.client_id && clientNameById.get(row.client_id)) || row.description || "Receita",
        value: currency(Number(row.amount)),
        meta: row.description ? `${row.description} · ${shortDate(row.due_date)}` : shortDate(row.due_date),
      })),
      expenseEntries: (expenseEntriesThisMonth ?? []).map((row) => ({
        label: row.description || row.category,
        value: currency(Number(row.amount)),
        meta: shortDate(row.due_date),
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
      recurringClients: recurringClientsList.map((client) => ({ label: client.name, meta: client.segment ?? undefined })),
      projectClients: projectClientsList.map((client) => ({ label: client.name, meta: client.segment ?? undefined })),
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
      upcomingRevenue: financeiro.upcomingReceivables.entries.map((entry) => ({
        label: entry.description,
        value: currency(entry.amount),
        meta: `vence ${shortDate(entry.dueDate)}`,
      })),
    },
  };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}
