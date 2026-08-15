"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/supabase/current-user";
import { getInitialStage, getLeadEvents, getWonStage, listPipelineStages, listStrategies } from "@/lib/comercial/queries";
import { normalizeCompanyName, normalizeEmail, normalizePhone, type ParsedLeadRow } from "@/lib/comercial/csv";
import { computeSuggestedAction, listSequenceSteps, loadSequenceProgress } from "@/lib/comercial/sequences";
import { nowISO } from "@/lib/date";
import type { DedupCheckResult, ImportListInput, LeadInput, LeadPatch, LeadWithRelations, StrategyInput } from "@/lib/comercial/types";
import type { Event, SequenceChannel, Strategy } from "@/lib/supabase/types/database";

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

/** Wrapper `"use server"` de `listStrategies` (query `server-only`) — o menu de criação rápida
 *  (`quick-add-menu.tsx`) é client component e precisa da lista pra oferecer "estratégia de
 *  origem" no formulário de lead, sem duplicar a query. */
export async function listStrategiesAction(): Promise<Strategy[]> {
  return listStrategies();
}

/**
 * Venda direta ("vendo sem ter lead") — cria o lead JÁ no estágio `is_won`, pulando o funil, e
 * devolve com `stage`/`strategy`/`list` resolvidos pra abrir o `OnboardingModal` (o mesmo modal
 * que soltar um card em "Fechado" no Kanban já abre) direto em cima dele. Reaproveita 100% do
 * onboarding existente (Cliente → Contrato pontual/recorrente → Escopo → Operação) em vez de um
 * formulário de venda paralelo — a única coisa nova aqui é o atalho pra chegar num lead "ganho"
 * sem passar pelas etapas do Pipeline.
 */
export async function createWonLeadForSaleAction(companyName: string, potentialValue: number | null): Promise<ActionResult & { lead?: LeadWithRelations }> {
  if (!companyName.trim()) return { ok: false, error: "Informe o nome do cliente/empresa." };

  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "Sessão expirada — faça login de novo." };

  const wonStage = await getWonStage();
  if (!wonStage) return { ok: false, error: "Nenhum estágio marcado como 'ganho' em pipeline_stages." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .insert({
      company_name: companyName,
      source: "Venda direta",
      potential_value: potentialValue,
      owner_id: userId,
      stage_id: wonStage.id,
    })
    .select("*")
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? "Falha ao criar." };

  await supabase.from("events").insert({ entity_type: "lead", entity_id: data.id, actor_id: userId, type: "lead_created", metadata: { source: "Venda direta" } });

  revalidatePath("/comercial");
  return { ok: true, lead: { ...data, stage: wonStage, strategy: null, list: null } };
}

export async function createLeadAction(input: LeadInput): Promise<ActionResult> {
  if (!input.companyName.trim()) return { ok: false, error: "Informe o nome da empresa." };

  const initialStage = await getInitialStage();
  if (!initialStage) return { ok: false, error: "Nenhum estágio inicial configurado em pipeline_stages." };

  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "Sessão expirada — faça login de novo." };

  const supabase = await createClient();
  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
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
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  await supabase.from("events").insert({ entity_type: "lead", entity_id: lead.id, actor_id: userId, type: "lead_created", metadata: { source: input.source || null } });

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
      cnpj_cpf: patch.cnpjCpf,
      city: patch.city,
      state: patch.state,
      updated_at: nowISO(),
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

/**
 * `isPositiveResponse` — Automação §72, regra 1: "lead respondeu → mover pra 'Respondeu'
 * sozinho". Trigger é este mesmo registro de contato (checkbox no drawer, não classificação por
 * IA); condição é o lead ainda não ter passado desse estágio; ação é `moveLeadStageAction` — a
 * MESMA função que o drag-and-drop do Kanban já chama, nunca uma segunda lógica de troca de
 * estágio. Nenhuma automação futura deve reimplementar "mover estágio" — sempre compor em cima
 * desta função.
 */
export async function logLeadActivityAction(leadId: string, message: string, isPositiveResponse = false): Promise<ActionResult> {
  if (!message.trim()) return { ok: false, error: "Escreva algo antes de salvar." };

  const userId = await getCurrentUserId();
  const supabase = await createClient();
  const { error } = await supabase.from("events").insert({
    entity_type: "lead",
    entity_id: leadId,
    actor_id: userId,
    type: "note_added",
    metadata: { message, positive_response: isPositiveResponse },
  });
  if (error) return { ok: false, error: error.message };

  // `contact_attempts` incrementa sozinho aqui — nunca é um campo pra digitar na mão, é uma
  // contagem do que já aconteceu (mesmo espírito de "dado derivado, não recadastrado").
  const { data: current } = await supabase.from("leads").select("contact_attempts, stage_id").eq("id", leadId).maybeSingle();
  await supabase
    .from("leads")
    .update({ last_contact_at: nowISO(), contact_attempts: (current?.contact_attempts ?? 0) + 1 })
    .eq("id", leadId);

  if (isPositiveResponse && current?.stage_id) {
    const stages = await listPipelineStages();
    const respondeuStage = stages.find((stage) => stage.key === "respondeu");
    const currentStage = stages.find((stage) => stage.id === current.stage_id);
    if (respondeuStage && currentStage && currentStage.sort_order < respondeuStage.sort_order) {
      await moveLeadStageAction(leadId, respondeuStage.id);
    }
  }

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

  const { data: insertedLeads, error: leadsError } = await supabase
    .from("leads")
    .insert(
      input.rows.map((row) => ({
        company_name: row.companyName,
        contact_name: row.contactName || null,
        role_title: row.roleTitle || null,
        whatsapp: row.whatsapp || null,
        email: row.email || null,
        potential_value: row.potentialValue,
        cnpj_cpf: row.cnpjCpf || null,
        city: row.city || null,
        state: row.state || null,
        source: input.listName,
        strategy_id: input.strategyId,
        list_id: list.id,
        owner_id: userId,
        stage_id: initialStage.id,
      }))
    )
    .select("id");
  if (leadsError) return { ok: false, error: leadsError.message };

  if (insertedLeads && insertedLeads.length > 0) {
    await supabase.from("events").insert(
      insertedLeads.map((lead) => ({ entity_type: "lead" as const, entity_id: lead.id, actor_id: userId, type: "lead_created", metadata: { source: input.listName, list_id: list.id } }))
    );
  }

  revalidatePath("/comercial");
  return { ok: true, listId: list.id };
}

export async function createSequenceStepAction(input: { strategyId: string; dayOffset: number; channel: SequenceChannel; script: string }): Promise<ActionResult> {
  if (!input.script.trim()) return { ok: false, error: "Escreva o script da mensagem." };

  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "Sessão expirada — faça login de novo." };

  const supabase = await createClient();
  const { data: existing } = await supabase.from("sequence_steps").select("sort_order").eq("strategy_id", input.strategyId).order("sort_order", { ascending: false }).limit(1);
  const nextSort = (existing?.[0]?.sort_order ?? -1) + 1;

  const { error } = await supabase.from("sequence_steps").insert({
    strategy_id: input.strategyId,
    day_offset: input.dayOffset,
    channel: input.channel,
    script: input.script,
    sort_order: nextSort,
    created_by: userId,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/comercial/estrategias/${input.strategyId}`);
  revalidatePath("/comercial");
  return { ok: true };
}

export async function deleteSequenceStepAction(id: string, strategyId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("sequence_steps").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/comercial/estrategias/${strategyId}`);
  revalidatePath("/comercial");
  return { ok: true };
}

/**
 * "Marcar como contatado" da fila de execução — grava o evento que avança o progresso da
 * cadência (`sequence_step_completed`, lido de volta por `computeSuggestedAction`) e recalcula
 * `leads.next_contact_at` com a data do PRÓXIMO passo, mantendo em sincronia o mesmo campo que o
 * card do Kanban já lê pro badge "Atrasado"/"Hoje" — sem duplicar essa lógica em dois lugares.
 * Sequência esgotada (sem próximo passo) → `next_contact_at` fica `null`, decisão manual dali
 * pra frente, nunca inventa uma data.
 */
export async function markLeadContactedAction(leadId: string): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "Sessão expirada — faça login de novo." };

  const supabase = await createClient();
  const { data: lead } = await supabase.from("leads").select("*").eq("id", leadId).maybeSingle();
  if (!lead) return { ok: false, error: "Lead não encontrado." };

  const timestamp = nowISO();
  const { error: eventError } = await supabase.from("events").insert({
    entity_type: "lead",
    entity_id: leadId,
    actor_id: userId,
    type: "sequence_step_completed",
    metadata: {},
  });
  if (eventError) return { ok: false, error: eventError.message };

  let nextContactAt: string | null = null;
  if (lead.strategy_id) {
    const [steps, progress] = await Promise.all([listSequenceSteps(lead.strategy_id), loadSequenceProgress([leadId])]);
    const current = progress.get(leadId) ?? { completedCount: 0, firstContactISO: null };
    // O evento acabado de gravar ainda não está nesse `progress` (foi lido antes do insert acima
    // confirmar) — soma manualmente pra já sugerir o passo seguinte, não repetir o mesmo.
    const updated = { completedCount: current.completedCount + 1, firstContactISO: current.firstContactISO ?? timestamp };
    const suggestion = computeSuggestedAction({ created_at: lead.created_at }, steps, updated);
    nextContactAt = suggestion ? `${suggestion.dueDateISO}T00:00:00.000Z` : null;
  }

  const { error: updateError } = await supabase.from("leads").update({ last_contact_at: timestamp, next_contact_at: nextContactAt }).eq("id", leadId);
  if (updateError) return { ok: false, error: updateError.message };

  revalidatePath("/comercial");
  return { ok: true };
}

/** Exclusão de lead — só o próprio lead + a trilha de eventos dele (nunca um cliente: um lead
 *  convertido tem `client_id` preenchido e não deveria ser excluído por aqui, a UI não oferece
 *  esse botão pra leads já fechados). */
export async function deleteLeadAction(leadId: string): Promise<ActionResult> {
  const supabase = await createClient();
  await supabase.from("events").delete().eq("entity_type", "lead").eq("entity_id", leadId);
  const { error } = await supabase.from("leads").delete().eq("id", leadId).is("client_id", null);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/comercial");
  return { ok: true };
}
