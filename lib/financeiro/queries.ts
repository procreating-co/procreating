import "server-only";
import { createClient } from "@/lib/supabase/server";
import { currentMonthKey, lastMonthKeys, monthKeyOf } from "@/lib/date";
import type { Cost, Expense, Revenue } from "@/lib/supabase/types/database";
import type { FinanceiroMetrics, MonthlyEvolutionPoint, PipelineOpportunity } from "@/lib/financeiro/types";

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
  const [revenueRaw, expenses, costs, { data: activeRecurringContracts }, { data: negociacaoStage }] = await Promise.all([
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
  ]);

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
  const monthlyEvolution: MonthlyEvolutionPoint[] = months.map((month) => ({
    month,
    revenue: revenue.filter((row) => monthKeyOf(row.due_date) === month).reduce((sum, row) => sum + Number(row.amount), 0),
    expenses: expenses.filter((row) => monthKeyOf(row.due_date) === month).reduce((sum, row) => sum + Number(row.amount), 0),
  }));

  const pipelineOpportunities: PipelineOpportunity[] = (negociacaoLeads ?? []).map((lead) => ({
    label: lead.company_name,
    potentialMonthlyValue: Number(lead.potential_value ?? 0),
  }));
  const pipelinePotentialMrr = pipelineOpportunities.reduce((sum, lead) => sum + lead.potentialMonthlyValue, 0);

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
  };
}
