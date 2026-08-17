import "server-only";
import { createClient } from "@/lib/supabase/server";
import { listMyDueTasks, listTodayAndOverdueTasks, listWeekTasks } from "@/lib/tasks/queries";
import { listPipelineStages } from "@/lib/comercial/queries";
import { addDaysISO, todayISO } from "@/lib/date";
import type { Task } from "@/lib/supabase/types/database";

// ---------------------------------------------------------------------------
// Query central do Workspace (era "Meu Dia", `/meu-dia` → `/workspace`) — uma página única, cockpit real, não uma coleção de
// abas. Junta o que já existe (`lib/tasks`, `lib/comercial`) com consultas diretas pequenas em
// `leads`/`revenue`/`expenses`, sempre respondendo "o que a empresa precisa de mim hoje" com dado
// real — fonte vazia = item omitido, nunca "0 encontrados" forçado.
// ---------------------------------------------------------------------------

export type AttentionItem = { label: string; href: string };
export type OtherUserOverview = { id: string; name: string; tasks: Task[] };
export type TodayProgress = { done: number; total: number };

export type WorkspaceOverview = {
  attention: AttentionItem[];
  dueTasks: Task[];
  weekTasks: Task[];
  todayProgress: TodayProgress | null;
  otherUser: OtherUserOverview | null;
};

const STALE_LEAD_DAYS = 3;

export async function computeWorkspaceOverview(userId: string): Promise<WorkspaceOverview> {
  const supabase = await createClient();
  const todayDate = todayISO();
  const staleThresholdISO = addDaysISO(todayDate, -STALE_LEAD_DAYS);

  const [dueTasks, weekTasks, stages, { data: openLeads }, { data: overdueRevenue }, { data: dueTodayRevenue }, { data: overdueExpenses }, { data: dueTodayExpenses }, { data: otherUsers }] =
    await Promise.all([
      listTodayAndOverdueTasks(userId),
      listWeekTasks(userId),
      listPipelineStages(),
      supabase.from("leads").select("id, last_contact_at, created_at, stage_id").is("client_id", null),
      supabase.from("revenue").select("id").eq("status", "atrasado"),
      supabase.from("revenue").select("id").eq("status", "pendente").eq("due_date", todayDate),
      supabase.from("expenses").select("id").eq("status", "atrasado"),
      supabase.from("expenses").select("id").eq("status", "pendente").eq("due_date", todayDate),
      supabase.from("users").select("id, name").neq("id", userId).limit(1),
    ]);

  // Leads sem contato há mais de N dias — exclui estágios perdidos (não é "atenção" reabrir algo
  // já morto). `last_contact_at` com fallback pra `created_at` (nunca houve contato ainda).
  const lostStageIds = new Set(stages.filter((stage) => stage.is_lost).map((stage) => stage.id));
  const staleLeadsCount = (openLeads ?? []).filter((lead) => {
    if (lostStageIds.has(lead.stage_id)) return false;
    const reference = lead.last_contact_at ?? lead.created_at;
    return reference < staleThresholdISO;
  }).length;

  const revenueDueCount = (overdueRevenue?.length ?? 0) + (dueTodayRevenue?.length ?? 0);
  const expensesDueCount = (overdueExpenses?.length ?? 0) + (dueTodayExpenses?.length ?? 0);
  const pendingDueTasksCount = dueTasks.filter((task) => task.status !== "done").length;

  const attention: AttentionItem[] = [];
  if (pendingDueTasksCount > 0) {
    attention.push({
      label: `${pendingDueTasksCount} tarefa${pendingDueTasksCount === 1 ? "" : "s"} vencendo hoje ou atrasada${pendingDueTasksCount === 1 ? "" : "s"}`,
      href: "#tarefas-de-hoje",
    });
  }
  if (staleLeadsCount > 0) {
    attention.push({
      label: `${staleLeadsCount} lead${staleLeadsCount === 1 ? "" : "s"} sem contato há mais de ${STALE_LEAD_DAYS} dias`,
      href: "/comercial?tab=crm",
    });
  }
  if (revenueDueCount > 0) {
    attention.push({
      label: `${revenueDueCount} conta${revenueDueCount === 1 ? "" : "s"} a receber vencendo hoje ou atrasada${revenueDueCount === 1 ? "" : "s"}`,
      href: "/financeiro?tab=receivables",
    });
  }
  if (expensesDueCount > 0) {
    attention.push({
      label: `${expensesDueCount} conta${expensesDueCount === 1 ? "" : "s"} a pagar vencendo hoje ou atrasada${expensesDueCount === 1 ? "" : "s"}`,
      href: "/financeiro?tab=payables",
    });
  }

  // Progresso do dia — só entre as tarefas com prazo EXATAMENTE hoje (não as atrasadas de antes),
  // e só aparece se houver alguma (nunca "0 de 0").
  const dueExactlyToday = dueTasks.filter((task) => task.due_date === todayDate);
  const todayProgress: TodayProgress | null = dueExactlyToday.length > 0 ? { done: dueExactlyToday.filter((task) => task.status === "done").length, total: dueExactlyToday.length } : null;

  const otherUserRow = (otherUsers ?? [])[0];
  const otherUser: OtherUserOverview | null = otherUserRow
    ? { id: otherUserRow.id, name: otherUserRow.name, tasks: (await listMyDueTasks(otherUserRow.id)).slice(0, 4) }
    : null;

  return { attention, dueTasks, weekTasks, todayProgress, otherUser };
}
