"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/supabase/current-user";
import type { TaskInput } from "@/lib/tasks/types";
import type { TaskStatus } from "@/lib/supabase/types/database";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function createTaskAction(input: TaskInput): Promise<ActionResult> {
  if (!input.title.trim()) return { ok: false, error: "Informe o título da tarefa." };

  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "Sessão expirada — faça login de novo." };

  const supabase = await createClient();
  const { error } = await supabase.from("tasks").insert({
    title: input.title,
    assignee_id: input.assigneeId,
    due_date: input.dueDate,
    due_time: input.dueTime ?? null,
    context_type: input.contextType ?? null,
    context_id: input.contextId ?? null,
    created_by: userId,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/meu-dia");
  revalidatePath("/");
  return { ok: true };
}

export async function updateTaskStatusAction(taskId: string, status: TaskStatus): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").update({ status, updated_at: new Date().toISOString() }).eq("id", taskId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/meu-dia");
  revalidatePath("/");
  revalidatePath("/clientes/onboarding");
  return { ok: true };
}
