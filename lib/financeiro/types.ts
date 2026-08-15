export type ExpenseInput = {
  category: string;
  description: string;
  amount: number;
  dueDate: string;
};

export type CostInput = {
  name: string;
  amount: number;
  category: string;
  recurrence: "fixo" | "variavel";
};

export type MonthlyRevenueByClient = { clientId: string | null; clientName: string; amount: number };

export type MonthlyEvolutionPoint = {
  month: string; // "MM/YYYY"
  revenue: number;
  expenses: number;
  /** De qual cliente veio a receita do mês — o tooltip do gráfico (`RevenueChart`) mostra isso
   *  em vez de só o total, ordenado do maior pro menor. */
  revenueByClient: MonthlyRevenueByClient[];
};

export type PipelineOpportunity = {
  label: string;
  /** Valor mensal potencial se a negociação fechar — nunca contado em `mrr`. */
  potentialMonthlyValue: number;
};

export type UpcomingReceivable = { id: string; description: string; amount: number; dueDate: string };

/** Automação §72 regra 3 — "conta a receber vencendo em N dias → alerta interno". `status='
 *  pendente'` (nunca `atrasado`, que já tem seu próprio alerta em `receivablesOverdue`) com
 *  `due_date` dentro da janela (`UPCOMING_RECEIVABLES_WINDOW_DAYS`, `lib/financeiro/queries.ts`).
 *  Recalculado ao vivo a cada carregamento — não um job/flag armazenado (não existe infra de cron
 *  neste projeto; um valor sempre-atual é estritamente melhor que um batch que pode ficar
 *  desatualizado por até 24h). */
export type UpcomingReceivablesSummary = { total: number; windowDays: number; entries: UpcomingReceivable[] };

export type FinanceiroMetrics = {
  mrr: number;
  revenueThisMonth: number;
  expensesThisMonth: number;
  /** Soma de `costs` (estrutura fixa/variável) — pra "variável" é uma estimativa de run-rate
   *  mensal, não um lançamento real do mês (não existe geração automática de `expenses` a partir
   *  de `costs` ainda). */
  monthlyCostsTotal: number;
  /** receita − despesas do mês − custos (run-rate). */
  margin: number;
  receivablesPending: number;
  receivablesOverdue: number;
  payablesPending: number;
  payablesOverdue: number;
  monthlyEvolution: MonthlyEvolutionPoint[];
  /** Soma de `leads.potential_value` em estágio "negociação" — MRR ADICIONAL se essas
   *  negociações fecharem. Nunca somado a `mrr`; mostrado numa seção própria, sempre rotulado
   *  como potencial, não realizado (regra explícita: negociação nunca vira receita). */
  pipelinePotentialMrr: number;
  pipelineOpportunities: PipelineOpportunity[];
  upcomingReceivables: UpcomingReceivablesSummary;
};
