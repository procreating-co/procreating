"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/supabase/current-user";
import { brasiliaDateTimeToISO, minutesOfDayInBrasilia, nowMinutesOfDayInBrasilia, todayISO } from "@/lib/date";
import { suggestSchedule, minutesToClock, type PlannerResult } from "@/lib/tasks/planner";
import { createTimeBlocksBatchAction } from "@/lib/tasks/time-block-actions";
import type { ActionResult } from "@/lib/tasks/actions";

/** "Planejar meu dia" (§21) e "Planejar bloco" (§11) são o MESMO motor (`suggestSchedule`,
 *  puro) — a única diferença é QUAIS tarefas entram: aqui, todas as de hoje/atrasadas do usuário
 *  ainda não concluídas; em `planForTasksAction`, só as que a pessoa selecionou na lista. */
export async function planMyDayAction(): Promise<PlannerResult | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;
  return planForUser(userId, null);
}

/** Planeja um subconjunto específico de tarefas (seleção múltipla → "Planejar bloco", §11) —
 *  não precisam ser de hoje nem do usuário logado (podem ser de outra pessoa, staff planejando
 *  pra alguém do time). */
export async function planForTasksAction(taskIds: string[]): Promise<PlannerResult | null> {
  if (taskIds.length === 0) return null;
  const supabase = await createClient();
  const { data: tasks } = await supabase.from("tasks").select("id, title, estimated_minutes, assignee_id").in("id", taskIds);
  if (!tasks || tasks.length === 0) return null;

  // Seleção múltipla pode misturar responsáveis — planeja contra a agenda do PRIMEIRO
  // responsável encontrado (caso comum: seleção é de uma pessoa só). Misto de responsáveis é
  // avisado por quem chama via `assigneeIds` no retorno, não escondido.
  const assigneeId = tasks.find((t) => t.assignee_id)?.assignee_id ?? null;
  if (!assigneeId) return { scheduled: [], unscheduled: tasks.map((t) => ({ id: t.id, title: t.title, estimatedMinutes: t.estimated_minutes })) };

  return planForUser(
    assigneeId,
    tasks.map((t) => ({ id: t.id, title: t.title, estimatedMinutes: t.estimated_minutes })),
  );
}

async function planForUser(userId: string, explicitTasks: { id: string; title: string; estimatedMinutes: number | null }[] | null): Promise<PlannerResult> {
  const supabase = await createClient();
  const today = todayISO();

  const tasks =
    explicitTasks ??
    (await (async () => {
      const { data } = await supabase.from("tasks").select("id, title, estimated_minutes").eq("assignee_id", userId).neq("status", "done").lte("due_date", today);
      return (data ?? []).map((t) => ({ id: t.id, title: t.title, estimatedMinutes: t.estimated_minutes }));
    })());

  const { data: myTaskIdsRows } = await supabase.from("tasks").select("id").eq("assignee_id", userId);
  const myTaskIds = (myTaskIdsRows ?? []).map((t) => t.id);

  // Limites do dia em Brasília, não UTC — sem o offset explícito aqui, "hoje 00:00" seria lido
  // pelo Postgres como UTC, cortando os últimos ~3h da noite de Brasília pro dia errado (mesma
  // armadilha que `lib/date.ts` inteiro existe pra evitar, agora na consulta em vez da leitura).
  const dayStart = brasiliaDateTimeToISO(today, "00:00");
  const dayEnd = brasiliaDateTimeToISO(today, "23:59");

  const { data: blocks } =
    myTaskIds.length > 0
      ? await supabase.from("time_blocks").select("start_at, end_at").in("task_id", myTaskIds).gte("start_at", dayStart).lte("start_at", dayEnd).neq("status", "cancelled")
      : { data: [] };

  const busy = (blocks ?? []).map((block) => ({
    startMinutes: minutesOfDayInBrasilia(block.start_at),
    endMinutes: minutesOfDayInBrasilia(block.end_at),
    label: "Bloco existente",
  }));

  return suggestSchedule(tasks, busy, undefined, nowMinutesOfDayInBrasilia());
}

/** Aplica o plano sugerido — vira `time_blocks` reais pra hoje. `force` propagado (a UI já
 *  mostrou a checagem de conflito antes de chegar aqui, ver `ScheduleBlockDialog`). */
export async function applyPlanAction(suggestions: { taskId: string; startMinutes: number; endMinutes: number }[], force: boolean): Promise<ActionResult & { createdCount: number }> {
  const today = todayISO();
  const blocks = suggestions.map((s) => ({
    taskId: s.taskId,
    startAtISO: brasiliaDateTimeToISO(today, minutesToClock(s.startMinutes)),
    endAtISO: brasiliaDateTimeToISO(today, minutesToClock(s.endMinutes)),
  }));
  return createTimeBlocksBatchAction(blocks, force);
}
