import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { SimulationDefaults } from "@/lib/simulation/types";

/** Chute conservador documentado — só usado quando não há histórico real suficiente (poucos
 *  leads/contratos ainda). Nunca aparenta ser dado real. */
const FALLBACK_AVERAGE_TICKET = 3000;
const FALLBACK_LEAD_TO_PROPOSAL_RATE = 0.4;
const FALLBACK_PROPOSAL_TO_SALE_RATE = 0.25;

/** Amostra mínima pra considerar a conversão real "confiável" o bastante pra sugerir como
 *  padrão — abaixo disso, um lead isolado (ex.: 1 de 1 virou proposta = "100%") distorceria mais
 *  do que ajudaria. */
const MIN_SAMPLE_SIZE = 5;

/**
 * Sugere valores iniciais pro Simulador a partir do histórico real do CRM — mesmo raciocínio de
 * `lib/comercial/funnel.ts` (estágio atual + eventos `stage_changed`), mas global (todos os
 * leads, não só de uma estratégia). `fromRealData: false` sempre que a amostra for pequena
 * demais ou não houver contrato nenhum — o Simulador mostra isso explicitamente, nunca finge
 * que veio de dado real.
 */
export async function computeSimulationDefaults(): Promise<SimulationDefaults> {
  const supabase = await createClient();

  const [{ data: contracts }, { data: leads }, { data: stages }] = await Promise.all([
    supabase.from("contracts").select("*"),
    supabase.from("leads").select("*"),
    supabase.from("pipeline_stages").select("*"),
  ]);

  // Ticket médio — valor mensal (recorrente) ou total (pontual) de cada contrato já fechado.
  const ticketValues = (contracts ?? [])
    .map((contract) => (contract.type === "recorrente" ? contract.monthly_value : contract.total_value))
    .filter((value): value is number => value != null && value > 0);
  const averageTicket = ticketValues.length > 0 ? ticketValues.reduce((sum, value) => sum + value, 0) / ticketValues.length : null;

  // Conversão — precisa saber quais leads já passaram pelo estágio "proposta enviada" (atual ou
  // histórico via events), não só onde estão agora.
  const proposalStage = (stages ?? []).find((stage) => stage.key === "proposta_enviada");
  const totalLeads = leads?.length ?? 0;

  let leadToProposalRate: number | null = null;
  let proposalToSaleRate: number | null = null;

  if (proposalStage && totalLeads >= MIN_SAMPLE_SIZE) {
    const leadIds = (leads ?? []).map((lead) => lead.id);
    const { data: stageChangedEvents } = await supabase
      .from("events")
      .select("*")
      .eq("entity_type", "lead")
      .eq("type", "stage_changed")
      .in("entity_id", leadIds);

    const reachedProposal = new Set<string>();
    for (const lead of leads ?? []) {
      if (lead.stage_id === proposalStage.id || lead.client_id) reachedProposal.add(lead.id); // "fechado" também passou por proposta na prática
    }
    for (const event of stageChangedEvents ?? []) {
      const toKey = (event.metadata as { to?: string } | null)?.to;
      if (toKey === "proposta_enviada" && event.entity_id) reachedProposal.add(event.entity_id);
    }

    const wonLeads = (leads ?? []).filter((lead) => lead.client_id !== null).length;

    if (reachedProposal.size > 0) {
      leadToProposalRate = reachedProposal.size / totalLeads;
      proposalToSaleRate = wonLeads / reachedProposal.size;
    }
  }

  const fromRealData = averageTicket != null && leadToProposalRate != null && proposalToSaleRate != null;

  return {
    averageTicket: averageTicket ?? FALLBACK_AVERAGE_TICKET,
    leadToProposalRate: leadToProposalRate ?? FALLBACK_LEAD_TO_PROPOSAL_RATE,
    proposalToSaleRate: proposalToSaleRate ?? FALLBACK_PROPOSAL_TO_SALE_RATE,
    fromRealData,
  };
}
