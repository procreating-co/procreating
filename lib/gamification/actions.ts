"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/supabase/current-user";
import type { GamificationRpcResult } from "@/lib/supabase/types/database";

export type GamificationActionResult = { ok: true; result: GamificationRpcResult } | { ok: false; error: string };

/**
 * Marca a tarefa como concluída + concede XP (RPC `complete_task_and_award_xp`, ver a migration
 * `20260814210000_workspace_gamification.sql`) — chamada pelo checkbox de "concluir" em
 * `my-day-tasks.tsx` no lugar de `updateTaskStatusAction` (que continua cobrindo os outros
 * status). Desmarcar uma tarefa (done → pending) NÃO reverte XP — já foi ganho de verdade; e
 * marcar de novo depois não duplica (índice único de `xp_transactions` no banco).
 */
export async function completeTaskAction(taskId: string): Promise<GamificationActionResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("complete_task_and_award_xp", { p_task_id: taskId });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/meu-dia");
  revalidatePath("/meu-dia/tarefas");
  revalidatePath("/meu-dia/conquistas");
  revalidatePath("/");
  return { ok: true, result: data as unknown as GamificationRpcResult };
}

export type StartSessionResult = { ok: true; sessionId: string } | { ok: false; error: string };

/**
 * Insert simples (sem RPC — uma tabela só). Verifica "já existe sessão ativa" antes de inserir —
 * o índice parcial `work_sessions_active_idx` garante isso no banco de qualquer forma, mas checar
 * antes dá um erro mais claro pra UI em vez de estourar a constraint.
 */
export async function startFocusSessionAction(taskId?: string | null): Promise<StartSessionResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "Sessão expirada — faça login de novo." };

  const supabase = await createClient();
  const { data: existing } = await supabase.from("work_sessions").select("id").eq("user_id", userId).is("ended_at", null).maybeSingle();
  if (existing) return { ok: false, error: "Já existe uma sessão de foco em andamento." };

  const { data, error } = await supabase
    .from("work_sessions")
    .insert({ user_id: userId, task_id: taskId ?? null })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  revalidatePath("/meu-dia");
  return { ok: true, sessionId: data.id };
}

export type StopSessionResult = { ok: true; result: GamificationRpcResult; durationSeconds: number } | { ok: false; error: string };

/** Fecha a sessão + concede XP se >= 10min (RPC `stop_focus_session`, mesma migration). */
export async function stopFocusSessionAction(sessionId: string): Promise<StopSessionResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("stop_focus_session", { p_session_id: sessionId });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/meu-dia");
  revalidatePath("/meu-dia/conquistas");
  const row = data as unknown as GamificationRpcResult & { durationSeconds: number };
  return { ok: true, result: row, durationSeconds: row.durationSeconds };
}
