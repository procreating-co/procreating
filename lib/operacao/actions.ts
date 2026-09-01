"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/supabase/current-user";
import { listTeamUsers } from "@/lib/operacao/queries";
import type { ProductionItem, ProductionItemFormat, ProductionItemKind, ProductionItemStatusTone, ProductionProjectStatus, User } from "@/lib/supabase/types/database";

export type ActionResult = { ok: true } | { ok: false; error: string };

/** Wrapper `"use server"` — `lib/operacao/queries.ts` é `server-only`, só chamável de Server
 *  Component; o parser de tarefa por linha única (`@Nome`, `QuickAddMenu`) roda no client. */
export async function listTeamUsersAction(): Promise<User[]> {
  return listTeamUsers();
}

export type ProductionProjectInput = {
  name: string;
  clientId: string;
  assignedTo: string | null;
  status: ProductionProjectStatus;
  deadline: string | null;
};

export async function createProductionProjectAction(input: ProductionProjectInput): Promise<ActionResult> {
  if (!input.name.trim()) return { ok: false, error: "Informe o nome do projeto." };
  if (!input.clientId) return { ok: false, error: "Selecione o cliente." };

  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "Sessão expirada — faça login de novo." };

  const supabase = await createClient();
  const { error } = await supabase.from("production_projects").insert({
    name: input.name,
    client_id: input.clientId,
    assigned_to: input.assignedTo,
    status: input.status,
    deadline: input.deadline,
    created_by: userId,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/operacao/projetos");
  return { ok: true };
}

export async function updateProductionProjectStatusAction(id: string, status: ProductionProjectStatus): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("production_projects").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/operacao/projetos");
  revalidatePath(`/operacao/projetos/${id}`);
  return { ok: true };
}

/** Uma rota por `kind` — Produção/Entregas/Recursos são páginas separadas mesmo lendo da mesma
 *  tabela (`production_items`), então cada uma só revalida a própria. */
const PRODUCTION_ITEM_PATH: Record<ProductionItemKind, string> = {
  producao: "/operacao/producao",
  entrega: "/operacao/entregas",
  conteudo: "/operacao/conteudo",
};

export type ProductionItemInput = {
  kind: ProductionItemKind;
  title: string;
  clientId: string | null;
  productionProjectId: string | null;
  statusLabel: string;
  statusTone: ProductionItemStatusTone;
  // Client Hub (Operação > Clientes > [cliente], migration 20260903000000) — opcionais, só
  // preenchidos pelos formulários de Cronograma/Roteiros/Stories. `ItemFormDialog` (Produção/
  // Entregas/Recursos) nunca passa nenhum destes, então continua criando exatamente como antes.
  format?: ProductionItemFormat | null;
  channel?: string | null;
  scheduledDate?: string | null;
  assignedTo?: string | null;
  notes?: string | null;
  scriptBody?: string | null;
  storySequence?: number | null;
  storyObjective?: string | null;
  storyDirection?: string | null;
};

/** Além da rota Produção/Entregas/Recursos correspondente ao `kind`, revalida o Client Hub do
 *  cliente dono do item (quando houver um) — mesma tabela alimenta as duas telas. */
function clientHubPath(clientId: string | null | undefined): string | null {
  return clientId ? `/clientes/${clientId}/hub` : null;
}

export async function createProductionItemAction(input: ProductionItemInput): Promise<ActionResult> {
  if (!input.title.trim()) return { ok: false, error: "Informe o título." };

  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "Sessão expirada — faça login de novo." };

  const supabase = await createClient();
  const { error } = await supabase.from("production_items").insert({
    kind: input.kind,
    title: input.title,
    client_id: input.clientId,
    production_project_id: input.productionProjectId,
    status_label: input.statusLabel,
    status_tone: input.statusTone,
    created_by: userId,
    format: input.format ?? null,
    channel: input.channel ?? null,
    scheduled_date: input.scheduledDate ?? null,
    assigned_to: input.assignedTo ?? null,
    notes: input.notes ?? null,
    script_body: input.scriptBody ?? null,
    story_sequence: input.storySequence ?? null,
    story_objective: input.storyObjective ?? null,
    story_direction: input.storyDirection ?? null,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath(PRODUCTION_ITEM_PATH[input.kind]);
  const hubPath = clientHubPath(input.clientId);
  if (hubPath) revalidatePath(hubPath);
  return { ok: true };
}

export async function updateProductionItemStatusAction(id: string, kind: ProductionItemKind, statusLabel: string, statusTone: ProductionItemStatusTone, clientId?: string | null): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("production_items").update({ status_label: statusLabel, status_tone: statusTone, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath(PRODUCTION_ITEM_PATH[kind]);
  const hubPath = clientHubPath(clientId);
  if (hubPath) revalidatePath(hubPath);
  return { ok: true };
}

/** Edição dos campos do Client Hub (Cronograma/Roteiros/Stories) num item já criado — separado do
 *  status (`updateProductionItemStatusAction`, inalterado) porque os dois formulários aparecem em
 *  lugares diferentes da UI (select inline de status vs. dialog de edição de detalhes). */
export type ProductionItemDetailsInput = {
  title?: string;
  channel?: string | null;
  scheduledDate?: string | null;
  assignedTo?: string | null;
  notes?: string | null;
  scriptBody?: string | null;
  storySequence?: number | null;
  storyObjective?: string | null;
  storyDirection?: string | null;
};

export async function updateProductionItemDetailsAction(id: string, clientId: string | null, details: ProductionItemDetailsInput): Promise<ActionResult> {
  const supabase = await createClient();
  const update: Partial<ProductionItem> = { updated_at: new Date().toISOString() };
  if (details.title !== undefined) update.title = details.title;
  if (details.channel !== undefined) update.channel = details.channel;
  if (details.scheduledDate !== undefined) update.scheduled_date = details.scheduledDate;
  if (details.assignedTo !== undefined) update.assigned_to = details.assignedTo;
  if (details.notes !== undefined) update.notes = details.notes;
  if (details.scriptBody !== undefined) update.script_body = details.scriptBody;
  if (details.storySequence !== undefined) update.story_sequence = details.storySequence;
  if (details.storyObjective !== undefined) update.story_objective = details.storyObjective;
  if (details.storyDirection !== undefined) update.story_direction = details.storyDirection;

  const { error } = await supabase.from("production_items").update(update).eq("id", id);
  if (error) return { ok: false, error: error.message };

  const hubPath = clientHubPath(clientId);
  if (hubPath) revalidatePath(hubPath);
  return { ok: true };
}
