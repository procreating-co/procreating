import { elenitaProposal } from "@/content/clients/elenita/proposal";
import type { ProposalContent } from "@/lib/clients/proposal-types";

export type { ProposalContent } from "@/lib/clients/proposal-types";

/**
 * Switchboard da Proposta de Continuidade — mesmo padrão de `presentation-registry.ts`/
 * `workspace-registry.ts`. Hoje só a Elenita tem proposta; um cliente novo ganha sua própria
 * entrada aqui, sem tocar em nenhuma rota.
 */
const PROPOSAL_REGISTRY: Record<string, ProposalContent> = {
  elenita: elenitaProposal,
};

export function getClientProposal(slug: string): ProposalContent | null {
  return PROPOSAL_REGISTRY[slug] ?? null;
}
