import "server-only";
import { createClient } from "@/lib/supabase/server";
import { todayParts } from "@/lib/date";
import type { RevenueGoal } from "@/lib/supabase/types/database";

/** Meta do mês corrente — `null` se ninguém definiu ainda (nunca inventa um valor). Única fonte
 *  de verdade pro Dashboard, pro form em Configurações → General, e pro Planejamento
 *  (`lib/simulation/defaults.ts`). "Corrente" = calendário de Brasília (`todayParts()`), nunca
 *  `new Date()` cru — era exatamente esse o bug antes daqui: em qualquer horário entre 21h e
 *  meia-noite em Brasília, o servidor (UTC, Vercel) já está no dia seguinte, e virando de mês
 *  nesse intervalo, isto buscava o mês ERRADO. */
export async function getCurrentMonthGoal(): Promise<RevenueGoal | null> {
  const supabase = await createClient();
  const { year, month } = todayParts();
  const monthKey = `${year}-${String(month).padStart(2, "0")}-01`;
  const { data } = await supabase.from("revenue_goals").select("*").eq("month", monthKey).maybeSingle();
  return data ?? null;
}
