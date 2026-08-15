import "server-only";
import { createClient } from "@/lib/supabase/server";
import { addDaysISO, currentMonthKey, lastMonthKeys, monthKeyOf, todayISO } from "@/lib/date";
import type { Cost, Expense, Revenue } from "@/lib/supabase/types/database";
import type { FinanceiroMetrics, MonthlyEvolutionPoint, MonthlyRevenueByClient, PipelineOpportunity, UpcomingReceivablesSummary } from "@/lib/financeiro/types";

/** Janela da automação §72 regra 3 ("vencendo em N dias") — fixa por enquanto (sem UI de
 *  configuração ainda; ver `docs/execution-status.md` pro porquê de não ter sido feita nesta
 *  sessão). 5 dias úteis de antecedência é o padrão adotado. */
export const UPCOMING_RECEIVABLES_WINDOW_DAYS = 5;

export async function listRevenue(): Promise<Revenue[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("revenue").select("*").order("due_date");
  return data ?? [];
}

export async function listExpenses(): Promise<Expense[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("expenses").select("*").order("due_date");
  return data ?? [];
}

/** Estrutura de custo fixo/variável — ver `Cost` (`lib/supabase/types/database.ts`) pra por que
 *  não é a mesma tabela de `Expense`. */
export async function listCosts(): Promise<Cost[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("costs").select("*").order("category");
  return data ?? [];
}

/** `evolutionMonths` controla a janela do gráfico "Evolução" (`RevenueChart`) — o resto das
 *  métricas (mês corrente, MRR, contas pendentes/atrasadas) não muda com isso, só a série
 *  histórica. Default 6 preserva o comportamento de sempre; `/financeiro` e o Dashboard passam o
 *  valor escolhido no seletor de período (`PeriodSelect`). */
export async function computeFinanceiroMetrics(evolutionMonths = 6): Promise<FinanceiroMetrics> {
  const supabase = await createClient();
  const [revenueRaw, expenses, costs, { data: activeRecurringContracts }, { data: negociacaoStage }, { data: clients }] = await Promise.all([
    listRevenue(),
    listExpenses(),
    listCosts(),
    // MRR = só `category='recorrente_ativo'` — não mais `type`+`status` inferido na leitura (era
    // aí que uma fase antiga renegociada, nunca marcada `encerrado`, inflava o MRR: ver
    // `contracts.category`, `lib/supabase/types/database.ts`).
    supabase.from("contracts").select("*").eq("category", "recorrente_ativo"),
    // Junção manual em TS, não embed do PostgREST (mesmo motivo de `lib/clientes/queries.ts`):
    // `Database` é uma aproximação manual, embed aninhado arrisca inferência `never`.
    supabase.from("pipeline_stages").select("id").eq("key", "negociacao").maybeSingle(),
    // Só pra resolver `client_id` → nome no breakdown por cliente do gráfico de evolução (hover).
    supabase.from("clients").select("id, name"),
  ]);
  const clientNameById = new Map((clients ?? []).map((client) => [client.id, client.name]));

  // Pipeline (negociação em aberto) — nunca soma no MRR nem em "a receber", é um número à parte
  // ("MRR potencial se fechar"). Só o estágio 'negociacao': é o que o funil chama de negócio já
  // em conversa de valor/fechamento, não qualquer lead aberto (proposta enviada, reunião etc.
  // ficam só no funil comercial, não neste "quase-MRR").
  const { data: negociacaoLeads } = negociacaoStage
    ? await supabase.from("leads").select("company_name, potential_value").eq("stage_id", negociacaoStage.id)
    : { data: [] };

  const mrr = (activeRecurringContracts ?? []).reduce((sum, contract) => sum + Number(contract.monthly_value ?? 0), 0);

  // `cancelado` = cobrança que existiu mas nunca vai ser recebida (write-off) — não é receita do
  // mês nem da evolução histórica, mas o registro em si fica (auditoria). Excluído de toda soma
  // de "receita", nunca só de "a receber" (senão infla `revenueThisMonth`/`monthlyEvolution`).
  const revenue = revenueRaw.filter((row) => row.status !== "cancelado");

  const thisMonthKey = currentMonthKey();
  const revenueThisMonth = revenue.filter((row) => monthKeyOf(row.due_date) === thisMonthKey).reduce((sum, row) => sum + Number(row.amount), 0);
  const expensesThisMonth = expenses.filter((row) => monthKeyOf(row.due_date) === thisMonthKey).reduce((sum, row) => sum + Number(row.amount), 0);
  const monthlyCostsTotal = costs.reduce((sum, cost) => sum + Number(cost.amount), 0);
  const margin = revenueThisMonth - expensesThisMonth - monthlyCostsTotal;

  const receivablesPending = revenue.filter((row) => row.status === "pendente").reduce((sum, row) => sum + Number(row.amount), 0);
  const receivablesOverdue = revenue.filter((row) => row.status === "atrasado").reduce((sum, row) => sum + Number(row.amount), 0);
  const payablesPending = expenses.filter((row) => row.status === "pendente").reduce((sum, row) => sum + Number(row.amount), 0);
  const payablesOverdue = expenses.filter((row) => row.status === "atrasado").reduce((sum, row) => sum + Number(row.amount), 0);

  const months = lastMonthKeys(evolutionMonths);
  const monthlyEvolution: MonthlyEvolutionPoint[] = months.map((month) => {
    const monthRevenue = revenue.filter((row) => monthKeyOf(row.due_date) === month);

    // Breakdown por cliente do hover do gráfico — "de qual cliente está vindo" (pedido explícito).
    // Chave por `client_id` (não pelo nome) — é o que vira o link "quanto eu já faturei com ele"
    // pra `/clientes/[id]` (mesma página que já soma o histórico completo do cliente). Mesmo
    // cliente com mais de uma cobrança no mês (ex.: parcelas) soma numa entrada só; ordenado do
    // maior pro menor pra ler de relance quem puxou o mês.
    const amountByClient = new Map<string, { clientId: string | null; clientName: string; amount: number }>();
    for (const row of monthRevenue) {
      const key = row.client_id ?? "__sem_cliente__";
      const name = (row.client_id && clientNameById.get(row.client_id)) || "Sem cliente vinculado";
      const current = amountByClient.get(key);
      amountByClient.set(key, { clientId: row.client_id, clientName: name, amount: (current?.amount ?? 0) + Number(row.amount) });
    }
    const revenueByClient: MonthlyRevenueByClient[] = Array.from(amountByClient.values()).sort((a, b) => b.amount - a.amount);

    return {
      month,
      revenue: monthRevenue.reduce((sum, row) => sum + Number(row.amount), 0),
      expenses: expenses.filter((row) => monthKeyOf(row.due_date) === month).reduce((sum, row) => sum + Number(row.amount), 0),
      revenueByClient,
    };
  });

  const pipelineOpportunities: PipelineOpportunity[] = (negociacaoLeads ?? []).map((lead) => ({
    label: lead.company_name,
    potentialMonthlyValue: Number(lead.potential_value ?? 0),
  }));
  const pipelinePotentialMrr = pipelineOpportunities.reduce((sum, lead) => sum + lead.potentialMonthlyValue, 0);

  // Automação §72 regra 3 — só `pendente` (nunca `atrasado`, que já é `receivablesOverdue` acima
  // — vencer daqui a N dias e já estar atrasado são dois avisos diferentes, nunca a mesma linha).
  const today = todayISO();
  const windowEnd = addDaysISO(today, UPCOMING_RECEIVABLES_WINDOW_DAYS);
  const upcomingEntries = revenue.filter((row) => row.status === "pendente" && row.due_date >= today && row.due_date <= windowEnd);
  const upcomingReceivables: UpcomingReceivablesSummary = {
    total: upcomingEntries.reduce((sum, row) => sum + Number(row.amount), 0),
    windowDays: UPCOMING_RECEIVABLES_WINDOW_DAYS,
    entries: upcomingEntries.map((row) => ({ id: row.id, description: row.description, amount: Number(row.amount), dueDate: row.due_date })),
  };

  return {
    mrr,
    revenueThisMonth,
    expensesThisMonth,
    monthlyCostsTotal,
    margin,
    receivablesPending,
    receivablesOverdue,
    payablesPending,
    payablesOverdue,
    monthlyEvolution,
    pipelinePotentialMrr,
    pipelineOpportunities,
    upcomingReceivables,
  };
}
