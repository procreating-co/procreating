import "server-only";
import { createClient } from "@/lib/supabase/server";
import { listRevenue } from "@/lib/financeiro/queries";
import { computeMrr, contractCoversMonth, sumAmountForMonth } from "@/lib/financeiro/calculations";
import { computeDistribution } from "@/lib/financeiro/rules";
import { compareMonthKeys, currentMonthKey, formatDateOnly, monthKeyBounds, monthKeyOf } from "@/lib/date";
import type { Contract } from "@/lib/supabase/types/database";
import type { DetailEntry } from "@/lib/dashboard/executive-metrics";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export type DashboardMonthKpis = {
  monthKey: string;
  /** `true` quando `monthKey` está depois do mês corrente real (`currentMonthKey()`) — nunca
   *  decidido no cliente, sempre no servidor, ancorado em `todayISO()` (Brasília). */
  isFuture: boolean;
  revenue: { value: number };
  recurringRevenue: { value: number };
  partnerSalary: { value: number };
  operationalCash: { value: number; percentage: number };
  details: {
    revenueEntries: DetailEntry[];
    recurringEntries: DetailEntry[];
  };
};

type RecurringContractRow = Pick<Contract, "client_id" | "start_date" | "end_date" | "monthly_value">;

/**
 * KPIs financeiros do Dashboard (Receita Mensal/Recorrente/Pró-labore/Caixa Operacional) pra um
 * mês ARBITRÁRIO — base da navegação ◀▶ pedida explicitamente. Mesmo princípio já seguido em
 * `executive-metrics.ts`: nunca uma segunda conta em paralelo pro mesmo número — reaproveita
 * `listRevenue`/`sumAmountForMonth`/`computeMrr`/`computeDistribution`, as MESMAS fontes que
 * Financeiro e o mês corrente do Dashboard já usam.
 *
 * Mês futuro (`isFuture`) — pedido explícito: "valores recorrentes sem os valores que ainda não
 * foram fechados". "Receita Mensal" passa a ser só a Receita Recorrente projetada (soma de
 * `monthly_value` dos contratos `recorrente_ativo` cuja vigência cobre aquele mês) — NUNCA a
 * tabela `revenue`: `sync_contract_revenue` só pré-gera linhas até `end_date` quando o contrato
 * tem uma; um contrato recorrente em aberto (`end_date` nulo, o caso mais comum) só tem UMA linha
 * de `revenue` (o mês de início) — usar `revenue` pra meses futuros subestimaria a receita
 * recorrente real (confirmado em produção: setembro/2026 tinha só 2 de N contratos recorrentes
 * com linha gerada). Isso também exclui, por construção, qualquer receita pontual ainda não
 * faturada e qualquer negócio em negociação (nunca fechado) — exatamente o pedido.
 *
 * Mês presente/passado — número real e auditável: `revenue.due_date` no mês, excluindo
 * `cancelado`, idêntico ao que alimenta "Receita Mensal" em Financeiro e "Evolução"
 * (`monthlyEvolution`) pro mesmo mês.
 */
export async function computeDashboardMonthKpis(monthKey: string): Promise<DashboardMonthKpis> {
  const supabase = await createClient();
  const isFuture = compareMonthKeys(monthKey, currentMonthKey()) > 0;
  const { start: monthStart, end: monthEnd } = monthKeyBounds(monthKey);

  const [{ data: recurringContractsRaw }, { data: clients }] = await Promise.all([
    supabase.from("contracts").select("client_id, start_date, end_date, monthly_value").eq("category", "recorrente_ativo"),
    supabase.from("clients").select("id, name"),
  ]);
  const clientNameById = new Map((clients ?? []).map((client) => [client.id, client.name]));
  const recurringContracts: RecurringContractRow[] = recurringContractsRaw ?? [];
  const covering = recurringContracts.filter((contract) => contractCoversMonth(contract, monthStart, monthEnd));
  const recurringRevenue = computeMrr(covering);

  const recurringEntries: DetailEntry[] = [...covering]
    .sort((a, b) => Number(b.monthly_value ?? 0) - Number(a.monthly_value ?? 0))
    .map((contract) => ({ label: clientNameById.get(contract.client_id) ?? "Cliente removido", value: `${currency.format(Number(contract.monthly_value ?? 0))}/mês` }));

  let revenueTotal: number;
  let revenueEntries: DetailEntry[];
  if (isFuture) {
    revenueTotal = recurringRevenue;
    revenueEntries = recurringEntries;
  } else {
    const revenueRows = await listRevenue();
    const revenue = revenueRows.filter((row) => row.status !== "cancelado");
    revenueTotal = sumAmountForMonth(revenue, monthKey);
    revenueEntries = revenue
      .filter((row) => monthKeyOf(row.due_date) === monthKey)
      .sort((a, b) => Number(b.amount) - Number(a.amount))
      .map((row) => ({
        label: (row.client_id && clientNameById.get(row.client_id)) || row.description || "Receita",
        value: currency.format(Number(row.amount)),
        meta: row.description ? `${row.description} · ${formatDateOnly(row.due_date)}` : formatDateOnly(row.due_date),
      }));
  }

  const distribution = await computeDistribution(revenueTotal);

  return {
    monthKey,
    isFuture,
    revenue: { value: revenueTotal },
    recurringRevenue: { value: recurringRevenue },
    partnerSalary: { value: distribution.distributable / 2 },
    operationalCash: { value: distribution.operationalAmount, percentage: distribution.operationalPercentage },
    details: { revenueEntries, recurringEntries },
  };
}
