import "server-only";
import { createClient } from "@/lib/supabase/server";
import { addDaysISO, todayISO } from "@/lib/date";
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

/** Tarefas do usuário vencendo hoje ou atrasadas, ainda não concluídas — usada pro resumo do
 *  outro sócio no Workspace (`lib/workspace/queries.ts`), onde só o que está pendente importa. */
export async function listMyDueTasks(userId: string): Promise<Task[]> {
  const supabase = await createClient();
  const today = todayISO();
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .eq("assignee_id", userId)
    .neq("status", "done")
    .lte("due_date", today)
    .order("due_date", { ascending: true });
  return data ?? [];
}

/** Tarefas do usuário com prazo hoje ou atrasado, QUALQUER status (inclui concluídas) — base da
 *  seção "Tarefas de hoje" do Workspace: a MESMA lista alimenta a contagem de "atenção" (filtrando
 *  `status !== "done"`) e o checklist em si (que precisa ver as concluídas pra riscar, não só
 *  sumir da tela) — sem duas queries pra a mesma coisa. */
export async function listTodayAndOverdueTasks(userId: string): Promise<Task[]> {
  const supabase = await createClient();
  const today = todayISO();
  const { data } = await supabase.from("tasks").select("*").eq("assignee_id", userId).lte("due_date", today).order("due_date", { ascending: true });
  return data ?? [];
}

/** Tarefas do usuário com prazo entre hoje e hoje+`days-1` (padrão 7 = hoje + 6 seguintes),
 *  QUALQUER status (inclui concluídas — a visão de semana precisa mostrar riscado, não só sumir)
 *  — base da visão de semana do Workspace. Uma passada só, agrupada por dia no componente
 *  (`components/workspace-tasks/week-view.tsx`), mesmo espírito de `listTodayAndOverdueTasks`
 *  (que também traz todo status pelo mesmo motivo). */
export async function listWeekTasks(userId: string, days = 7): Promise<Task[]> {
  const supabase = await createClient();
  const fromISO = todayISO();
  const toISO = addDaysISO(fromISO, days - 1);
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .eq("assignee_id", userId)
    .gte("due_date", fromISO)
    .lte("due_date", toISO)
    .order("due_date", { ascending: true });
  return data ?? [];
}

/** Tarefas do usuário com prazo nos próximos `days` dias (padrão 7), ainda não concluídas —
 *  histórico: alimentava "Próximos prazos" no Workspace, hoje substituído pela visão de semana
 *  (`listWeekTasks`) — mantida aqui por ser genericamente útil, sem chamador ativo no momento. */
export async function listUpcomingTasks(userId: string, days = 7): Promise<Task[]> {
  const supabase = await createClient();
  const fromISO = addDaysISO(todayISO(), 1);
  const toISO = addDaysISO(todayISO(), days);
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .eq("assignee_id", userId)
    .neq("status", "done")
    .gte("due_date", fromISO)
    .lte("due_date", toISO)
    .order("due_date", { ascending: true });
  return data ?? [];
}
