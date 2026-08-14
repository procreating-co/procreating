"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/supabase/current-user";
import { getInitialStage, getLeadEvents, listPipelineStages } from "@/lib/comercial/queries";
import { normalizeCompanyName, normalizeEmail, normalizePhone, type ParsedLeadRow } from "@/lib/comercial/csv";
import type { DedupCheckResult, ImportListInput, LeadInput, LeadPatch, StrategyInput } from "@/lib/comercial/types";
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

  revalidatePath("/comercial");
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

  revalidatePath("/comercial");
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

  revalidatePath("/comercial");
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

  revalidatePath("/comercial");
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

  revalidatePath("/comercial");
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

  revalidatePath("/comercial");
  return { ok: true };
}

/**
 * Checagem de duplicados — roda no servidor pra nunca precisar mandar a base inteira de leads
 * pro navegador (seção 38 do prompt: performance/escala). Só busca as 3 colunas usadas pra
 * dedup dos leads ainda abertos, monta 3 sets normalizados e classifica cada linha da planilha:
 * "existente" (bate com um lead já na base), "duplicado_na_lista" (bate com outra linha ANTES
 * dela na própria planilha — a primeira ocorrência é "novo", as repetições depois são a
 * duplicata), ou "novo".
 */
export async function checkDuplicateLeadsAction(rows: ParsedLeadRow[]): Promise<DedupCheckResult> {
  const supabase = await createClient();
  const { data: existing } = await supabase.from("leads").select("company_name, whatsapp, email").is("client_id", null);

  const existingPhones = new Set((existing ?? []).map((lead) => (lead.whatsapp ? normalizePhone(lead.whatsapp) : "")).filter(Boolean));
  const existingEmails = new Set((existing ?? []).map((lead) => (lead.email ? normalizeEmail(lead.email) : "")).filter(Boolean));
  const existingNames = new Set((existing ?? []).map((lead) => normalizeCompanyName(lead.company_name)));

  const seenPhones = new Set<string>();
  const seenEmails = new Set<string>();
  const seenNames = new Set<string>();

  const result: DedupCheckResult["rows"] = rows.map((row) => {
    const phone = row.whatsapp ? normalizePhone(row.whatsapp) : "";
    const email = row.email ? normalizeEmail(row.email) : "";
    const name = normalizeCompanyName(row.companyName);

    if ((phone && existingPhones.has(phone)) || (email && existingEmails.has(email)) || existingNames.has(name)) {
      return { row, status: "existente", duplicateOf: phone && existingPhones.has(phone) ? "WhatsApp" : email && existingEmails.has(email) ? "e-mail" : "nome da empresa" };
    }
    if ((phone && seenPhones.has(phone)) || (email && seenEmails.has(email)) || seenNames.has(name)) {
      return { row, status: "duplicado_na_lista" };
    }
    if (phone) seenPhones.add(phone);
    if (email) seenEmails.add(email);
    seenNames.add(name);
    return { row, status: "novo" };
  });

  return {
    rows: result,
    newCount: result.filter((r) => r.status === "novo").length,
    existingCount: result.filter((r) => r.status === "existente").length,
    duplicateInListCount: result.filter((r) => r.status === "duplicado_na_lista").length,
  };
}

/**
 * Cria a Lista (entidade) + insere só os leads marcados como "novo" pela checagem acima — quem
 * chama já filtrou existente/duplicado_na_lista antes de mandar aqui (drawer de importação,
 * botão "Importar novos"). Todo lead nasce no estágio inicial, com `source` = nome da lista e
 * `list_id`/`strategy_id` preenchidos — a mesma trilha que `createLeadAction` usa pra um lead
 * avulso, só que em lote.
 */
export async function importListAction(input: ImportListInput): Promise<ActionResult & { listId?: string }> {
  if (!input.listName.trim()) return { ok: false, error: "Dê um nome pra lista." };
  if (input.rows.length === 0) return { ok: false, error: "Nenhum lead novo pra importar." };

  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "Sessão expirada — faça login de novo." };

  const initialStage = await getInitialStage();
  if (!initialStage) return { ok: false, error: "Nenhum estágio inicial configurado em pipeline_stages." };

  const supabase = await createClient();
  const { data: list, error: listError } = await supabase
    .from("prospecting_lists")
    .insert({
      name: input.listName,
      origin: "CSV",
      strategy_id: input.strategyId,
      lead_count: input.rows.length,
      created_by: userId,
    })
    .select("id")
    .single();
  if (listError || !list) return { ok: false, error: listError?.message ?? "Falha ao criar a lista." };

  const { error: leadsError } = await supabase.from("leads").insert(
    input.rows.map((row) => ({
      company_name: row.companyName,
      contact_name: row.contactName || null,
      role_title: row.roleTitle || null,
      whatsapp: row.whatsapp || null,
      email: row.email || null,
      potential_value: row.potentialValue,
      source: input.listName,
      strategy_id: input.strategyId,
      list_id: list.id,
      owner_id: userId,
      stage_id: initialStage.id,
    }))
  );
  if (leadsError) return { ok: false, error: leadsError.message };

  revalidatePath("/comercial");
  return { ok: true, listId: list.id };
}
