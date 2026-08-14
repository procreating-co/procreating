import type { Scenario, SimulationInput, SimulationResult } from "@/lib/simulation/types";

/** Arredonda pra cima — "preciso de 7,2 clientes" não existe, precisa de 8. */
function ceil(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.ceil(value)) : 0;
}

/**
 * Entrada → Regras de negócio → Cálculo → Resultado. Função pura: mesma entrada, mesma saída,
 * sem depender de nada externo — é o que permite Marketing e Financeiro chamarem o mesmo motor
 * sem duplicar a conta.
 */
export function runSimulation(input: SimulationInput): SimulationResult {
  const clientsNeeded = input.averageTicket > 0 ? ceil(input.revenueGoal / input.averageTicket) : 0;
  const proposalsNeeded = input.proposalToSaleRate > 0 ? ceil(clientsNeeded / input.proposalToSaleRate) : 0;
  const leadsNeeded = input.leadToProposalRate > 0 ? ceil(proposalsNeeded / input.leadToProposalRate) : 0;
  return { clientsNeeded, proposalsNeeded, leadsNeeded };
}

/**
 * Três cenários lado a lado, variando a taxa de conversão (não a meta — critério mais simples e
 * defensável: a meta é a mesma pergunta em todo cenário, "quanto preciso de lead pra bater ISTO
 * aqui", só muda o quão otimista é a conversão esperada). Conservador = 30% pior que a taxa
 * informada; agressivo = 30% melhor; base = a taxa como veio.
 */
export function buildScenarios(base: SimulationInput): Scenario[] {
  const adjust = (rate: number, factor: number) => Math.min(1, Math.max(0, rate * factor));

  const variants: { label: Scenario["label"]; factor: number }[] = [
    { label: "conservador", factor: 0.7 },
    { label: "base", factor: 1 },
    { label: "agressivo", factor: 1.3 },
  ];

  return variants.map(({ label, factor }) => {
    const input: SimulationInput = {
      ...base,
      leadToProposalRate: adjust(base.leadToProposalRate, factor),
      proposalToSaleRate: adjust(base.proposalToSaleRate, factor),
    };
    return { label, input, result: runSimulation(input) };
  });
}
