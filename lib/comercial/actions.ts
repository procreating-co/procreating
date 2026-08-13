"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/supabase/current-user";
import { getInitialStage, getLeadEvents, listPipelineStages } from "@/lib/comercial/queries";
import type { LeadInput, LeadPatch, StrategyInput } from "@/lib/comercial/types";
import type { Event } from "@/lib/supabase/types/database";

export type ActionResult = { ok: true } | { ok: false; error: string };

/** Único jeito de um Client Component ler `events` de um lead — `lib/comercial/queries.ts` é
 *  `server-only`, só chamável de Server Component; este é o wrapper `"use server"` pra abrir o
 *  histórico dentro do dialog de detalhe (`components/comercial/lead-detail-dialog.tsx`). */
export async function getLeadEventsAction(leadId: string): Promise<Event[]> {
  return getLeadEvents(leadId);
}

export async function createStrategyAction(input: StrategyInput): Promise<ActionResult> {
  if (!input.name.trim()) return { ok: false, error: "Informe o nome da estratégia." };

  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "Sessão expirada — faça login de novo." };

  const supabase = await createClient();
  const { error } = await supabase.from("strategies").insert({
    name: input.name,
    target_audience: input.targetAudience || null,
    segment: input.segment || null,
    location: input.location || null,
    icp: input.icp || null,
    qualification_criteria: input.qualificationCriteria || null,
    offer: input.offer || null,
    sales_pitch: input.salesPitch || null,
    prospecting_channel: input.prospectingChannel || null,
    prospecting_goal: input.prospectingGoal,
    meetings_goal: input.meetingsGoal,
    closing_goal: input.closingGoal,
    revenue_goal: input.revenueGoal,
    created_by: userId,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/comercial/estrategias");
  return { ok: true };
}

export async function updateStrategyAction(id: string, input: StrategyInput): Promise<ActionResult> {
  if (!input.name.trim()) return { ok: false, error: "Informe o nome da estratégia." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("strategies")
    .update({
      name: input.name,
      target_audience: input.targetAudience || null,
      segment: input.segment || null,
      location: input.location || null,
      icp: input.icp || null,
      qualification_criteria: input.qualificationCriteria || null,
      offer: input.offer || null,
      sales_pitch: input.salesPitch || null,
      prospecting_channel: input.prospectingChannel || null,
      prospecting_goal: input.prospectingGoal,
      meetings_goal: input.meetingsGoal,
      closing_goal: input.closingGoal,
      revenue_goal: input.revenueGoal,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/comercial/estrategias");
  revalidatePath(`/comercial/estrategias/${id}`);
  return { ok: true };
}

export async function createLeadAction(input: LeadInput): Promise<ActionResult> {
  if (!input.companyName.trim()) return { ok: false, error: "Informe o nome da empresa." };

  const initialStage = await getInitialStage();
  if (!initialStage) return { ok: false, error: "Nenhum estágio inicial configurado em pipeline_stages." };

  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "Sessão expirada — faça login de novo." };

  const supabase = await createClient();
  const { error } = await supabase.from("leads").insert({
    company_name: input.companyName,
    contact_name: input.contactName || null,
    role_title: input.roleTitle || null,
    whatsapp: input.whatsapp || null,
    email: input.email || null,
    source: input.source || null,
    strategy_id: input.strategyId,
    potential_value: input.potentialValue,
    notes: input.notes || null,
    owner_id: userId,
    stage_id: initialStage.id,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/comercial/leads");
  revalidatePath("/comercial/pipeline");
  return { ok: true };
}

export async function updateLeadAction(id: string, patch: LeadPatch): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({
      contact_name: patch.contactName,
      role_title: patch.roleTitle,
      whatsapp: patch.whatsapp,
      email: patch.email,
      potential_value: patch.potentialValue,
      owner_id: patch.ownerId,
      next_contact_at: patch.nextContactAt,
      notes: patch.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/comercial/leads");
  revalidatePath(`/comercial/leads/${id}`);
  revalidatePath("/comercial/pipeline");
  return { ok: true };
}

/**
 * Move um lead pro estágio `toStageId` e registra o evento `stage_changed` (`entity_type:
 * "lead"`) que `lib/comercial/funnel.ts` usa pra reconstruir o funil histórico. Nunca chamado
 * pro estágio `is_won` — essa transição só acontece via `close_lead_and_create_client` (RPC),
 * disparado pelo modal de onboarding (`lib/onboarding/actions.ts`), porque fechar negócio precisa
 * dos dados do cliente, não só mover um cartão.
 */
export async function moveLeadStageAction(leadId: string, toStageId: string): Promise<ActionResult> {
  const stages = await listPipelineStages();
  const toStage = stages.find((stage) => stage.id === toStageId);
  if (!toStage) return { ok: false, error: "Estágio não encontrado." };
  if (toStage.is_won) {
    return { ok: false, error: "Fechar negócio abre o modal de onboarding — não move o card direto." };
  }

  const supabase = await createClient();
  const { data: lead } = await supabase.from("leads").select("*").eq("id", leadId).maybeSingle();
  if (!lead) return { ok: false, error: "Lead não encontrado." };

  const fromStage = stages.find((stage) => stage.id === lead.stage_id);
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from("leads")
    .update({ stage_id: toStageId, updated_at: new Date().toISOString() })
    .eq("id", leadId);
  if (error) return { ok: false, error: error.message };

  await supabase.from("events").insert({
    entity_type: "lead",
    entity_id: leadId,
    actor_id: userId,
    type: "stage_changed",
    metadata: { from: fromStage?.key ?? null, to: toStage.key },
  });

  revalidatePath("/comercial/pipeline");
  revalidatePath("/comercial/leads");
  return { ok: true };
}

export async function logLeadActivityAction(leadId: string, message: string): Promise<ActionResult> {
  if (!message.trim()) return { ok: false, error: "Escreva algo antes de salvar." };

  const userId = await getCurrentUserId();
  const supabase = await createClient();
  const { error } = await supabase.from("events").insert({
    entity_type: "lead",
    entity_id: leadId,
    actor_id: userId,
    type: "note_added",
    metadata: { message },
  });
  if (error) return { ok: false, error: error.message };

  await supabase.from("leads").update({ last_contact_at: new Date().toISOString() }).eq("id", leadId);

  revalidatePath(`/comercial/leads/${leadId}`);
  return { ok: true };
}
