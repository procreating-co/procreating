import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Client } from "@/lib/supabase/types/database";
import type { ClientFull } from "@/lib/clientes/types";

export async function listClients(): Promise<Client[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("clients").select("*").order("name");
  return data ?? [];
}

export type PendingOnboardingTask = { id: string; title: string; clientId: string; clientName: string };

/** Card "Próximas tarefas importantes" da Home (`app/(internal)/page.tsx`) — não existe um
 *  sistema de tarefas geral ainda (fora de escopo desta fase), só `onboarding_tasks`; é a única
 *  fonte real disponível pra esse card, então é isso que ele mostra. */
export async function listPendingOnboardingTasks(limit = 5): Promise<PendingOnboardingTask[]> {
  const supabase = await createClient();
  const { data: tasks } = await supabase.from("onboarding_tasks").select("*").eq("status", "pending").order("created_at").limit(limit);
  if (!tasks || tasks.length === 0) return [];

  const clientIds = Array.from(new Set(tasks.map((task) => task.client_id)));
  const { data: clients } = await supabase.from("clients").select("*").in("id", clientIds);
  const nameById = new Map((clients ?? []).map((client) => [client.id, client.name]));

  return tasks.map((task) => ({ id: task.id, title: task.title, clientId: task.client_id, clientName: nameById.get(task.client_id) ?? "—" }));
}

/** Junção manual em TS (não embed do PostgREST) — mesmo motivo documentado em
 *  `lib/comercial/queries.ts`: `Database` é uma aproximação manual, embed aninhado arrisca
 *  inferência `never`. */
export async function getClientFull(id: string): Promise<ClientFull | null> {
  const supabase = await createClient();

  const { data: client } = await supabase.from("clients").select("*").eq("id", id).maybeSingle();
  if (!client) return null;

  const [{ data: strategy }, { data: onboarding }, { data: contacts }, { data: contracts }, { data: revenue }, { data: tasks }, { data: events }] =
    await Promise.all([
      client.strategy_id ? supabase.from("strategies").select("*").eq("id", client.strategy_id).maybeSingle() : Promise.resolve({ data: null }),
      supabase.from("client_onboarding").select("*").eq("client_id", id).maybeSingle(),
      supabase.from("client_contacts").select("*").eq("client_id", id).order("is_primary", { ascending: false }),
      supabase.from("contracts").select("*").eq("client_id", id).order("created_at", { ascending: false }),
      supabase.from("revenue").select("*").eq("client_id", id).order("due_date"),
      supabase.from("onboarding_tasks").select("*").eq("client_id", id).order("created_at"),
      supabase.from("events").select("*").eq("entity_type", "client").eq("entity_id", id).order("created_at", { ascending: false }),
    ]);

  const contractIds = (contracts ?? []).map((contract) => contract.id);
  const { data: scopeItems } = contractIds.length > 0 ? await supabase.from("contract_scope_items").select("*").in("contract_id", contractIds) : { data: [] };

  const contractsWithScope = (contracts ?? []).map((contract) => ({
    ...contract,
    scopeItems: (scopeItems ?? []).filter((item) => item.contract_id === contract.id),
  }));

  return {
    client,
    strategy: strategy ? { id: strategy.id, name: strategy.name } : null,
    onboarding: onboarding ?? null,
    contacts: contacts ?? [],
    contracts: contractsWithScope,
    revenue: revenue ?? [],
    tasks: tasks ?? [],
    events: events ?? [],
  };
}
