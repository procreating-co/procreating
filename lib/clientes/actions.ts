"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ClientStatus } from "@/lib/supabase/types/database";

export type ActionResult = { ok: true } | { ok: false; error: string };

// `getClientFullAction` (ponte pro `ClientDetailDrawer`) foi removida — o drawer lateral saiu
// (pedido explícito, virou navegação de tela cheia pra `/clientes/[id]`, que já busca
// `getClientFull` direto, sem precisar de action). Toggle de tarefa de onboarding foi pra
// `lib/tasks/actions.ts` (`updateTaskStatusAction`) —
// `tasks` é transversal agora, não faz mais sentido uma action específica de Clientes pra isso.

export async function updateClientStatusAction(clientId: string, status: ClientStatus): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("clients").update({ status, updated_at: new Date().toISOString() }).eq("id", clientId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/clientes/${clientId}`);
  revalidatePath("/clientes");
  return { ok: true };
}

export type ClientInfoPatch = { name: string; document: string | null; segment: string | null; city: string | null; state: string | null };

export async function updateClientInfoAction(clientId: string, patch: ClientInfoPatch): Promise<ActionResult> {
  if (!patch.name.trim()) return { ok: false, error: "Informe o nome do cliente." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("clients")
    .update({
      name: patch.name.trim(),
      document: patch.document || null,
      segment: patch.segment || null,
      city: patch.city || null,
      state: patch.state || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", clientId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/clientes/${clientId}`);
  revalidatePath("/clientes");
  return { ok: true };
}
