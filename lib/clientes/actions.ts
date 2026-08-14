"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ClientStatus } from "@/lib/supabase/types/database";

export type ActionResult = { ok: true } | { ok: false; error: string };

// Toggle de tarefa de onboarding foi pra `lib/tasks/actions.ts` (`updateTaskStatusAction`) —
// `tasks` é transversal agora, não faz mais sentido uma action específica de Clientes pra isso.

export async function updateClientStatusAction(clientId: string, status: ClientStatus): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("clients").update({ status, updated_at: new Date().toISOString() }).eq("id", clientId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/clientes/${clientId}`);
  revalidatePath("/clientes");
  return { ok: true };
}
