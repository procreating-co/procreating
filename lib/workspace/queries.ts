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

/** Redesign "clareza operacional" (pedido explícito) — cada alerta carrega seu próprio `kind`
 *  (ícone) e `tone` (cor semântica, `lib/dashboard/metric-tone.ts`) desde a origem, em vez da UI
 *  adivinhar isso pelo texto do `label`. `tone` nunca depende só de cor pra passar a mensagem — a
 *  UI sempre imprime `count`/urgência em texto junto (pedido explícito de acessibilidade). */
export type AttentionKind = "tasks" | "leads" | "receivables" | "payables";
export type AttentionItem = { kind: AttentionKind; label: string; href: string; count: number; tone: "danger" | "warning" };
export type OtherUserOverview = { id: string; name: string; tasks: Task[] };
export type TodayProgress = { done: number; total: number };
export type StaleLead = { id: string; companyName: string };

export type WorkspaceOverview = {
  attention: AttentionItem[];
  dueTasks: Task[];
  weekTasks: Task[];
  todayProgress: TodayProgress | null;
  otherUser: OtherUserOverview | null;
  /** Até 4 leads mais antigos sem contato — pro painel "Foco de hoje" (pedido explícito: "lista
   *  curta de pessoas ou leads que precisam de atenção"), mesma regra de `staleLeadsCount`
   *  abaixo, só que devolvendo os leads em si, não só a contagem. */
  staleLeads: StaleLead[];
};

const STALE_LEAD_DAYS = 3;

// "Próxima tarefa recomendada" (painel "Foco de hoje", pedido explícito) — prioridade alta
// primeiro, depois quem já tem horário mais cedo, depois a posição manual de sempre. Nunca
// inventa um critério novo: são os 2 campos que já existem (`priority`, `due_time`) + a mesma
// ordenação manual (`position`) que a lista principal usa.
const PRIORITY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 };
function compareByRecommendation(a: Task, b: Task): number {
  const rankDiff = (PRIORITY_RANK[a.priority ?? ""] ?? 3) - (PRIORITY_RANK[b.priority ?? ""] ?? 3);
  if (rankDiff !== 0) return rankDiff;
  const timeDiff = (a.due_time ?? "99:99:99").localeCompare(b.due_time ?? "99:99:99");
  if (timeDiff !== 0) return timeDiff;
  return a.position - b.position;
}

export async function computeWorkspaceOverview(userId: string): Promise<WorkspaceOverview> {
  const supabase = await createClient();
  const todayDate = todayISO();
  const staleThresholdISO = addDaysISO(todayDate, -STALE_LEAD_DAYS);

  const [dueTasks, weekTasks, stages, { data: openLeads }, { data: overdueRevenue }, { data: dueTodayRevenue }, { data: overdueExpenses }, { data: dueTodayExpenses }, { data: otherUsers }] =
    await Promise.all([
      listTodayAndOverdueTasks(userId),
      listWeekTasks(userId),
      listPipelineStages(),
      supabase.from("leads").select("id, company_name, last_contact_at, created_at, stage_id").is("client_id", null),
      supabase.from("revenue").select("id").eq("status", "atrasado"),
      supabase.from("revenue").select("id").eq("status", "pendente").eq("due_date", todayDate),
      supabase.from("expenses").select("id").eq("status", "atrasado"),
      supabase.from("expenses").select("id").eq("status", "pendente").eq("due_date", todayDate),
      supabase.from("users").select("id, name").neq("id", userId).limit(1),
    ]);

  // Leads sem contato há mais de N dias — exclui estágios perdidos (não é "atenção" reabrir algo
  // já morto). `last_contact_at` com fallback pra `created_at` (nunca houve contato ainda).
  const lostStageIds = new Set(stages.filter((stage) => stage.is_lost).map((stage) => stage.id));
  const staleLeadRows = (openLeads ?? [])
    .filter((lead) => {
      if (lostStageIds.has(lead.stage_id)) return false;
      const reference = lead.last_contact_at ?? lead.created_at;
      return reference < staleThresholdISO;
    })
    .sort((a, b) => (a.last_contact_at ?? a.created_at).localeCompare(b.last_contact_at ?? b.created_at));
  const staleLeadsCount = staleLeadRows.length;
  const staleLeads: StaleLead[] = staleLeadRows.slice(0, 4).map((lead) => ({ id: lead.id, companyName: lead.company_name }));

  const revenueDueCount = (overdueRevenue?.length ?? 0) + (dueTodayRevenue?.length ?? 0);
  const expensesDueCount = (overdueExpenses?.length ?? 0) + (dueTodayExpenses?.length ?? 0);
  const pendingDueTasksCount = dueTasks.filter((task) => task.status !== "done").length;

  const attention: AttentionItem[] = [];
  if (pendingDueTasksCount > 0) {
    attention.push({
      kind: "tasks",
      count: pendingDueTasksCount,
      tone: "danger",
      label: `${pendingDueTasksCount} tarefa${pendingDueTasksCount === 1 ? "" : "s"} vencendo hoje ou atrasada${pendingDueTasksCount === 1 ? "" : "s"}`,
      href: "#tarefas-de-hoje",
    });
  }
  if (staleLeadsCount > 0) {
    attention.push({
      kind: "leads",
      count: staleLeadsCount,
      tone: "warning",
      label: `${staleLeadsCount} lead${staleLeadsCount === 1 ? "" : "s"} sem contato há mais de ${STALE_LEAD_DAYS} dias`,
      href: "/comercial?tab=commercial",
    });
  }
  if (revenueDueCount > 0) {
    attention.push({
      kind: "receivables",
      count: revenueDueCount,
      tone: "danger",
      label: `${revenueDueCount} conta${revenueDueCount === 1 ? "" : "s"} a receber vencendo hoje ou atrasada${revenueDueCount === 1 ? "" : "s"}`,
      // Financeiro virou página única sem abas (redesign, Bloco 1) — âncora na seção, não mais
      // `?tab=`.
      href: "/financeiro#a-receber",
    });
  }
  if (expensesDueCount > 0) {
    attention.push({
      kind: "payables",
      count: expensesDueCount,
      tone: "warning",
      label: `${expensesDueCount} conta${expensesDueCount === 1 ? "" : "s"} a pagar vencendo hoje ou atrasada${expensesDueCount === 1 ? "" : "s"}`,
      href: "/financeiro#a-pagar",
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

  return { attention, dueTasks, weekTasks, todayProgress, otherUser, staleLeads };
}

/** Usado só pelo painel "Foco de hoje" — a mesma lista de `dueTasks` que a coluna principal já
 *  recebeu, só reordenada pra achar a mais urgente. Não busca nada novo. */
export function pickRecommendedTask(dueTasks: Task[]): Task | null {
  const pending = dueTasks.filter((task) => task.status !== "done");
  if (pending.length === 0) return null;
  return [...pending].sort(compareByRecommendation)[0];
}
