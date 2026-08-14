import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { RevenueGoal } from "@/lib/supabase/types/database";

/** Chave "mês" consistente com `revenue_goals.month` (sempre dia 1) — YYYY-MM-01. */
export function monthKeyFor(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
}

/** Meta do mês corrente — `null` se ninguém definiu ainda (nunca inventa um valor). Única fonte
 *  de verdade pro Dashboard e pro form em Configurações → General. */
export async function getCurrentMonthGoal(): Promise<RevenueGoal | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("revenue_goals").select("*").eq("month", monthKeyFor(new Date())).maybeSingle();
  return data ?? null;
}
