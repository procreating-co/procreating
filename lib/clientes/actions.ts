"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getClientFull } from "@/lib/clientes/queries";
import type { ClientStatus } from "@/lib/supabase/types/database";
import type { ClientFull } from "@/lib/clientes/types";

export type ActionResult = { ok: true } | { ok: false; error: string };

/** Ponte client→server pro `ClientDetailDrawer` — `getClientFull` é `server-only` (não pode ser
 *  chamado direto de um componente cliente); a página `/clientes` só carrega a lista leve
 *  (`listClientsOverview`), a visão 360º completa (contratos+contatos+financeiro+eventos) só é
 *  buscada quando o drawer de um cliente específico abre, não pra todos de uma vez (evita
 *  N+1/carregar dado que ninguém vai ver). Mesmo padrão de `getLeadEventsAction` no Pipeline. */
export async function getClientFullAction(clientId: string): Promise<ClientFull | null> {
  return getClientFull(clientId);
}

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
