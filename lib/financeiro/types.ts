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

export type MonthlyEvolutionPoint = {
  month: string; // "MM/YYYY"
  revenue: number;
  expenses: number;
};

export type PipelineOpportunity = {
  label: string;
  /** Valor mensal potencial se a negociação fechar — nunca contado em `mrr`. */
  potentialMonthlyValue: number;
};

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
};
