/**
 * Motor de simulação central — Entrada → Regras de negócio → Cálculo → Cenário → Resultado.
 * Puro, sem I/O (ver `engine.ts`) — reaproveitável por Growth (`/comercial?tab=simuladores`) e
 * Financeiro ao mesmo tempo, nunca lógica presa num componente. `defaults.ts` (server-only) é a
 * única peça que toca banco, pra sugerir valores iniciais a partir do histórico real do CRM.
 */

export type SimulationInput = {
  /** Meta de faturamento no período simulado (R$) — o total, não o que falta. */
  revenueGoal: number;
  /** MRR já confirmado hoje (R$) — master prompt §31: "Target revenue → Required recurring
   *  revenue → Clients...". A meta já inclui receita recorrente que já está entrando; simular
   *  "preciso de X clientes" a partir da meta CHEIA (em vez da meta menos o que já é recorrente)
   *  conta receita duas vezes. `0` quando não há dado (nunca inventado — `defaults.ts` decide). */
  currentMrr: number;
  /** Ticket médio por cliente fechado (R$). */
  averageTicket: number;
  /** Taxa lead → proposta, 0–1. */
  leadToProposalRate: number;
  /** Taxa proposta → venda, 0–1. */
  proposalToSaleRate: number;
};

export type SimulationResult = {
  /** `max(0, revenueGoal - currentMrr)` — quanto de receita NOVA (ainda não fechada) falta pra
   *  bater a meta. É esse valor, não `revenueGoal` cru, que vira `clientsNeeded` abaixo. */
  requiredRecurringRevenue: number;
  clientsNeeded: number;
  proposalsNeeded: number;
  leadsNeeded: number;
};

export type ScenarioLabel = "conservador" | "base" | "agressivo";

export type Scenario = {
  label: ScenarioLabel;
  input: SimulationInput;
  result: SimulationResult;
};

/** Retorno de `computeSimulationDefaults()` — `fromRealData` marca se os números vieram de
 *  histórico de verdade ou de um chute conservador documentado (sem leads/contratos
 *  suficientes ainda) — nunca aparenta ser dado real quando não é. */
export type SimulationDefaults = {
  averageTicket: number;
  leadToProposalRate: number;
  proposalToSaleRate: number;
  fromRealData: boolean;
  /** MRR confirmado hoje (`category='recorrente_ativo'`, `lib/financeiro/queries.ts`) — sempre
   *  real, nunca `null` (0 é um valor real válido aqui, não "sem dado"). */
  currentMrr: number;
  /** Meta do mês corrente (`revenue_goals`, `lib/dashboard/goals.ts`) — `null` quando ninguém
   *  configurou uma meta ainda; o form cai pra 0 nesse caso, nunca chuta um número. */
  currentMonthGoal: number | null;
};
