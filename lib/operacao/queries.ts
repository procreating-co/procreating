import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ProductionItem, ProductionItemFormat, ProductionItemKind, ProductionProject, User } from "@/lib/supabase/types/database";

export type ProductionProjectWithRelations = ProductionProject & {
  clientName: string;
  assigneeName: string | null;
};

/** Lista real de `production_projects` — join manual com `clients`/`users` em TypeScript, mesmo
 *  padrão de `lib/comercial/queries.ts` (sem embed do PostgREST, por escolha do projeto). */
export async function listProductionProjects(): Promise<ProductionProjectWithRelations[]> {
  const supabase = await createClient();
  const { data: projects } = await supabase.from("production_projects").select("*").order("created_at", { ascending: false });
  if (!projects || projects.length === 0) return [];

  const clientIds = Array.from(new Set(projects.map((project) => project.client_id)));
  const assigneeIds = Array.from(new Set(projects.map((project) => project.assigned_to).filter((id): id is string => id != null)));

  const [{ data: clients }, { data: users }] = await Promise.all([
    supabase.from("clients").select("id, name").in("id", clientIds),
    assigneeIds.length > 0 ? supabase.from("users").select("id, name").in("id", assigneeIds) : Promise.resolve({ data: [] as { id: string; name: string }[] }),
  ]);

  const clientNameById = new Map((clients ?? []).map((client) => [client.id, client.name]));
  const userNameById = new Map((users ?? []).map((user) => [user.id, user.name]));

  return projects.map((project) => ({
    ...project,
    clientName: clientNameById.get(project.client_id) ?? "Cliente removido",
    assigneeName: project.assigned_to ? (userNameById.get(project.assigned_to) ?? null) : null,
  }));
}

export async function getProductionProject(id: string): Promise<ProductionProjectWithRelations | null> {
  const supabase = await createClient();
  const { data: project } = await supabase.from("production_projects").select("*").eq("id", id).maybeSingle();
  if (!project) return null;

  const [{ data: client }, { data: assignee }] = await Promise.all([
    supabase.from("clients").select("name").eq("id", project.client_id).maybeSingle(),
    project.assigned_to ? supabase.from("users").select("name").eq("id", project.assigned_to).maybeSingle() : Promise.resolve({ data: null }),
  ]);

  return { ...project, clientName: client?.name ?? "Cliente removido", assigneeName: assignee?.name ?? null };
}

/** Todos os usuários cadastrados — reaproveitado por `/operacao/equipe` (real, no lugar de
 *  `DEMO_TEAM`) e pelo seletor de responsável do formulário de novo projeto. */
export async function listTeamUsers(): Promise<User[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("users").select("*").order("name");
  return data ?? [];
}

export type ProductionItemWithRelations = ProductionItem & { clientName: string | null };
export type ProductionItemWithAssignee = ProductionItem & { assigneeName: string | null };

/** `kind` filtra qual das 3 páginas (Produção/Entregas/Recursos) — mesma tabela, mesmo motivo de
 *  `listProductionProjects` não usar embed do PostgREST (join manual em TypeScript). */
export async function listProductionItems(kind: ProductionItemKind): Promise<ProductionItemWithRelations[]> {
  const supabase = await createClient();
  const { data: items } = await supabase.from("production_items").select("*").eq("kind", kind).order("created_at", { ascending: false });
  if (!items || items.length === 0) return [];

  const clientIds = Array.from(new Set(items.map((item) => item.client_id).filter((id): id is string => id != null)));
  const { data: clients } = clientIds.length > 0 ? await supabase.from("clients").select("id, name").in("id", clientIds) : { data: [] as { id: string; name: string }[] };
  const clientNameById = new Map((clients ?? []).map((client) => [client.id, client.name]));

  return items.map((item) => ({ ...item, clientName: item.client_id ? (clientNameById.get(item.client_id) ?? "Cliente removido") : null }));
}

// ---------------------------------------------------------------------------
// Client Hub (Operação > Clientes > [cliente] > Central do Cliente) — Cronograma de postagens/
// Roteiros/Stories, migration `20260903000000_production_items_client_hub.sql`. Mesma tabela
// `production_items`/`kind='conteudo'`, só filtrada por `client_id` + discriminada por `format`.
//
// Todas as funções abaixo checam `error` explicitamente e devolvem uma lista vazia em vez de
// deixar a página quebrar — se a migration ainda não tiver sido aplicada no banco (colunas novas
// inexistentes), a query falha graciosamente e a seção correspondente do hub mostra um estado
// vazio, em vez de um erro 500. Assim que a migration entrar, os dados aparecem sem precisar de
// nenhum redeploy.
// ---------------------------------------------------------------------------

async function listClientContentItems(clientId: string, formats: ProductionItemFormat[] | null): Promise<ProductionItemWithAssignee[]> {
  const supabase = await createClient();
  let query = supabase.from("production_items").select("*").eq("kind", "conteudo").eq("client_id", clientId);
  query = formats ? query.in("format", formats) : query.or("format.is.null,format.in.(post,reels,outro)");
  const { data: items, error } = await query.order("scheduled_date", { ascending: true, nullsFirst: false }).order("created_at", { ascending: false });
  if (error || !items) return [];

  const assigneeIds = Array.from(new Set(items.map((item) => item.assigned_to).filter((id): id is string => id != null)));
  const { data: users } = assigneeIds.length > 0 ? await supabase.from("users").select("id, name").in("id", assigneeIds) : { data: [] as { id: string; name: string }[] };
  const nameById = new Map((users ?? []).map((user) => [user.id, user.name]));

  return items.map((item) => ({ ...item, assigneeName: item.assigned_to ? (nameById.get(item.assigned_to) ?? null) : null }));
}

/** Cronograma de postagens — `format` ausente ou 'post'/'reels'/'outro' (tudo que não é roteiro
 *  nem story dedicado). */
export function listClientContentCalendar(clientId: string): Promise<ProductionItemWithAssignee[]> {
  return listClientContentItems(clientId, null);
}

/** Roteiros — `format='roteiro'`, usa também `script_body`. */
export function listClientScripts(clientId: string): Promise<ProductionItemWithAssignee[]> {
  return listClientContentItems(clientId, ["roteiro"]);
}

/** Linha editorial de Stories — `format='story'`, usa também `story_sequence`/`story_objective`/
 *  `story_direction`. */
export function listClientStories(clientId: string): Promise<ProductionItemWithAssignee[]> {
  return listClientContentItems(clientId, ["story"]);
}

export type ClientHubOverview = {
  upcomingPublications: number;
  inProduction: number;
  inReview: number;
  publishedThisMonth: number;
};

/** Contadores da "Visão geral" do Client Hub — todos sobre `production_items` (kind='conteudo',
 *  client_id=X), pelos 6 status do vocabulário do Cronograma (`PRODUCTION_ITEM_STATUS_PRESETS.conteudo`).
 *  "Em aprovação" mapeia pro status "Em revisão" (item aguardando validação antes de agendar/
 *  publicar) — não existe um 4º card pra "Aprovado"/"Agendado" no pedido original, então ficam
 *  contados dentro do total, sem card próprio. */
export async function getClientHubOverview(clientId: string): Promise<ClientHubOverview> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = `${today.slice(0, 7)}-01`;

  const [upcoming, producing, review, published] = await Promise.all([
    supabase.from("production_items").select("id", { count: "exact", head: true }).eq("kind", "conteudo").eq("client_id", clientId).gte("scheduled_date", today).neq("status_label", "Publicado"),
    supabase.from("production_items").select("id", { count: "exact", head: true }).eq("kind", "conteudo").eq("client_id", clientId).eq("status_label", "Em produção"),
    supabase.from("production_items").select("id", { count: "exact", head: true }).eq("kind", "conteudo").eq("client_id", clientId).eq("status_label", "Em revisão"),
    supabase.from("production_items").select("id", { count: "exact", head: true }).eq("kind", "conteudo").eq("client_id", clientId).eq("status_label", "Publicado").gte("scheduled_date", monthStart),
  ]);

  return {
    upcomingPublications: upcoming.error ? 0 : (upcoming.count ?? 0),
    inProduction: producing.error ? 0 : (producing.count ?? 0),
    inReview: review.error ? 0 : (review.count ?? 0),
    publishedThisMonth: published.error ? 0 : (published.count ?? 0),
  };
}

export type UpcomingDelivery = { id: string; name: string; deadline: string; status: ProductionProject["status"] };

/** "Próximas entregas" da Visão geral — `production_projects` do cliente com prazo definido,
 *  ordenado por proximidade. Não depende da migration do Client Hub (usa colunas que já existiam),
 *  então funciona mesmo antes dela ser aplicada. */
export async function listClientUpcomingDeliveries(clientId: string, limit = 5): Promise<UpcomingDelivery[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("production_projects")
    .select("id, name, deadline, status")
    .eq("client_id", clientId)
    .not("deadline", "is", null)
    .gte("deadline", today)
    .order("deadline", { ascending: true })
    .limit(limit);
  return (data ?? []).map((row) => ({ id: row.id, name: row.name, deadline: row.deadline as string, status: row.status }));
}
