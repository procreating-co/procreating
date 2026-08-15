import "server-only";
import { createClient } from "@/lib/supabase/server";
import { listLeadsByStrategy, listPipelineStages } from "@/lib/comercial/queries";
import type { FunnelStep, StrategyFunnel } from "@/lib/comercial/types";
import type { PeriodRange } from "@/lib/comercial/period";

/**
 * Funil de uma estratégia, calculado em runtime — não existe tabela `strategy_funnel_events`
 * (decisão registrada na migration `20260813010000_comercial_financeiro_onboarding.sql` e na
 * Auditoria/plano da Fase 2-5: volume baixo, não justifica pré-computar).
 *
 * Um lead "passou" por um estágio se: (a) é o estágio ATUAL dele, ou (b) existe um evento
 * `stage_changed` (`public.events`, `entity_type: "lead"`) com `metadata.to` igual à `key`
 * daquele estágio. Todo lead nasce no estágio inicial (`createLeadAction`,
 * `lib/comercial/actions.ts`), então esse estágio conta 100% dos leads da estratégia por
 * definição — não precisa de evento pra isso.
 */
export async function computeStrategyFunnel(strategyId: string): Promise<StrategyFunnel> {
  const [stages, leads] = await Promise.all([listPipelineStages(), listLeadsByStrategy(strategyId)]);
  const leadIds = leads.map((lead) => lead.id);

  const supabase = await createClient();
  const stageChangedEvents =
    leadIds.length === 0
      ? []
      : (
          await supabase
            .from("events")
            .select("*")
            .eq("entity_type", "lead")
            .eq("type", "stage_changed")
            .in("entity_id", leadIds)
        ).data ?? [];

  const initialStage = stages.find((stage) => !stage.is_won && !stage.is_lost);

  // Para cada lead, o conjunto de chaves de estágio que ele já ocupou (atual + histórico).
  const occupiedByLead = new Map<string, Set<string>>();
  for (const lead of leads) {
    const occupied = new Set<string>();
    if (initialStage) occupied.add(initialStage.key);
    occupied.add(lead.stage.key); // estágio atual sempre conta
    occupiedByLead.set(lead.id, occupied);
  }
  for (const event of stageChangedEvents) {
    const toKey = (event.metadata as { to?: string } | null)?.to;
    if (!toKey || !event.entity_id) continue;
    occupiedByLead.get(event.entity_id)?.add(toKey);
  }

  let previousCount: number | null = null;
  const steps = stages
    .filter((stage) => !stage.is_lost) // "Perdido" não é um passo do funil de progresso, é uma saída
    .map((stage) => {
      const count = leads.filter((lead) => occupiedByLead.get(lead.id)?.has(stage.key)).length;
      const conversionFromPrevious = previousCount && previousCount > 0 ? count / previousCount : null;
      previousCount = count;
      return { stage, count, conversionFromPrevious };
    });

  const wonLeads = leads.filter((lead) => lead.client_id !== null).length;

  // Receita total CONTRATADA (soma de `revenue`, independente de já ter sido paga) dos clientes
  // que vieram desta estratégia — `clients.strategy_id` é setado por `close_lead_and_create_client`.
  const { data: clients } = await supabase.from("clients").select("*").eq("strategy_id", strategyId);
  const clientIds = (clients ?? []).map((client) => client.id);
  let totalRevenue = 0;
  if (clientIds.length > 0) {
    const { data: revenueRows } = await supabase.from("revenue").select("*").in("client_id", clientIds);
    totalRevenue = (revenueRows ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
  }
  const averageTicket = wonLeads > 0 ? totalRevenue / wonLeads : null;

  return { steps, totalLeads: leads.length, wonLeads, totalRevenue, averageTicket };
}

export type OverallFunnel = { steps: FunnelStep[]; totalLeads: number; wonLeads: number };

/**
 * Master prompt §65 — "Contact → Reply, Reply → Meeting, Meeting → Proposal, Proposal → Won"
 * como taxa de conversão real por estágio, não só um número solto ("lead → fechado"). Mesmo
 * funil de `computeStrategyFunnel` acima, só que GLOBAL (todos os leads) e por PERÍODO de
 * criação (`leads.created_at` dentro do range), em vez de por estratégia. Duplica parte da
 * lógica de propósito — extrair um helper comum arriscaria mexer numa função já em produção só
 * pra economizar ~15 linhas, não vale o risco agora.
 */
export async function computeOverallFunnel(period: PeriodRange): Promise<OverallFunnel> {
  const supabase = await createClient();
  const stages = await listPipelineStages();
  const { data: leadsRaw } = await supabase.from("leads").select("*").gte("created_at", period.fromISO).lt("created_at", period.toISO);
  const leads = leadsRaw ?? [];
  const leadIds = leads.map((lead) => lead.id);

  const stageChangedEvents =
    leadIds.length === 0
      ? []
      : (await supabase.from("events").select("*").eq("entity_type", "lead").eq("type", "stage_changed").in("entity_id", leadIds)).data ?? [];

  const initialStage = stages.find((stage) => !stage.is_won && !stage.is_lost);
  const stageById = new Map(stages.map((stage) => [stage.id, stage]));

  const occupiedByLead = new Map<string, Set<string>>();
  for (const lead of leads) {
    const occupied = new Set<string>();
    if (initialStage) occupied.add(initialStage.key);
    const currentStage = stageById.get(lead.stage_id);
    if (currentStage) occupied.add(currentStage.key);
    occupiedByLead.set(lead.id, occupied);
  }
  for (const event of stageChangedEvents) {
    const toKey = (event.metadata as { to?: string } | null)?.to;
    if (!toKey || !event.entity_id) continue;
    occupiedByLead.get(event.entity_id)?.add(toKey);
  }

  let previousCount: number | null = null;
  const steps: FunnelStep[] = stages
    .filter((stage) => !stage.is_lost) // "Perdido" não é um passo de progresso, é uma saída
    .map((stage) => {
      const count = leads.filter((lead) => occupiedByLead.get(lead.id)?.has(stage.key)).length;
      const conversionFromPrevious = previousCount && previousCount > 0 ? count / previousCount : null;
      previousCount = count;
      return { stage, count, conversionFromPrevious };
    });

  const wonLeads = leads.filter((lead) => lead.client_id !== null).length;
  return { steps, totalLeads: leads.length, wonLeads };
}
