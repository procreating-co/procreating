"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireFinancialAccess } from "@/lib/auth/permissions";
import { todayParts } from "@/lib/date";

export type ActionResult = { ok: true } | { ok: false; error: string };

/** Cria ou atualiza a meta do mês CORRENTE — nunca mexe em meses passados (cada um preserva a
 *  meta que valia na época, ver `revenue_goals` na migration). `requireFinancialAccess()` —
 *  gap real encontrado ao expor esta action num lugar novo (calculadora de meta no Dashboard):
 *  antes só checava sessão, sem checar PAPEL — `dev_tester` (leitura mascarada) conseguiria
 *  escrever a meta oficial da empresa, o mesmo tipo de furo que o resto do Financeiro já fecha
 *  com este gate. Cobre os dois pontos de entrada (aqui e `RevenueGoalForm` em Configurações →
 *  Geral), mesma action. */
export async function setCurrentMonthGoalAction(amount: number): Promise<ActionResult> {
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: "Informe um valor de meta maior que zero." };

  const access = await requireFinancialAccess();
  if (!access.ok) return { ok: false, error: access.error };
  const userId = access.userId;

  const supabase = await createClient();
  const { year, month: monthNum } = todayParts();
  const month = `${year}-${String(monthNum).padStart(2, "0")}-01`;
  const { error } = await supabase.from("revenue_goals").upsert({ month, amount, created_by: userId }, { onConflict: "month" });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/configuracoes/geral");
  return { ok: true };
}
