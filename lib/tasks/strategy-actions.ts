"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/supabase/current-user";
import type { Database, TaskStrategy, TaskStrategyItem } from "@/lib/supabase/types/database";

type TaskStrategyItemInsert = Database["public"]["Tables"]["task_strategy_items"]["Insert"];

export type ActionResult = { ok: true } | { ok: false; error: string };

export type TaskStrategyWithItems = TaskStrategy & { items: TaskStrategyItem[] };

/** Molde só, sem itens — telas que só precisam do nome pra listar/escolher (ex.: comando
 *  `/strategy`) não pagam o custo de buscar os itens de todo mundo. */
export async function listTaskStrategiesAction(): Promise<TaskStrategy[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("task_strategies").select("*").order("title");
  return data ?? [];
}

export async function getTaskStrategyAction(strategyId: string): Promise<TaskStrategyWithItems | null> {
  const supabase = await createClient();
  const { data: strategy } = await supabase.from("task_strategies").select("*").eq("id", strategyId).maybeSingle();
  if (!strategy) return null;
  const { data: items } = await supabase.from("task_strategy_items").select("*").eq("strategy_id", strategyId).order("order_index");
  return { ...strategy, items: items ?? [] };
}

export type TaskStrategyItemInput = { title: string; estimatedMinutes: number | null };

/** Cria o molde inteiro numa chamada (título + itens, na ordem em que a UI mandar) — mesmo
 *  espírito de `createTaskBatchAction`, uma ação só em vez de N chamadas. `dependsOnPrevious`
 *  decide se cada item encadeia no anterior (checklist sequencial, o caso comum do §13) sem a
 *  UI precisar montar IDs de dependência na mão. */
export async function createTaskStrategyAction(title: string, description: string | null, items: TaskStrategyItemInput[], dependsOnPrevious: boolean): Promise<ActionResult> {
  if (!title.trim()) return { ok: false, error: "Informe o nome da estratégia." };
  const validItems = items.filter((item) => item.title.trim());
  if (validItems.length === 0) return { ok: false, error: "Adicione pelo menos uma tarefa ao molde." };

  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "Sessão expirada — faça login de novo." };

  const supabase = await createClient();
  const { data: strategy, error: strategyError } = await supabase.from("task_strategies").insert({ title, description, created_by: userId }).select("id").single();
  if (strategyError) return { ok: false, error: strategyError.message };

  let previousItemId: string | null = null;
  for (let index = 0; index < validItems.length; index += 1) {
    const payload: TaskStrategyItemInsert = {
      strategy_id: strategy.id,
      title: validItems[index].title,
      order_index: index,
      estimated_minutes: validItems[index].estimatedMinutes,
      depends_on_item_id: dependsOnPrevious ? previousItemId : null,
    };
    const insertResult = await supabase.from("task_strategy_items").insert(payload).select("id").single();
    if (insertResult.error) return { ok: false, error: insertResult.error.message };
    previousItemId = insertResult.data.id;
  }

  await supabase.from("events").insert({ entity_type: "task_strategy", entity_id: strategy.id, actor_id: userId, type: "strategy.created", metadata: { item_count: validItems.length } });

  revalidatePath("/workspace");
  return { ok: true };
}

export async function deleteTaskStrategyAction(strategyId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("task_strategies").delete().eq("id", strategyId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/workspace");
  return { ok: true };
}

/** Aplica o molde: cria 1 `task_group` (título da estratégia) + 1 `task` por item, na mesma
 *  ordem/posição do molde. `clientId`/`assigneeId` — únicos, escolhidos pela pessoa que aplica
 *  (não inventados por tarefa) — se o molde já tiver `default_assignee_id` num item, esse valor
 *  vence só PRA AQUELE item; `assigneeId` do parâmetro é o padrão pros demais. */
export async function applyTaskStrategyAction(strategyId: string, clientId: string | null, assigneeId: string | null, dueDate: string | null): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "Sessão expirada — faça login de novo." };

  const supabase = await createClient();
  const strategy = await getTaskStrategyAction(strategyId);
  if (!strategy || strategy.items.length === 0) return { ok: false, error: "Estratégia não encontrada ou sem itens." };

  const { data: group, error: groupError } = await supabase.from("task_groups").insert({ title: strategy.title, created_by: userId }).select("id").single();
  if (groupError) return { ok: false, error: groupError.message };

  const { data: lastPositionRows } = await supabase.from("tasks").select("position").order("position", { ascending: false }).limit(1);
  let position = (lastPositionRows?.[0]?.position ?? 0) + 1000;

  const rows = strategy.items.map((item) => {
    const row = {
      title: item.title,
      assignee_id: item.default_assignee_id ?? assigneeId,
      due_date: dueDate,
      due_time: null,
      client_id: clientId,
      estimated_minutes: item.estimated_minutes,
      group_id: group.id,
      position,
      created_by: userId,
      context_type: null,
      context_id: null,
    };
    position += 1000;
    return row;
  });

  const { error: tasksError } = await supabase.from("tasks").insert(rows);
  if (tasksError) return { ok: false, error: tasksError.message };

  await supabase.from("events").insert({ entity_type: "task_group", entity_id: group.id, actor_id: userId, type: "strategy.applied", metadata: { strategy_id: strategyId, item_count: rows.length } });

  revalidatePath("/workspace");
  revalidatePath("/");
  return { ok: true };
}
