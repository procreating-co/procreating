"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/supabase/current-user";
import type { TaskInput } from "@/lib/tasks/types";
import type { FocusSessionMode, TaskStatus } from "@/lib/supabase/types/database";
import type { QuickParseClient } from "@/lib/tasks/quick-parse";

export type ActionResult = { ok: true } | { ok: false; error: string };

/** Clientes reais pro parser resolver ("editar vídeo Elenita" → cliente) — mesma tabela que todo
 *  o resto do ERP usa, sem lista paralela nenhuma. Nome só, é tudo que o parser precisa. */
export async function listClientsForTasksAction(): Promise<QuickParseClient[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("clients").select("id, name").order("name");
  return data ?? [];
}

/** Só os grupos que têm alguma tarefa vencendo hoje/atrasada (join manual, mesmo padrão do resto
 *  do projeto) — não a tabela inteira, que cresceria sem limite conforme lotes antigos se
 *  acumulam (§28 — não carregar tudo indefinidamente). */
export async function listTaskGroupsForTasksAction(taskIds: string[]): Promise<{ id: string; title: string }[]> {
  if (taskIds.length === 0) return [];
  const supabase = await createClient();
  const { data: groupIdsData } = await supabase.from("tasks").select("group_id").in("id", taskIds).not("group_id", "is", null);
  const groupIds = Array.from(new Set((groupIdsData ?? []).map((row) => row.group_id).filter((id): id is string => id != null)));
  if (groupIds.length === 0) return [];
  const { data } = await supabase.from("task_groups").select("id, title").in("id", groupIds);
  return data ?? [];
}

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/** Próxima posição livre no fim da lista (espaçamento de 1000 — ver migration
 *  `20260827000000_task_intelligence.sql`). Uma leitura só, sem travar a tabela inteira: pior
 *  caso (2 criações simultâneas) as duas pegam o mesmo valor e empatam na ordenação, não quebra
 *  nada — próxima reordenação manual já resolve o empate. */
async function nextPosition(supabase: SupabaseServerClient): Promise<number> {
  const { data } = await supabase.from("tasks").select("position").order("position", { ascending: false }).limit(1);
  return (data?.[0]?.position ?? 0) + 1000;
}

function revalidateTaskPaths() {
  revalidatePath("/workspace");
  revalidatePath("/");
  revalidatePath("/clientes/onboarding");
}

export async function createTaskAction(input: TaskInput): Promise<ActionResult> {
  if (!input.title.trim()) return { ok: false, error: "Informe o título da tarefa." };

  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "Sessão expirada — faça login de novo." };

  const supabase = await createClient();
  const position = await nextPosition(supabase);
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title: input.title,
      assignee_id: input.assigneeId,
      due_date: input.dueDate,
      due_time: input.dueTime ?? null,
      context_type: input.contextType ?? null,
      context_id: input.contextId ?? null,
      client_id: input.clientId ?? null,
      estimated_minutes: input.estimatedMinutes ?? null,
      priority: input.priority ?? null,
      group_id: input.groupId ?? null,
      position,
      created_by: userId,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  await supabase.from("events").insert({ entity_type: "task", entity_id: data.id, actor_id: userId, type: "task.created", metadata: { assignee_id: input.assigneeId } });

  revalidateTaskPaths();
  return { ok: true };
}

/** Entrada em lote (Task Intelligence) — cria o grupo (se houver título) e todas as tarefas
 *  dentro dele numa só chamada, posição incremental preservando a ordem em que o parser devolveu
 *  os itens. Cada item já vem com `assigneeId` resolvido pelo parser (ou `null` = usuário
 *  logado, decidido por quem chama antes de montar `items`). */
export type TaskBatchItemInput = TaskInput;

export async function createTaskBatchAction(groupTitle: string | null, items: TaskBatchItemInput[]): Promise<ActionResult & { groupId?: string | null }> {
  const validItems = items.filter((item) => item.title.trim());
  if (validItems.length === 0) return { ok: false, error: "Nenhuma tarefa reconhecida no texto." };

  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "Sessão expirada — faça login de novo." };

  const supabase = await createClient();

  let groupId: string | null = null;
  if (groupTitle) {
    const { data: group, error: groupError } = await supabase.from("task_groups").insert({ title: groupTitle, created_by: userId }).select("id").single();
    if (groupError) return { ok: false, error: groupError.message };
    groupId = group.id;
  }

  let position = await nextPosition(supabase);
  const rows = validItems.map((item) => {
    const row = {
      title: item.title,
      assignee_id: item.assigneeId,
      due_date: item.dueDate,
      due_time: item.dueTime ?? null,
      context_type: item.contextType ?? null,
      context_id: item.contextId ?? null,
      client_id: item.clientId ?? null,
      estimated_minutes: item.estimatedMinutes ?? null,
      priority: item.priority ?? null,
      group_id: groupId,
      position,
      created_by: userId,
    };
    position += 1000;
    return row;
  });

  const { data: created, error } = await supabase.from("tasks").insert(rows).select("id");
  if (error) return { ok: false, error: error.message };

  await supabase.from("events").insert(
    (created ?? []).map((task) => ({ entity_type: "task", entity_id: task.id, actor_id: userId, type: "task.created", metadata: { batch: true, group_id: groupId } })),
  );

  revalidateTaskPaths();
  return { ok: true, groupId };
}

export async function updateTaskStatusAction(taskId: string, status: TaskStatus): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").update({ status, updated_at: new Date().toISOString() }).eq("id", taskId);
  if (error) return { ok: false, error: error.message };

  if (userId) {
    await supabase.from("events").insert({ entity_type: "task", entity_id: taskId, actor_id: userId, type: status === "done" ? "task.completed" : "task.updated", metadata: { status } });
  }

  revalidateTaskPaths();
  return { ok: true };
}

/** Concluir/excluir/etc em várias tarefas de uma vez (seleção múltipla, §10 do pedido). */
export async function bulkUpdateTaskStatusAction(taskIds: string[], status: TaskStatus): Promise<ActionResult> {
  if (taskIds.length === 0) return { ok: true };
  const userId = await getCurrentUserId();
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").update({ status, updated_at: new Date().toISOString() }).in("id", taskIds);
  if (error) return { ok: false, error: error.message };

  if (userId) {
    await supabase
      .from("events")
      .insert(taskIds.map((id) => ({ entity_type: "task", entity_id: id, actor_id: userId, type: status === "done" ? "task.completed" : "task.updated", metadata: { status, bulk: true } })));
  }

  revalidateTaskPaths();
  return { ok: true };
}

export async function bulkDeleteTasksAction(taskIds: string[]): Promise<ActionResult> {
  if (taskIds.length === 0) return { ok: true };
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").delete().in("id", taskIds);
  if (error) return { ok: false, error: error.message };

  revalidateTaskPaths();
  return { ok: true };
}

/** "ERP totalmente funcional" — antes só dava pra criar e marcar feita; renomear, mudar data/
 *  hora/responsável ou desistir de uma tarefa exigia excluir e recriar (nem excluir existia). */
export async function updateTaskAction(taskId: string, input: TaskInput): Promise<ActionResult> {
  if (!input.title.trim()) return { ok: false, error: "Informe o título da tarefa." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({
      title: input.title,
      assignee_id: input.assigneeId,
      due_date: input.dueDate,
      due_time: input.dueTime ?? null,
      client_id: input.clientId ?? null,
      estimated_minutes: input.estimatedMinutes ?? null,
      priority: input.priority ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId);
  if (error) return { ok: false, error: error.message };

  revalidateTaskPaths();
  return { ok: true };
}

export async function deleteTaskAction(taskId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) return { ok: false, error: error.message };

  revalidateTaskPaths();
  return { ok: true };
}

/** Drag & drop (§8/§9) — só a tarefa movida é escrita; `newPosition` já vem calculada por quem
 *  chama (média entre vizinhos na lista, ou ±1000 na ponta) — nunca renumera a lista inteira. */
export async function reorderTaskAction(taskId: string, newPosition: number): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").update({ position: newPosition }).eq("id", taskId);
  if (error) return { ok: false, error: error.message };

  if (userId) {
    await supabase.from("events").insert({ entity_type: "task", entity_id: taskId, actor_id: userId, type: "task.reordered", metadata: { position: newPosition } });
  }
  // Sem `revalidatePath` de propósito — a lista já foi atualizada via optimistic UI no cliente;
  // um revalidate aqui rebuscaria a lista inteira do servidor só pra confirmar o que o cliente já
  // sabe, e um clique rápido de "mover mais uma vez" reverteria visualmente até a resposta voltar.
  return { ok: true };
}

// ============================================================================
// Focus Sessions — Timer livre + Pomodoro são o MESMO registro (`mode` diferencia). Ver migration
// `20260827000000_task_intelligence.sql`: nunca vira propriedade da task, é o "quanto tempo de
// verdade" gasto nela. `started_at` gravado no servidor é o que sobrevive a um refresh — o
// cliente sempre recalcula o elapsed a partir dele, nunca confia só num contador local.
// ============================================================================

export type FocusSessionResult = ActionResult & { sessionId?: string; startedAt?: string };

/** Uma sessão rodando por vez por usuário (não dá pra "iniciar" 2 timers ao mesmo tempo) — quem
 *  chama já deveria ter checado `getRunningFocusSessionAction` antes, mas a constraint real de
 *  negócio é aplicada aqui também, não só na UI. */
export async function startFocusSessionAction(taskId: string, mode: FocusSessionMode, plannedMinutes: number | null): Promise<FocusSessionResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "Sessão expirada — faça login de novo." };

  const supabase = await createClient();
  const { data: running } = await supabase.from("focus_sessions").select("id").eq("user_id", userId).is("ended_at", null).maybeSingle();
  if (running) return { ok: false, error: "Já existe um timer rodando — finalize antes de iniciar outro." };

  const { data, error } = await supabase
    .from("focus_sessions")
    .insert({ task_id: taskId, user_id: userId, mode, planned_minutes: plannedMinutes })
    .select("id, started_at")
    .single();
  if (error) return { ok: false, error: error.message };

  await supabase.from("tasks").update({ status: "in_progress", updated_at: new Date().toISOString() }).eq("id", taskId).neq("status", "done");
  await supabase.from("events").insert({ entity_type: "task", entity_id: taskId, actor_id: userId, type: "focus_session.started", metadata: { mode, planned_minutes: plannedMinutes } });

  revalidateTaskPaths();
  return { ok: true, sessionId: data.id, startedAt: data.started_at };
}

export type RunningFocusSession = {
  id: string;
  taskId: string;
  taskTitle: string;
  mode: FocusSessionMode;
  plannedMinutes: number | null;
  startedAt: string;
};

/** Pra sobreviver a um refresh — a página busca isso de novo no load e recalcula o cronômetro a
 *  partir de `startedAt`, sem depender de nenhum estado que só existisse no navegador. */
export async function getRunningFocusSessionAction(): Promise<RunningFocusSession | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const supabase = await createClient();
  const { data } = await supabase.from("focus_sessions").select("id, task_id, mode, planned_minutes, started_at").eq("user_id", userId).is("ended_at", null).maybeSingle();
  if (!data) return null;

  // Join manual em TypeScript, não embed do PostgREST — mesmo padrão de `lib/operacao/queries.ts`.
  const { data: task } = await supabase.from("tasks").select("title").eq("id", data.task_id).maybeSingle();
  return { id: data.id, taskId: data.task_id, taskTitle: task?.title ?? "Tarefa", mode: data.mode, plannedMinutes: data.planned_minutes, startedAt: data.started_at };
}

/** Fecha a sessão corrente — "Pause" e "Encerrar" chamam isto igual (a diferença é só se a UI
 *  oferece "retomar" depois, o que cria uma sessão NOVA pro mesmo task, nunca reabre esta). Ver
 *  comentário da migration: cada linha é um trecho contínuo de foco, não um cronômetro com
 *  pausa embutida — mais simples e já cobre o pedido (timer sobrevive a refresh, cada sessão
 *  fica registrada). */
export async function finishFocusSessionAction(sessionId: string, completed: boolean): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  const supabase = await createClient();

  const { data: session } = await supabase.from("focus_sessions").select("task_id, started_at").eq("id", sessionId).single();
  if (!session) return { ok: false, error: "Sessão não encontrada." };

  const durationSeconds = Math.max(0, Math.round((Date.now() - new Date(session.started_at).getTime()) / 1000));
  const { error } = await supabase.from("focus_sessions").update({ ended_at: new Date().toISOString(), duration_seconds: durationSeconds, completed }).eq("id", sessionId);
  if (error) return { ok: false, error: error.message };

  if (userId) {
    await supabase
      .from("events")
      .insert({ entity_type: "task", entity_id: session.task_id, actor_id: userId, type: "focus_session.completed", metadata: { session_id: sessionId, duration_seconds: durationSeconds, completed } });
  }

  revalidateTaskPaths();
  return { ok: true };
}
