"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/supabase/current-user";
import { monthKeyFor } from "@/lib/dashboard/goals";

export type ActionResult = { ok: true } | { ok: false; error: string };

/** Cria ou atualiza a meta do mês CORRENTE — nunca mexe em meses passados (cada um preserva a
 *  meta que valia na época, ver `revenue_goals` na migration). */
export async function setCurrentMonthGoalAction(amount: number): Promise<ActionResult> {
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: "Informe um valor de meta maior que zero." };

  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "Sessão expirada — faça login de novo." };

  const supabase = await createClient();
  const month = monthKeyFor(new Date());
  const { error } = await supabase.from("revenue_goals").upsert({ month, amount, created_by: userId }, { onConflict: "month" });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/configuracoes/geral");
  return { ok: true };
}
