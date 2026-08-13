export type ExpenseInput = {
  category: string;
  description: string;
  amount: number;
  dueDate: string;
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
  receivablesPending: number;
  receivablesOverdue: number;
  payablesPending: number;
  payablesOverdue: number;
  monthlyEvolution: MonthlyEvolutionPoint[];
};
