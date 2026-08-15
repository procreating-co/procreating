"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/supabase/current-user";
import { listTeamUsers } from "@/lib/operacao/queries";
import type { ProductionItemKind, ProductionItemStatusTone, ProductionProjectStatus, User } from "@/lib/supabase/types/database";

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
};

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
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath(PRODUCTION_ITEM_PATH[input.kind]);
  return { ok: true };
}

export async function updateProductionItemStatusAction(id: string, kind: ProductionItemKind, statusLabel: string, statusTone: ProductionItemStatusTone): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("production_items").update({ status_label: statusLabel, status_tone: statusTone, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath(PRODUCTION_ITEM_PATH[kind]);
  return { ok: true };
}
