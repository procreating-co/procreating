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
};
