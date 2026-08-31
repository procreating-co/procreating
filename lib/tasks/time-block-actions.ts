"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/supabase/current-user";
import { brasiliaDateTimeToISO } from "@/lib/date";
import type { TimeBlock } from "@/lib/supabase/types/database";

export type ActionResult = { ok: true } | { ok: false; error: string };

export type TimeBlockWithTask = TimeBlock & { taskTitle: string; taskClientId: string | null };

/** Blocos do dia pro dono das tarefas (`assignee_id`, não `created_by` — é a agenda de quem vai
 *  executar que importa). Join manual em TypeScript, mesmo padrão do resto do projeto. */
export async function listTimeBlocksForDayAction(userId: string, dayISO: string): Promise<TimeBlockWithTask[]> {
  const supabase = await createClient();
  // Offset explícito (Brasília, `-03:00`) — sem ele o Postgres lê os limites do dia em UTC,
  // cortando as últimas ~3h da noite de Brasília pro dia seguinte (mesma armadilha documentada
  // em `lib/date.ts`, aqui na consulta em vez da leitura).
  const dayStart = brasiliaDateTimeToISO(dayISO, "00:00");
  const dayEnd = brasiliaDateTimeToISO(dayISO, "23:59");

  const { data: myTaskIdsRows } = await supabase.from("tasks").select("id, title, client_id").eq("assignee_id", userId);
  const taskById = new Map((myTaskIdsRows ?? []).map((t) => [t.id, t]));
  if (taskById.size === 0) return [];

  const { data: blocks } = await supabase
    .from("time_blocks")
    .select("*")
    .in("task_id", [...taskById.keys()])
    .gte("start_at", dayStart)
    .lte("start_at", dayEnd)
    .neq("status", "cancelled")
    .order("start_at");

  return (blocks ?? []).map((block) => {
    const task = taskById.get(block.task_id);
    return { ...block, taskTitle: task?.title ?? "Tarefa", taskClientId: task?.client_id ?? null };
  });
}

export type ConflictCheck = { hasConflict: boolean; conflicts: TimeBlockWithTask[] };

/** Conflito (§19) — checa contra a agenda do RESPONSÁVEL da tarefa (não de quem está criando o
 *  bloco): dois blocos de tarefas do mesmo `assignee_id` que se sobrepõem. Sobreposição clássica
 *  de intervalos: `start_a < end_b AND start_b < end_a`. */
export async function checkTimeBlockConflictAction(assigneeId: string, startAtISO: string, endAtISO: string, excludeTaskId?: string): Promise<ConflictCheck> {
  const supabase = await createClient();
  const { data: theirTaskIdsRows } = await supabase.from("tasks").select("id, title, client_id").eq("assignee_id", assigneeId);
  const relevantTaskIds = (theirTaskIdsRows ?? []).filter((t) => t.id !== excludeTaskId).map((t) => t.id);
  if (relevantTaskIds.length === 0) return { hasConflict: false, conflicts: [] };

  const taskById = new Map((theirTaskIdsRows ?? []).map((t) => [t.id, t]));
  // `startAtISO` já vem com offset (`brasiliaDateTimeToISO`) — os 10 primeiros caracteres
  // continuam sendo a data-calendário pretendida, intocados pelo offset no final da string.
  const dayISO = startAtISO.slice(0, 10);
  const { data: blocks } = await supabase
    .from("time_blocks")
    .select("*")
    .in("task_id", relevantTaskIds)
    .gte("start_at", brasiliaDateTimeToISO(dayISO, "00:00"))
    .lte("start_at", brasiliaDateTimeToISO(dayISO, "23:59"))
    .neq("status", "cancelled");

  const newStart = new Date(startAtISO).getTime();
  const newEnd = new Date(endAtISO).getTime();
  const conflicts = (blocks ?? [])
    .filter((block) => {
      const blockStart = new Date(block.start_at).getTime();
      const blockEnd = new Date(block.end_at).getTime();
      return newStart < blockEnd && blockStart < newEnd;
    })
    .map((block) => {
      const task = taskById.get(block.task_id);
      return { ...block, taskTitle: task?.title ?? "Tarefa", taskClientId: task?.client_id ?? null };
    });

  return { hasConflict: conflicts.length > 0, conflicts };
}

/** Cria o bloco mesmo com conflito se `force` — a UI mostra o aviso primeiro (§19: "Manter mesmo
 *  assim" / "Escolher outro horário"), nunca impede sozinha. */
export async function createTimeBlockAction(taskId: string, startAtISO: string, endAtISO: string, force: boolean): Promise<ActionResult & { conflicts?: TimeBlockWithTask[] }> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "Sessão expirada — faça login de novo." };

  const supabase = await createClient();
  const { data: task } = await supabase.from("tasks").select("assignee_id").eq("id", taskId).maybeSingle();
  if (!task) return { ok: false, error: "Tarefa não encontrada." };

  if (!force && task.assignee_id) {
    const conflictCheck = await checkTimeBlockConflictAction(task.assignee_id, startAtISO, endAtISO, taskId);
    if (conflictCheck.hasConflict) return { ok: false, error: "Conflito de agenda.", conflicts: conflictCheck.conflicts };
  }

  const { data, error } = await supabase.from("time_blocks").insert({ task_id: taskId, start_at: startAtISO, end_at: endAtISO, created_by: userId }).select("id").single();
  if (error) return { ok: false, error: error.message };

  await supabase.from("events").insert({ entity_type: "time_block", entity_id: data.id, actor_id: userId, type: "time_block.created", metadata: { task_id: taskId } });

  revalidatePath("/workspace");
  return { ok: true };
}

export async function deleteTimeBlockAction(blockId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("time_blocks").delete().eq("id", blockId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/workspace");
  return { ok: true };
}

export async function completeTimeBlockAction(blockId: string): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  const supabase = await createClient();
  const { error } = await supabase.from("time_blocks").update({ status: "done" }).eq("id", blockId);
  if (error) return { ok: false, error: error.message };
  if (userId) {
    await supabase.from("events").insert({ entity_type: "time_block", entity_id: blockId, actor_id: userId, type: "time_block.completed", metadata: {} });
  }
  revalidatePath("/workspace");
  return { ok: true };
}

/** Cria vários blocos de uma vez ("Planejar bloco"/"Aplicar plano", §11/§21) — mesma checagem de
 *  conflito por item; para na primeira falha e devolve quantos já foram criados, pra UI poder
 *  explicar exatamente onde parou (nunca finge sucesso total numa falha parcial). */
export async function createTimeBlocksBatchAction(
  blocks: { taskId: string; startAtISO: string; endAtISO: string }[],
  force: boolean,
): Promise<ActionResult & { createdCount: number }> {
  let createdCount = 0;
  for (const block of blocks) {
    const result = await createTimeBlockAction(block.taskId, block.startAtISO, block.endAtISO, force);
    if (!result.ok) return { ok: false, error: result.error, createdCount };
    createdCount += 1;
  }
  return { ok: true, createdCount };
}
