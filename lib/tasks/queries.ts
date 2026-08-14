import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Task } from "@/lib/supabase/types/database";

/** Todas as tarefas de um contexto (ex.: `context_type: "client_onboarding"`, `context_id:
 *  <client_id>`) — usado pela visão 360º de Clientes e por `/clientes/onboarding`. */
export async function listTasksByContext(contextType: string, contextId: string): Promise<Task[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("tasks").select("*").eq("context_type", contextType).eq("context_id", contextId).order("created_at");
  return data ?? [];
}

/** Todas as tarefas de um `context_type` (sem filtrar por `context_id`) — usado por
 *  `/clientes/onboarding` pra listar tarefas de onboarding de TODOS os clientes, agrupadas. */
export async function listTasksByContextType(contextType: string): Promise<Task[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("tasks").select("*").eq("context_type", contextType).order("due_date", { ascending: true, nullsFirst: false });
  return data ?? [];
}

/** Tarefas do usuário logado — "Meu Dia". Inclui tarefas sem `context_type` (pessoais) e
 *  qualquer outra atribuída a ele (ex.: as de onboarding que o RPC atribui a quem fechou). */
export async function listTasksByAssignee(userId: string): Promise<Task[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("tasks").select("*").eq("assignee_id", userId).order("due_date", { ascending: true, nullsFirst: false });
  return data ?? [];
}

/** Tarefas do usuário vencendo hoje ou atrasadas, ainda não concluídas — "o que precisa da
 *  minha atenção hoje" da Home. */
export async function listMyDueTasks(userId: string): Promise<Task[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .eq("assignee_id", userId)
    .neq("status", "done")
    .lte("due_date", today)
    .order("due_date", { ascending: true });
  return data ?? [];
}
