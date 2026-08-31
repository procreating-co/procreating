"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/supabase/current-user";
import { todayISO } from "@/lib/date";
import { EMPTY_CONTENT_BY_TYPE } from "@/lib/comercial/proposal-content-types";
import { listProposalTemplates, listProposalsForLead } from "@/lib/comercial/proposal-queries";
import { getLead } from "@/lib/comercial/queries";
import type { ProposalSectionType, ProposalStatus } from "@/lib/supabase/types/database";

export type ActionResult = { ok: true } | { ok: false; error: string };

/** Wrappers `"use server"` — `proposal-queries.ts` é `server-only`, só chamável de Server
 *  Component; os diálogos do lead rodam no client. Mesmo padrão de `quote-actions.ts`. */
export async function listProposalTemplatesAction() {
  return listProposalTemplates();
}

export async function listProposalsForLeadAction(leadId: string) {
  return listProposalsForLead(leadId);
}

/** Usado só por `ConvertProposalDialog` — o `OnboardingModal` já existente precisa do lead
 *  inteiro (`LeadWithRelations`), não só do id. */
export async function getLeadForProposalAction(leadId: string) {
  return getLead(leadId);
}

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/** Mesmo raciocínio de slug de `close_lead_and_create_client` (RPC, Fase 2), só que em TS —
 *  dedupe consultando a tabela em vez de `while exists` em SQL, porque esta é uma Server Action
 *  comum, não uma função de banco. Slug vem só do nome (ex.: "João da Silva" → "joao-da-silva"),
 *  sem sufixo de ano — se colidir, o dedupe abaixo acrescenta "-2", "-3"... */
export async function generateUniqueSlug(supabase: SupabaseServerClient, base: string): Promise<string> {
  const baseSlug = base
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "proposta";

  let slug = baseSlug;
  let suffix = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data } = await supabase.from("proposals").select("id").eq("slug", slug).maybeSingle();
    if (!data) return slug;
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
}

/** Cria a Proposal a partir de um Template — copia `section_blueprint` pra `proposal_sections`
 *  reais, posição incremental (mesmo espaçamento de 1000 de `lib/tasks/position.ts`). Modal
 *  enxuto (§23 do plano): só o essencial aqui, o resto é editado na página completa depois.
 *  `leadId`/`clientId` são ambos opcionais — o painel `/propostas` (staff, fora do fluxo de
 *  Lead) cria propostas avulsas, sem vínculo nenhum; nada no schema exige um FK (as duas colunas
 *  já eram nullable), só a validação aqui exigia um dos dois, e foi relaxada de propósito. */
export async function createProposalFromTemplateAction(input: {
  leadId: string | null;
  clientId: string | null;
  templateId: string;
  title: string;
  ownerName: string;
  brandName?: string;
  accentColor?: string;
}): Promise<ActionResult & { proposalId?: string }> {
  if (!input.title.trim()) return { ok: false, error: "Dê um título à proposta." };

  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "Sessão expirada — faça login de novo." };

  const supabase = await createClient();
  const { data: template } = await supabase.from("proposal_templates").select("*").eq("id", input.templateId).maybeSingle();
  if (!template) return { ok: false, error: "Template não encontrado." };

  const slug = await generateUniqueSlug(supabase, input.ownerName);

  const { data: proposal, error: proposalError } = await supabase
    .from("proposals")
    .insert({
      lead_id: input.leadId,
      client_id: input.clientId,
      template_id: input.templateId,
      slug,
      title: input.title,
      brand_name: input.brandName?.trim() || input.ownerName,
      accent_color: input.accentColor || template.accent_color,
      created_by: userId,
    })
    .select("id")
    .single();
  if (proposalError) return { ok: false, error: proposalError.message };

  let position = 1000;
  const sectionRows = template.section_blueprint.map((item) => {
    const row = { proposal_id: proposal.id, section_type: item.sectionType, content: item.content, position };
    position += 1000;
    return row;
  });
  if (sectionRows.length > 0) {
    const { error: sectionsError } = await supabase.from("proposal_sections").insert(sectionRows);
    if (sectionsError) return { ok: false, error: sectionsError.message };
  }

  await supabase.from("events").insert({ entity_type: "proposal", entity_id: proposal.id, actor_id: userId, type: "proposal.created", metadata: { template_id: input.templateId } });

  revalidatePath("/comercial");
  return { ok: true, proposalId: proposal.id };
}

export async function updateProposalTitleAction(proposalId: string, title: string): Promise<ActionResult> {
  if (!title.trim()) return { ok: false, error: "Título não pode ficar vazio." };
  const supabase = await createClient();
  const { error } = await supabase.from("proposals").update({ title, updated_at: new Date().toISOString() }).eq("id", proposalId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/comercial/propostas/${proposalId}`);
  return { ok: true };
}

/** Nome de exibição ("Dra. Elenita Luzardo") e cor de destaque da proposta — distintos do
 *  `title` administrativo. Usados por `ProposalClosing`/`ProposalScrollProgress`/etc na página
 *  pública (§9 do plano — cada proposta pode ter sua própria identidade visual). */
export async function updateProposalBrandingAction(proposalId: string, brandName: string, accentColor: string): Promise<ActionResult> {
  if (!brandName.trim()) return { ok: false, error: "Nome da marca não pode ficar vazio." };
  const supabase = await createClient();
  const { error } = await supabase.from("proposals").update({ brand_name: brandName, accent_color: accentColor, updated_at: new Date().toISOString() }).eq("id", proposalId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/comercial/propostas/${proposalId}`);
  return { ok: true };
}

/** Mudança manual de status (negociando/arquivada/cancelada) — nunca aceita `accepted`/`rejected`
 *  aqui (só via `respond_public_proposal`, que já cuida de travar a versão) nem `sent` (só via
 *  `sendProposalAction`, que cria a versão). */
export async function updateProposalStatusAction(proposalId: string, status: Extract<ProposalStatus, "negotiating" | "revision_requested" | "archived" | "cancelled" | "draft">): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("proposals").update({ status, updated_at: new Date().toISOString() }).eq("id", proposalId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/comercial/propostas/${proposalId}`);
  return { ok: true };
}

export async function updateProposalSectionAction(sectionId: string, content: Record<string, unknown>): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("proposal_sections").update({ content, updated_at: new Date().toISOString() }).eq("id", sectionId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function toggleProposalSectionVisibilityAction(sectionId: string, visible: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("proposal_sections").update({ visible }).eq("id", sectionId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/comercial");
  return { ok: true };
}

export async function reorderProposalSectionAction(sectionId: string, newPosition: number): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("proposal_sections").update({ position: newPosition }).eq("id", sectionId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function addProposalSectionAction(proposalId: string, sectionType: ProposalSectionType): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: lastRows } = await supabase.from("proposal_sections").select("position").eq("proposal_id", proposalId).order("position", { ascending: false }).limit(1);
  const position = (lastRows?.[0]?.position ?? 0) + 1000;
  const { error } = await supabase.from("proposal_sections").insert({ proposal_id: proposalId, section_type: sectionType, content: EMPTY_CONTENT_BY_TYPE[sectionType], position });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/comercial");
  return { ok: true };
}

export async function duplicateProposalSectionAction(sectionId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: section } = await supabase.from("proposal_sections").select("*").eq("id", sectionId).maybeSingle();
  if (!section) return { ok: false, error: "Seção não encontrada." };
  const { error } = await supabase
    .from("proposal_sections")
    .insert({ proposal_id: section.proposal_id, section_type: section.section_type, content: section.content, position: section.position + 1 });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/comercial");
  return { ok: true };
}

export async function removeProposalSectionAction(sectionId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("proposal_sections").delete().eq("id", sectionId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/comercial");
  return { ok: true };
}

/** "Enviar" (§15.1 do plano) — cria a `ProposalVersion` (cópia profunda das seções VISÍVEIS, na
 *  ordem), incrementa `current_version_number`, muda status pra `sent`. A partir daqui a URL
 *  pública passa a existir de verdade (antes disso era 404). */
export async function sendProposalAction(proposalId: string): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "Sessão expirada — faça login de novo." };

  const supabase = await createClient();
  const { data: proposal } = await supabase.from("proposals").select("current_version_number").eq("id", proposalId).maybeSingle();
  if (!proposal) return { ok: false, error: "Proposta não encontrada." };

  const { data: sections } = await supabase.from("proposal_sections").select("section_type, content").eq("proposal_id", proposalId).eq("visible", true).order("position");
  if (!sections || sections.length === 0) return { ok: false, error: "Adicione ao menos uma seção visível antes de enviar." };

  const snapshot = sections.map((s) => ({ sectionType: s.section_type, content: s.content }));
  const versionNumber = proposal.current_version_number + 1;

  const { error: versionError } = await supabase.from("proposal_versions").insert({ proposal_id: proposalId, version_number: versionNumber, snapshot, created_by: userId });
  if (versionError) return { ok: false, error: versionError.message };

  const { error: updateError } = await supabase
    .from("proposals")
    .update({ status: "sent", current_version_number: versionNumber, updated_at: new Date().toISOString() })
    .eq("id", proposalId);
  if (updateError) return { ok: false, error: updateError.message };

  await supabase.from("events").insert({ entity_type: "proposal", entity_id: proposalId, actor_id: userId, type: "proposal.sent", metadata: { version_number: versionNumber } });

  revalidatePath(`/comercial/propostas/${proposalId}`);
  return { ok: true };
}

/** Duplicar proposta inteira (§16 do plano) — nova Proposal (novo slug, `draft`), cópia das
 *  seções ao vivo da origem. Não copia versões/histórico (é uma proposta NOVA, não uma cópia de
 *  auditoria). */
export async function duplicateProposalAction(proposalId: string): Promise<ActionResult & { proposalId?: string }> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "Sessão expirada — faça login de novo." };

  const supabase = await createClient();
  const { data: original } = await supabase.from("proposals").select("*").eq("id", proposalId).maybeSingle();
  if (!original) return { ok: false, error: "Proposta não encontrada." };

  const { data: sections } = await supabase.from("proposal_sections").select("*").eq("proposal_id", proposalId).order("position");

  const slug = await generateUniqueSlug(supabase, `${original.title}-copia`);
  const { data: copy, error: copyError } = await supabase
    .from("proposals")
    .insert({
      lead_id: original.lead_id,
      client_id: original.client_id,
      template_id: original.template_id,
      slug,
      title: `${original.title} (cópia)`,
      brand_name: original.brand_name,
      accent_color: original.accent_color,
      created_by: userId,
    })
    .select("id")
    .single();
  if (copyError) return { ok: false, error: copyError.message };

  if (sections && sections.length > 0) {
    const { error: sectionsError } = await supabase
      .from("proposal_sections")
      .insert(sections.map((s) => ({ proposal_id: copy.id, section_type: s.section_type, content: s.content, position: s.position, visible: s.visible })));
    if (sectionsError) return { ok: false, error: sectionsError.message };
  }

  revalidatePath("/comercial");
  return { ok: true, proposalId: copy.id };
}

/** Payload pronto pra pré-preencher o `OnboardingModal` já existente (§10.2 do plano) — extrai
 *  valor/recorrência da seção `budget` da VERSÃO ACEITA (nunca a ao vivo, que pode ter mudado).
 *  Reaproveita `close_lead_and_create_client` via o mesmo fluxo de sempre — esta função só monta
 *  os dados, não cria cliente nenhum sozinha. */
export type ProposalAcceptedPayload = {
  contractType: "recorrente" | "pontual";
  monthlyValue: string;
  totalValue: string;
};

export async function getAcceptedProposalPayloadAction(proposalId: string): Promise<ProposalAcceptedPayload | null> {
  const supabase = await createClient();
  const { data: proposal } = await supabase.from("proposals").select("accepted_version_id").eq("id", proposalId).maybeSingle();
  if (!proposal?.accepted_version_id) return null;

  const { data: version } = await supabase.from("proposal_versions").select("snapshot").eq("id", proposal.accepted_version_id).maybeSingle();
  if (!version) return null;

  const budget = version.snapshot.find((s) => s.sectionType === "budget")?.content as { heroNumber?: number; recurrence?: string } | undefined;
  if (!budget) return null;

  const isRecurring = budget.recurrence !== "unico";
  return {
    contractType: isRecurring ? "recorrente" : "pontual",
    monthlyValue: isRecurring ? String(budget.heroNumber ?? "") : "",
    totalValue: !isRecurring ? String(budget.heroNumber ?? "") : "",
  };
}

export async function markLeadConvertedFromProposalAction(proposalId: string, clientId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("proposals").update({ client_id: clientId, updated_at: todayISO() }).eq("id", proposalId);
  const userId = await getCurrentUserId();
  if (userId) {
    await supabase.from("events").insert({ entity_type: "proposal", entity_id: proposalId, actor_id: userId, type: "proposal.converted", metadata: { client_id: clientId } });
  }
}
