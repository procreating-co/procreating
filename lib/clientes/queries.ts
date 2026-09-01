import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Client, ContractCategory } from "@/lib/supabase/types/database";
import type { ClientFull } from "@/lib/clientes/types";

export async function listClients(): Promise<Client[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("clients").select("*").order("name");
  return data ?? [];
}

/** Só a linha de `clients`, sem os 7 joins de `getClientFull` (contratos/onboarding/tarefas/
 *  eventos) — usada pelo Client Hub (`/clientes/[id]/hub`), que precisa de `name`/`slug`/`status`
 *  pro header e mais nada da ficha cadastral. */
export async function getClientBasic(id: string): Promise<Client | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("clients").select("*").eq("id", id).maybeSingle();
  return data ?? null;
}

export type ClientWithCategories = { client: Client; categories: ContractCategory[] };

/** `/clientes` — cada cliente junto das categorias (deduplicadas) dos seus próprios contratos,
 *  pro filtro "Recorrente Ativo / Pontual Concluído / Pontual em Andamento / Churn" (antes disso
 *  existir, a lista misturava cliente com contrato pontual entregue há 1 ano e cliente com
 *  mensalidade ativa sob o mesmo status "Ativo", sem nenhuma forma de diferenciar). Cliente sem
 *  nenhum contrato (ex.: recém-criado, ainda sem onboarding fechado) entra com `categories: []`,
 *  visível só quando nenhum filtro está selecionado. */
export async function listClientsWithCategories(): Promise<ClientWithCategories[]> {
  const supabase = await createClient();
  const [{ data: clients }, { data: contracts }] = await Promise.all([
    supabase.from("clients").select("*").order("name"),
    supabase.from("contracts").select("client_id, category"),
  ]);

  const categoriesByClient = new Map<string, Set<ContractCategory>>();
  for (const contract of contracts ?? []) {
    const set = categoriesByClient.get(contract.client_id) ?? new Set<ContractCategory>();
    set.add(contract.category);
    categoriesByClient.set(contract.client_id, set);
  }

  return (clients ?? []).map((client) => ({ client, categories: Array.from(categoriesByClient.get(client.id) ?? []) }));
}

export type ClientCardData = { client: Client; categories: ContractCategory[]; contractCount: number; totalValue: number };
// `project_stage` já vem embutido em `client` (coluna real de `clients`, `Client["project_stage"]`) —
// nenhum campo novo aqui, `bucketOf`/`ClientCard` leem direto de `data.client.project_stage`.
export type ClientsOverview = { rows: ClientCardData[] };

/** `/clientes` (Central de Clientes) — pedido explícito: os blocos do topo (Clientes Recorrentes/
 *  Projetos/Inativos) SÃO o filtro agora, calculados e aplicados no componente (`ClientsGrid`),
 *  não mais aqui — por isso esta função voltou a devolver TODO cliente com contrato (não só
 *  recorrente), pra o componente poder baldear entre os 3 buckets sem precisar de uma query nova
 *  a cada clique. `totalValue` — pedido explícito ("a ordem sempre deve ser pagam mais antes"):
 *  soma de `monthly_value` dos contratos recorrentes + `total_value` dos pontuais, é o número
 *  usado pra ordenar "quem paga mais" primeiro (ordem padrão da grid). Mesmas 2 queries de
 *  sempre, nenhuma nova — tudo calculado em cima do mesmo `contracts` já buscado, sem N+1. */
export async function listClientsOverview(): Promise<ClientsOverview> {
  const supabase = await createClient();
  const [{ data: clients }, { data: contracts }] = await Promise.all([
    supabase.from("clients").select("*").order("name"),
    supabase.from("contracts").select("client_id, category, monthly_value, total_value"),
  ]);

  const byClient = new Map<string, { categories: Set<ContractCategory>; count: number; value: number }>();
  for (const contract of contracts ?? []) {
    const entry = byClient.get(contract.client_id) ?? { categories: new Set<ContractCategory>(), count: 0, value: 0 };
    entry.categories.add(contract.category);
    entry.count += 1;
    if (contract.category === "recorrente_ativo") entry.value += Number(contract.monthly_value ?? 0);
    if (contract.category === "pontual_em_andamento" || contract.category === "pontual_concluido") entry.value += Number(contract.total_value ?? 0);
    byClient.set(contract.client_id, entry);
  }

  const rows = (clients ?? []).map((client) => {
    const entry = byClient.get(client.id);
    return { client, categories: Array.from(entry?.categories ?? []), contractCount: entry?.count ?? 0, totalValue: entry?.value ?? 0 };
  });

  return { rows };
}

export type PendingOnboardingTask = { id: string; title: string; clientId: string; clientName: string };

/** Tarefas de onboarding pendentes de todos os clientes, agrupáveis por cliente (usado por
 *  `/clientes/onboarding` e pelo bloco de atenção da Home). Lê `public.tasks` com
 *  `context_type = "client_onboarding"` — não existe mais tabela própria pra isso (ver
 *  `lib/tasks/queries.ts`). */
export async function listPendingOnboardingTasks(limit?: number): Promise<PendingOnboardingTask[]> {
  const supabase = await createClient();
  let query = supabase.from("tasks").select("*").eq("context_type", "client_onboarding").eq("status", "pending").order("created_at");
  if (limit) query = query.limit(limit);
  const { data: tasks } = await query;
  if (!tasks || tasks.length === 0) return [];

  const clientIds = Array.from(new Set(tasks.map((task) => task.context_id).filter((id): id is string => id != null)));
  const { data: clients } = await supabase.from("clients").select("*").in("id", clientIds);
  const nameById = new Map((clients ?? []).map((client) => [client.id, client.name]));

  return tasks.map((task) => ({ id: task.id, title: task.title, clientId: task.context_id ?? "", clientName: nameById.get(task.context_id ?? "") ?? "—" }));
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
      supabase.from("tasks").select("*").eq("context_type", "client_onboarding").eq("context_id", id).order("created_at"),
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
