"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ClientStatus } from "@/lib/supabase/types/database";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function toggleOnboardingTaskAction(taskId: string, clientId: string, done: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("onboarding_tasks").update({ status: done ? "done" : "pending" }).eq("id", taskId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/clientes/${clientId}`);
  revalidatePath("/");
  return { ok: true };
}

export async function updateClientStatusAction(clientId: string, status: ClientStatus): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("clients").update({ status, updated_at: new Date().toISOString() }).eq("id", clientId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/clientes/${clientId}`);
  revalidatePath("/clientes");
  return { ok: true };
}
