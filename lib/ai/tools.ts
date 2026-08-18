import "server-only";
import { computeComercialMetrics } from "@/lib/comercial/metrics";
import { listOpenLeads, listPipelineStages } from "@/lib/comercial/queries";
import { computeFinanceiroMetrics, listExpenses, listRevenue } from "@/lib/financeiro/queries";
import { listTodayAndOverdueTasks } from "@/lib/tasks/queries";
import { getCurrentMonthGoal } from "@/lib/dashboard/goals";
import { addDaysISO, daysInMonth, todayISO, todayParts } from "@/lib/date";
import type { AnthropicToolDef } from "@/lib/ai/client";

/**
 * Ferramentas do orquestrador de IA (§73-74) — MVP somente-leitura. TODAS chamam as mesmas
 * queries determinísticas que o resto do produto já usa (nenhum SQL novo, nenhum número
 * calculado "pela IA" — o modelo só formata/explica o que a ferramenta devolve). Cada ferramenta
 * é pequena de propósito (poucos campos, listas com teto) — o objetivo é uma resposta útil, não
 * um dump de tabela inteira pro modelo mastigar.
 *
 * `requiresFinancialAccess` é o mecanismo de RBAC: `getAvailableTools(canView)` (chamado pelo
 * orquestrador ANTES de montar a chamada à API) já tira a ferramenta da lista quando `canView`
 * é falso — o modelo nunca "decide" esconder um número, ele nem sabe que a ferramenta existe.
 * `run()` confere `ctx.canView` de novo por segurança (defesa em profundidade), mas isso nunca
 * deveria disparar na prática — só dispara se algum bug futuro deixar a ferramenta vazar pra
 * fora do filtro.
 */

export type ToolContext = { userId: string; canView: boolean };

export type ToolSpec = {
  definition: AnthropicToolDef;
  requiresFinancialAccess: boolean;
  run: (input: Record<string, unknown>, ctx: ToolContext) => Promise<unknown>;
};

const STALE_LEAD_DAYS_DEFAULT = 3;
const MAX_LIST_ROWS = 10;

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

/** `revenueByClient` mora dentro de cada ponto de `monthlyEvolution` (um por mês), não solto em
 *  `FinanceiroMetrics` — o array é do mais antigo pro mais recente, então o mês corrente é sempre
 *  o último item (mesma convenção já usada em `lib/dashboard/executive-metrics.ts`). */
function thisMonthRevenueByClient(metrics: Awaited<ReturnType<typeof computeFinanceiroMetrics>>) {
  return metrics.monthlyEvolution.at(-1)?.revenueByClient ?? [];
}

const TOOLS: ToolSpec[] = [
  {
    requiresFinancialAccess: false,
    definition: {
      name: "get_pipeline_summary",
      description: "Resumo do funil comercial deste mês: leads abertos, novos, em negociação, fechados, valor total do pipeline e taxa de conversão.",
      input_schema: { type: "object", properties: {} },
    },
    run: async () => {
      const metrics = await computeComercialMetrics();
      return {
        leadsAbertos: metrics.openLeads,
        novosNoPeriodo: metrics.newLeadsInPeriod,
        emNegociacao: metrics.inNegotiation,
        fechadosNoPeriodo: metrics.closedInPeriod,
        valorPipeline: currencyFormatter.format(metrics.pipelineValue),
        taxaConversao: metrics.conversionRate != null ? `${(metrics.conversionRate * 100).toFixed(0)}%` : "sem dado suficiente",
        periodo: metrics.period.label,
      };
    },
  },
  {
    requiresFinancialAccess: false,
    definition: {
      name: "get_stale_leads",
      description: "Leads abertos (não fechados, não perdidos) sem contato há mais de N dias — quem precisa de follow-up. Padrão: 3 dias.",
      input_schema: {
        type: "object",
        properties: { days: { type: "number", description: "Dias sem contato pra considerar 'sem follow-up'. Padrão 3." } },
      },
    },
    run: async (input) => {
      const days = typeof input.days === "number" && input.days > 0 ? input.days : STALE_LEAD_DAYS_DEFAULT;
      const [leads, stages] = await Promise.all([listOpenLeads(), listPipelineStages()]);
      const lostStageIds = new Set(stages.filter((stage) => stage.is_lost).map((stage) => stage.id));
      const thresholdISO = addDaysISO(todayISO(), -days);
      const stale = leads
        .filter((lead) => !lostStageIds.has(lead.stage_id))
        .filter((lead) => (lead.last_contact_at ?? lead.created_at) < thresholdISO)
        .sort((a, b) => (a.last_contact_at ?? a.created_at).localeCompare(b.last_contact_at ?? b.created_at))
        .slice(0, MAX_LIST_ROWS)
        .map((lead) => ({ empresa: lead.company_name, estagio: lead.stage.label, ultimoContato: lead.last_contact_at ?? lead.created_at }));
      return { diasConsiderados: days, total: stale.length, leads: stale };
    },
  },
  {
    requiresFinancialAccess: false,
    definition: {
      name: "get_my_tasks_due",
      description: "Tarefas do usuário que está perguntando, vencendo hoje ou atrasadas (qualquer status).",
      input_schema: { type: "object", properties: {} },
    },
    run: async (_input, ctx) => {
      const tasks = await listTodayAndOverdueTasks(ctx.userId);
      return {
        total: tasks.length,
        tarefas: tasks.slice(0, MAX_LIST_ROWS + 5).map((task) => ({ titulo: task.title, vencimento: task.due_date, status: task.status })),
      };
    },
  },
  {
    requiresFinancialAccess: true,
    definition: {
      name: "get_financial_summary",
      description: "Resumo financeiro do mês corrente: MRR, receita do mês, despesas do mês, custos fixos/variáveis e margem.",
      input_schema: { type: "object", properties: {} },
    },
    run: async () => {
      const metrics = await computeFinanceiroMetrics();
      return {
        mrr: currencyFormatter.format(metrics.mrr),
        receitaDoMes: currencyFormatter.format(metrics.revenueThisMonth),
        despesasDoMes: currencyFormatter.format(metrics.expensesThisMonth),
        custosFixosVariaveis: currencyFormatter.format(metrics.monthlyCostsTotal),
        margem: currencyFormatter.format(metrics.margin),
      };
    },
  },
  {
    requiresFinancialAccess: true,
    definition: {
      name: "get_overdue_accounts",
      description: "Contas a receber e a pagar atrasadas (status='atrasado') — descrição, valor e vencimento.",
      input_schema: { type: "object", properties: {} },
    },
    run: async () => {
      const [revenue, expenses] = await Promise.all([listRevenue(), listExpenses()]);
      const overdueRevenue = revenue.filter((row) => row.status === "atrasado");
      const overdueExpenses = expenses.filter((row) => row.status === "atrasado");
      return {
        contasAReceberAtrasadas: {
          total: overdueRevenue.length,
          itens: overdueRevenue.slice(0, MAX_LIST_ROWS).map((row) => ({ descricao: row.description, valor: currencyFormatter.format(Number(row.amount)), vencimento: row.due_date })),
        },
        contasAPagarAtrasadas: {
          total: overdueExpenses.length,
          itens: overdueExpenses.slice(0, MAX_LIST_ROWS).map((row) => ({ descricao: row.description, valor: currencyFormatter.format(Number(row.amount)), vencimento: row.due_date })),
        },
      };
    },
  },
  {
    requiresFinancialAccess: true,
    definition: {
      name: "get_upcoming_receivables",
      description: "Contas a receber pendentes vencendo dentro da janela de alerta configurada (Configurações → Regras Financeiras).",
      input_schema: { type: "object", properties: {} },
    },
    run: async () => {
      const metrics = await computeFinanceiroMetrics();
      const { total, windowDays, entries } = metrics.upcomingReceivables;
      return {
        janelaDias: windowDays,
        total: currencyFormatter.format(total),
        itens: entries.slice(0, MAX_LIST_ROWS).map((entry) => ({ descricao: entry.description, valor: currencyFormatter.format(entry.amount), vencimento: entry.dueDate })),
      };
    },
  },
  {
    // Fase 2 do AI Core — pedido explícito ("quanto falta pra bater nossa meta" era o próprio
    // exemplo de UX do pedido). Mesma conta usada no Dashboard/Financeiro (goal.amount −
    // revenueThisMonth) — nunca uma terceira fórmula pro mesmo número, só reaplicada aqui porque
    // não existe uma função `computeGoalProgress` compartilhada ainda (o Dashboard e o Financeiro
    // já fazem essa mesma arimética cada um no seu lugar, ver `lib/dashboard/executive-metrics.ts`
    // e `lib/financeiro/queries.ts`).
    requiresFinancialAccess: true,
    definition: {
      name: "get_goal_progress",
      description: "Meta de faturamento do mês corrente: valor da meta, quanto já foi realizado, quanto falta e quantos dias restam no mês.",
      input_schema: { type: "object", properties: {} },
    },
    run: async () => {
      const [goalRow, metrics] = await Promise.all([getCurrentMonthGoal(), computeFinanceiroMetrics()]);
      if (!goalRow) return { definida: false, mensagem: "Nenhuma meta definida para este mês (Configurações → Geral)." };
      const amount = Number(goalRow.amount);
      const realized = metrics.revenueThisMonth;
      const remaining = Math.max(0, amount - realized);
      const { year, month, day } = todayParts();
      return {
        definida: true,
        meta: currencyFormatter.format(amount),
        realizado: currencyFormatter.format(realized),
        restante: currencyFormatter.format(remaining),
        percentualAtingido: `${((realized / amount) * 100).toFixed(1)}%`,
        diasRestantesNoMes: daysInMonth(year, month) - day,
      };
    },
  },
  {
    requiresFinancialAccess: true,
    definition: {
      name: "get_top_client",
      description: "Cliente que mais gerou receita este mês (faturamento por cliente, este mês).",
      input_schema: { type: "object", properties: {} },
    },
    run: async () => {
      const metrics = await computeFinanceiroMetrics();
      const ranked = [...thisMonthRevenueByClient(metrics)].sort((a, b) => b.amount - a.amount);
      if (ranked.length === 0) return { mensagem: "Nenhuma receita registrada este mês ainda." };
      const top = ranked[0];
      const total = ranked.reduce((sum, row) => sum + row.amount, 0);
      return {
        cliente: top.clientName,
        valor: currencyFormatter.format(top.amount),
        percentualDaReceitaDoMes: total > 0 ? `${((top.amount / total) * 100).toFixed(0)}%` : "0%",
        top5: ranked.slice(0, 5).map((row) => ({ cliente: row.clientName, valor: currencyFormatter.format(row.amount) })),
      };
    },
  },
  {
    // "Quantas vendas precisamos pra bater a meta" — calculadora pura em cima de 2 números que já
    // existem (gap da meta, ticket médio deste mês); nunca uma estimativa da IA, sempre aritmética
    // determinística sobre dado real.
    requiresFinancialAccess: true,
    definition: {
      name: "get_growth_target",
      description: "Quantos clientes/vendas novas seriam necessários para fechar o gap até a meta do mês, usando o ticket médio (receita por cliente) deste mês.",
      input_schema: { type: "object", properties: {} },
    },
    run: async () => {
      const [goalRow, metrics] = await Promise.all([getCurrentMonthGoal(), computeFinanceiroMetrics()]);
      if (!goalRow) return { mensagem: "Nenhuma meta definida para este mês (Configurações → Geral)." };
      const amount = Number(goalRow.amount);
      const gap = Math.max(0, amount - metrics.revenueThisMonth);
      const revenueByClient = thisMonthRevenueByClient(metrics);
      const clientCount = revenueByClient.length;
      const averageTicket = clientCount > 0 ? revenueByClient.reduce((sum, row) => sum + row.amount, 0) / clientCount : 0;
      if (gap === 0) return { mensagem: "A meta deste mês já foi batida." };
      if (averageTicket === 0) return { gapParaMeta: currencyFormatter.format(gap), mensagem: "Sem receita por cliente este mês ainda pra calcular um ticket médio." };
      return {
        gapParaMeta: currencyFormatter.format(gap),
        ticketMedioDoMes: currencyFormatter.format(averageTicket),
        clientesNecessarios: Math.ceil(gap / averageTicket),
      };
    },
  },
];

/** Chamado pelo orquestrador ANTES de montar a requisição — filtra por RBAC de verdade (não uma
 *  sugestão pro modelo). */
export function getAvailableTools(canView: boolean): ToolSpec[] {
  return TOOLS.filter((tool) => !tool.requiresFinancialAccess || canView);
}

export async function executeTool(name: string, input: Record<string, unknown>, ctx: ToolContext): Promise<unknown> {
  const tool = TOOLS.find((t) => t.definition.name === name);
  if (!tool) return { error: `Ferramenta "${name}" não existe.` };
  if (tool.requiresFinancialAccess && !ctx.canView) return { error: "Sem acesso a dados financeiros." };
  return tool.run(input, ctx);
}
