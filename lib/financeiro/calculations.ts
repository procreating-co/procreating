import { addDaysISO, monthKeyOf } from "@/lib/date";
import type { Revenue } from "@/lib/supabase/types/database";
import type { MonthlyRevenueByClient, UpcomingReceivablesSummary } from "@/lib/financeiro/types";

/**
 * Aritmética pura de `computeFinanceiroMetrics` (`lib/financeiro/queries.ts`), extraída pra cá —
 * mesmo cálculo, sem I/O — pra dar pra testar sem mockar Supabase (item 1 da auditoria: "lucro/
 * margem/MRR" já teve bug real de fuso/inferência antes, é a lógica de maior risco silencioso do
 * Financeiro). `queries.ts` continua a única fonte de verdade que busca dado — este arquivo só
 * calcula em cima do que já foi buscado, nunca faz sua própria query.
 */

export function sumAmount(rows: { amount: number | string }[]): number {
  return rows.reduce((sum, row) => sum + Number(row.amount), 0);
}

/** Soma `amount` das linhas cujo `due_date` cai no mês `monthKey` ("MM/YYYY", `monthKeyOf`) —
 *  mesma regra usada pra receita/despesa do mês corrente e pra cada ponto da evolução mensal. */
export function sumAmountForMonth<T extends { due_date: string; amount: number | string }>(rows: T[], monthKey: string): number {
  return sumAmount(rows.filter((row) => monthKeyOf(row.due_date) === monthKey));
}

/** MRR = soma de `monthly_value` de contratos já filtrados por `category='recorrente_ativo'`
 *  (o filtro é I/O, feito em `queries.ts`; aqui só a soma). */
export function computeMrr(contracts: { monthly_value: number | null }[]): number {
  return contracts.reduce((sum, contract) => sum + Number(contract.monthly_value ?? 0), 0);
}

/** Receita do mês − despesas do mês − custos fixos/variáveis (run-rate). */
export function computeMargin(revenueThisMonth: number, expensesThisMonth: number, monthlyCostsTotal: number): number {
  return revenueThisMonth - expensesThisMonth - monthlyCostsTotal;
}

/** Agrupa receita de um mês por cliente (cobranças do mesmo cliente somam numa entrada só),
 *  ordenado do maior pro menor — alimenta o hover "de qual cliente veio" do gráfico de evolução. */
export function groupRevenueByClient(rows: Pick<Revenue, "client_id" | "amount">[], clientNameById: Map<string, string>): MonthlyRevenueByClient[] {
  const amountByClient = new Map<string, MonthlyRevenueByClient>();
  for (const row of rows) {
    const key = row.client_id ?? "__sem_cliente__";
    const name = (row.client_id && clientNameById.get(row.client_id)) || "Sem cliente vinculado";
    const current = amountByClient.get(key);
    amountByClient.set(key, { clientId: row.client_id, clientName: name, amount: (current?.amount ?? 0) + Number(row.amount) });
  }
  return Array.from(amountByClient.values()).sort((a, b) => b.amount - a.amount);
}

/** Automação §72 regra 3 — contas a receber PENDENTES (nunca `atrasado`, que é um alerta à
 *  parte) vencendo entre hoje e hoje+`windowDays`. */
export function computeUpcomingReceivables(
  revenue: Pick<Revenue, "id" | "status" | "due_date" | "description" | "amount">[],
  today: string,
  windowDays: number,
): UpcomingReceivablesSummary {
  const windowEnd = addDaysISO(today, windowDays);
  const entries = revenue.filter((row) => row.status === "pendente" && row.due_date >= today && row.due_date <= windowEnd);
  return {
    total: sumAmount(entries),
    windowDays,
    entries: entries.map((row) => ({ id: row.id, description: row.description, amount: Number(row.amount), dueDate: row.due_date })),
  };
}
