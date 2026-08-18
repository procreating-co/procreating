/** Mesmo formato de `DetailEntry` (`lib/dashboard/executive-metrics.ts`) — duplicado aqui de
 *  propósito em vez de importado: `lib/financeiro` não deveria depender de `lib/dashboard`
 *  (direção errada de dependência). Estruturalmente idêntico, então `DetailList`
 *  (`components/dashboard/detail-list.tsx`) aceita normalmente por tipagem estrutural. */
export type FinancialDetailEntry = { label: string; value?: string; meta?: string };

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
  /** Lista real por trás de cada bloco da Visão Geral (pedido explícito: "todos os blocos devem
   *  ser clicáveis pra ver mais informações das entradas") — mesmo padrão já usado no Dashboard
   *  (`CardWithDetail`/`DetailList`), nenhum número novo calculado, só a decomposição do que já
   *  soma pro total do bloco. */
  mrrEntries: FinancialDetailEntry[];
  revenueThisMonthEntries: FinancialDetailEntry[];
  expensesThisMonthEntries: FinancialDetailEntry[];
  receivablesPendingEntries: FinancialDetailEntry[];
  receivablesOverdueEntries: FinancialDetailEntry[];
  payablesEntries: FinancialDetailEntry[];
  /** Só a fatia atrasada de `payablesEntries` — alimenta a Faixa de atenção. */
  payablesOverdueEntries: FinancialDetailEntry[];
  /** "A receber (até <ano>)" — pedido explícito: projeção mais longa, só clientes com contrato
   *  recorrente ativo, até dezembro do ano corrente + 1 (ver `queries.ts` pra não cravar "2027"
   *  como literal). */
  receivablesRecurringYear: number;
  receivablesRecurringThroughNextYear: number;
  receivablesRecurringEntries: FinancialDetailEntry[];
  /** Fluxo de caixa projetado — receita pendente menos despesa pendente vencendo dentro de cada
   *  janela cumulativa (0-30/0-60/0-90 dias a partir de hoje). Pode ser negativo. */
  projectedCashFlow30: number;
  projectedCashFlow60: number;
  projectedCashFlow90: number;
  projectedCashFlow30Entries: FinancialDetailEntry[];
  projectedCashFlow60Entries: FinancialDetailEntry[];
  projectedCashFlow90Entries: FinancialDetailEntry[];
  /** Bloco 4 item 1 — contrato recorrente vencendo sem renovação automática, dentro da janela de
   *  alerta (`CONTRACT_RENEWAL_ALERT_DAYS`, lib/financeiro/queries.ts). Alimenta a Faixa de
   *  atenção. */
  contractsExpiringEntries: FinancialDetailEntry[];
};
