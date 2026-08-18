import "server-only";
import { createClient } from "@/lib/supabase/server";
import { currentMonthKey, formatDateOnly, lastMonthKeys, monthKeyOf, todayISO, todayParts } from "@/lib/date";
import { computeMargin, computeMrr, computeUpcomingReceivables, groupRevenueByClient, sumAmount, sumAmountForMonth } from "@/lib/financeiro/calculations";
import type { Cost, Expense, FinancialEntryStatus, Revenue } from "@/lib/supabase/types/database";
import type { FinanceiroMetrics, FinancialDetailEntry, MonthlyEvolutionPoint, PipelineOpportunity } from "@/lib/financeiro/types";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const STATUS_LABEL: Record<FinancialEntryStatus, string> = { pendente: "Pendente", pago: "Pago", atrasado: "Atrasado", cancelado: "Cancelado" };

/** "MM/YYYY" de `fromMonthKey` (inclusive) até dezembro de `toYear` (inclusive) — só pra
 *  projeção de recebíveis futuros; `lastMonthKeys` (lib/date.ts) é o inverso (últimos N meses
 *  terminando agora), não serve aqui. */
function monthKeysThrough(fromMonthKey: string, toYear: number, toMonth: number): string[] {
  const [fm, fy] = fromMonthKey.split("/").map(Number);
  const keys: string[] = [];
  let year = fy;
  let month = fm;
  while (year < toYear || (year === toYear && month <= toMonth)) {
    keys.push(`${String(month).padStart(2, "0")}/${year}`);
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
  }
  return keys;
}

/** Fallback só pro caso (não deveria acontecer em produção) de `financial_rules` estar vazia —
 *  mesmo valor default da coluna (`receivables_alert_days`, migration `20260818000000`). A
 *  janela em si agora é configurável em Configurações → Regras financeiras, não mais uma
 *  constante fixa aqui. */
const FALLBACK_RECEIVABLES_ALERT_DAYS = 5;

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
  const [revenueRaw, expenses, costs, { data: activeRecurringContracts }, { data: negociacaoStage }, { data: clients }, { data: financialRule }] = await Promise.all([
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
    // `receivables_alert_days` — automação §72 regra 3, configurável em Regras financeiras.
    supabase.from("financial_rules").select("receivables_alert_days").order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  const clientNameById = new Map((clients ?? []).map((client) => [client.id, client.name]));

  // Pipeline (negociação em aberto) — nunca soma no MRR nem em "a receber", é um número à parte
  // ("MRR potencial se fechar"). Só o estágio 'negociacao': é o que o funil chama de negócio já
  // em conversa de valor/fechamento, não qualquer lead aberto (proposta enviada, reunião etc.
  // ficam só no funil comercial, não neste "quase-MRR").
  const { data: negociacaoLeads } = negociacaoStage
    ? await supabase.from("leads").select("company_name, potential_value").eq("stage_id", negociacaoStage.id)
    : { data: [] };

  const mrr = computeMrr(activeRecurringContracts ?? []);

  // `cancelado` = cobrança que existiu mas nunca vai ser recebida (write-off) — não é receita do
  // mês nem da evolução histórica, mas o registro em si fica (auditoria). Excluído de toda soma
  // de "receita", nunca só de "a receber" (senão infla `revenueThisMonth`/`monthlyEvolution`).
  const revenue = revenueRaw.filter((row) => row.status !== "cancelado");

  const thisMonthKey = currentMonthKey();
  const revenueThisMonth = sumAmountForMonth(revenue, thisMonthKey);
  const expensesThisMonth = sumAmountForMonth(expenses, thisMonthKey);
  const monthlyCostsTotal = sumAmount(costs);
  const margin = computeMargin(revenueThisMonth, expensesThisMonth, monthlyCostsTotal);

  const receivablesPending = sumAmount(revenue.filter((row) => row.status === "pendente"));
  const receivablesOverdue = sumAmount(revenue.filter((row) => row.status === "atrasado"));
  const payablesPending = sumAmount(expenses.filter((row) => row.status === "pendente"));
  const payablesOverdue = sumAmount(expenses.filter((row) => row.status === "atrasado"));

  const months = lastMonthKeys(evolutionMonths);
  const monthlyEvolution: MonthlyEvolutionPoint[] = months.map((month) => {
    const monthRevenue = revenue.filter((row) => monthKeyOf(row.due_date) === month);

    // Breakdown por cliente do hover do gráfico — "de qual cliente está vindo" (pedido explícito).
    // Chave por `client_id` (não pelo nome) — é o que vira o link "quanto eu já faturei com ele"
    // pra `/clientes/[id]` (mesma página que já soma o histórico completo do cliente). Mesmo
    // cliente com mais de uma cobrança no mês (ex.: parcelas) soma numa entrada só; ordenado do
    // maior pro menor pra ler de relance quem puxou o mês.
    return {
      month,
      revenue: sumAmount(monthRevenue),
      expenses: sumAmountForMonth(expenses, month),
      revenueByClient: groupRevenueByClient(monthRevenue, clientNameById),
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
  const receivablesAlertDays = financialRule?.receivables_alert_days ?? FALLBACK_RECEIVABLES_ALERT_DAYS;
  const upcomingReceivables = computeUpcomingReceivables(revenue, today, receivablesAlertDays);

  // Decomposição de cada bloco da Visão Geral pro clique-pra-detalhe (`CardWithDetail`) — mesma
  // fonte que já alimenta o número do bloco, nenhuma soma nova. `label` prioriza o nome do
  // cliente (mais útil pra reconhecer a linha de relance); `meta` carrega o que não cabe no
  // rótulo — descrição da cobrança, status, vencimento.
  const mrrEntries: FinancialDetailEntry[] = [...(activeRecurringContracts ?? [])]
    .sort((a, b) => Number(b.monthly_value ?? 0) - Number(a.monthly_value ?? 0))
    .map((contract) => ({ label: clientNameById.get(contract.client_id) ?? "Cliente removido", value: `${currency.format(Number(contract.monthly_value ?? 0))}/mês` }));

  const revenueRowsThisMonth = revenue.filter((row) => monthKeyOf(row.due_date) === thisMonthKey);
  const revenueThisMonthEntries: FinancialDetailEntry[] = [...revenueRowsThisMonth]
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .map((row) => ({
      label: (row.client_id && clientNameById.get(row.client_id)) || "Sem cliente vinculado",
      value: currency.format(Number(row.amount)),
      meta: `${row.description} · ${STATUS_LABEL[row.status]}`,
    }));

  const expenseRowsThisMonth = expenses.filter((row) => monthKeyOf(row.due_date) === thisMonthKey);
  const expensesThisMonthEntries: FinancialDetailEntry[] = [...expenseRowsThisMonth]
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .map((row) => ({ label: row.description, value: currency.format(Number(row.amount)), meta: `${row.category} · ${STATUS_LABEL[row.status]}` }));

  const receivablesPendingEntries: FinancialDetailEntry[] = revenue
    .filter((row) => row.status === "pendente")
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
    .map((row) => ({
      label: (row.client_id && clientNameById.get(row.client_id)) || "Sem cliente vinculado",
      value: currency.format(Number(row.amount)),
      meta: `${row.description} · vence ${formatDateOnly(row.due_date)}`,
    }));

  const receivablesOverdueEntries: FinancialDetailEntry[] = revenue
    .filter((row) => row.status === "atrasado")
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
    .map((row) => ({
      label: (row.client_id && clientNameById.get(row.client_id)) || "Sem cliente vinculado",
      value: currency.format(Number(row.amount)),
      meta: `${row.description} · venceu ${formatDateOnly(row.due_date)}`,
    }));

  const payablesEntries: FinancialDetailEntry[] = expenses
    .filter((row) => row.status === "pendente" || row.status === "atrasado")
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
    .map((row) => ({
      label: row.description,
      value: currency.format(Number(row.amount)),
      meta: `${row.category} · ${row.status === "atrasado" ? "venceu" : "vence"} ${formatDateOnly(row.due_date)}`,
    }));

  // "A receber (até <ano>)" — projeção de todo cliente com contrato recorrente ativo, mês a mês,
  // até dezembro do ano corrente + 1 (não "2027" hardcoded — ver comentário mais abaixo). Bug
  // real corrigido aqui (reportado pelo usuário: "só aparece a Elenita"): a versão anterior só
  // somava linhas de `revenue` que JÁ EXISTIAM na tabela — mas clientes antigos (Kawhen, Bruna,
  // Maria Tabarez) só têm linha gerada até o mês corrente (cobrança é criada mês a mês pra eles,
  // não em lote como no onboarding da Elenita), então não tinham NENHUMA linha futura pra somar.
  // Agora projeta por contrato × mês: usa a linha real quando ela já existe (nunca conta um mês
  // já `pago`/`cancelado` como "a receber"), e projeta `monthly_value` pros meses que ainda não
  // têm cobrança gerada — cada linha do detalhe diz se é real ou projetada.
  const receivablesRecurringYear = todayParts().year + 1;
  const revenueByContractMonth = new Map<string, Revenue>();
  for (const row of revenueRaw) {
    if (!row.contract_id) continue;
    revenueByContractMonth.set(`${row.contract_id}|${monthKeyOf(row.due_date)}`, row);
  }
  const projectionMonths = monthKeysThrough(thisMonthKey, receivablesRecurringYear, 12);
  type ReceivableRecurringLine = { clientName: string; amount: number; year: number; month: number; label: string; projected: boolean };
  const receivablesRecurringLines: ReceivableRecurringLine[] = [];
  for (const contract of activeRecurringContracts ?? []) {
    const clientName = clientNameById.get(contract.client_id) ?? "Cliente removido";
    for (const monthKey of projectionMonths) {
      const [mm, yyyy] = monthKey.split("/").map(Number);
      const existing = revenueByContractMonth.get(`${contract.id}|${monthKey}`);
      if (existing) {
        if (existing.status === "pendente" || existing.status === "atrasado") {
          receivablesRecurringLines.push({ clientName, amount: Number(existing.amount), year: yyyy, month: mm, label: existing.description, projected: false });
        }
        // `pago`/`cancelado` — já resolvido, não é mais "a receber".
      } else {
        receivablesRecurringLines.push({ clientName, amount: Number(contract.monthly_value ?? 0), year: yyyy, month: mm, label: `Mensalidade ${monthKey}`, projected: true });
      }
    }
  }
  const receivablesRecurringThroughNextYear = receivablesRecurringLines.reduce((sum, line) => sum + line.amount, 0);
  const receivablesRecurringEntries: FinancialDetailEntry[] = [...receivablesRecurringLines]
    .sort((a, b) => a.year - b.year || a.month - b.month)
    .map((line) => ({
      label: line.clientName,
      value: currency.format(line.amount),
      meta: `${line.label} · ${String(line.month).padStart(2, "0")}/${line.year}${line.projected ? " · projetada" : ""}`,
    }));

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
    mrrEntries,
    revenueThisMonthEntries,
    expensesThisMonthEntries,
    receivablesPendingEntries,
    receivablesOverdueEntries,
    payablesEntries,
    receivablesRecurringYear,
    receivablesRecurringThroughNextYear,
    receivablesRecurringEntries,
  };
}
