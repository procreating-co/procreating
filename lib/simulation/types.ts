/**
 * Motor de simulação central — Entrada → Regras de negócio → Cálculo → Cenário → Resultado.
 * Puro, sem I/O (ver `engine.ts`) — reaproveitável por Growth (`/comercial?tab=simuladores`) e
 * Financeiro ao mesmo tempo, nunca lógica presa num componente. `defaults.ts` (server-only) é a
 * única peça que toca banco, pra sugerir valores iniciais a partir do histórico real do CRM.
 */

export type SimulationInput = {
  /** Meta de faturamento no período simulado (R$). */
  revenueGoal: number;
  /** Ticket médio por cliente fechado (R$). */
  averageTicket: number;
  /** Taxa lead → proposta, 0–1. */
  leadToProposalRate: number;
  /** Taxa proposta → venda, 0–1. */
  proposalToSaleRate: number;
};

export type SimulationResult = {
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
};
