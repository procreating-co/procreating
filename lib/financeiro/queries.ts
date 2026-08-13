import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Expense, Revenue } from "@/lib/supabase/types/database";
import type { FinanceiroMetrics, MonthlyEvolutionPoint } from "@/lib/financeiro/types";

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

function monthKey(dateStr: string): string {
  const date = new Date(dateStr);
  return `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

/** Últimos N meses (incluindo o atual), na ordem cronológica — chave "MM/YYYY" igual à que
 *  `monthKey` produz, pra bater com o agrupamento de `revenue`/`expenses` abaixo. */
function lastMonths(count: number): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`);
  }
  return months;
}

export async function computeFinanceiroMetrics(): Promise<FinanceiroMetrics> {
  const supabase = await createClient();
  const [revenue, expenses, { data: activeRecurringContracts }] = await Promise.all([
    listRevenue(),
    listExpenses(),
    supabase.from("contracts").select("*").eq("type", "recorrente").eq("status", "ativo"),
  ]);

  const mrr = (activeRecurringContracts ?? []).reduce((sum, contract) => sum + Number(contract.monthly_value ?? 0), 0);

  const thisMonthKey = monthKey(new Date().toISOString());
  const revenueThisMonth = revenue.filter((row) => monthKey(row.due_date) === thisMonthKey).reduce((sum, row) => sum + Number(row.amount), 0);
  const expensesThisMonth = expenses.filter((row) => monthKey(row.due_date) === thisMonthKey).reduce((sum, row) => sum + Number(row.amount), 0);

  const receivablesPending = revenue.filter((row) => row.status === "pendente").reduce((sum, row) => sum + Number(row.amount), 0);
  const receivablesOverdue = revenue.filter((row) => row.status === "atrasado").reduce((sum, row) => sum + Number(row.amount), 0);
  const payablesPending = expenses.filter((row) => row.status === "pendente").reduce((sum, row) => sum + Number(row.amount), 0);
  const payablesOverdue = expenses.filter((row) => row.status === "atrasado").reduce((sum, row) => sum + Number(row.amount), 0);

  const months = lastMonths(6);
  const monthlyEvolution: MonthlyEvolutionPoint[] = months.map((month) => ({
    month,
    revenue: revenue.filter((row) => monthKey(row.due_date) === month).reduce((sum, row) => sum + Number(row.amount), 0),
    expenses: expenses.filter((row) => monthKey(row.due_date) === month).reduce((sum, row) => sum + Number(row.amount), 0),
  }));

  return { mrr, revenueThisMonth, expensesThisMonth, receivablesPending, receivablesOverdue, payablesPending, payablesOverdue, monthlyEvolution };
}
