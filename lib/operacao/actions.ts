"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/supabase/current-user";
import type { ProductionProjectStatus } from "@/lib/supabase/types/database";

export type ActionResult = { ok: true } | { ok: false; error: string };

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
