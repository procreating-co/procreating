import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ProductionProject, User } from "@/lib/supabase/types/database";

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
