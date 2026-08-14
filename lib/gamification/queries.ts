import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { AchievementDefinition, UserStats, WorkSession } from "@/lib/supabase/types/database";

export async function getUserStats(userId: string): Promise<UserStats | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("user_stats").select("*").eq("user_id", userId).maybeSingle();
  return data ?? null;
}

/** No máximo uma sessão sem `ended_at` por usuário (índice parcial no banco) — usado pro timer
 *  sobreviver a um refresh de página. */
export async function getActiveSession(userId: string): Promise<WorkSession | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("work_sessions").select("*").eq("user_id", userId).is("ended_at", null).maybeSingle();
  return data ?? null;
}

export type AchievementWithStatus = AchievementDefinition & { unlockedAt: string | null };

/** Catálogo inteiro (`achievement_definitions`) + o que este usuário já desbloqueou
 *  (`user_achievements`), ordenado por `sort_order` — a UI decide bloqueada/desbloqueada por
 *  `unlockedAt`. */
export async function listAchievements(userId: string): Promise<AchievementWithStatus[]> {
  const supabase = await createClient();
  const [{ data: definitions }, { data: unlocked }] = await Promise.all([
    supabase.from("achievement_definitions").select("*").order("sort_order"),
    supabase.from("user_achievements").select("achievement_key, unlocked_at").eq("user_id", userId),
  ]);
  const unlockedMap = new Map((unlocked ?? []).map((row) => [row.achievement_key, row.unlocked_at]));
  return (definitions ?? []).map((def) => ({ ...def, unlockedAt: unlockedMap.get(def.key) ?? null }));
}

export type HeatmapDay = { date: string; count: number };

const SP_DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" });

function toSaoPauloISODate(isoTimestamp: string): string {
  return SP_DATE_FORMATTER.format(new Date(isoTimestamp));
}

export type TodaySummary = { taskCompletedToday: boolean; focusLoggedToday: boolean; streakActive: boolean };

/**
 * As 3 missões diárias (`daily-missions.tsx`) computadas ao vivo a partir do estado real do dia —
 * display motivacional sobre dado que já existe, não um sistema de recompensa paralelo.
 * `currentStreak` vem de `user_stats` (já buscado pra outra coisa na página) em vez de recalculado
 * aqui.
 */
export async function getTodaySummary(userId: string, currentStreak: number): Promise<TodaySummary> {
  const supabase = await createClient();
  const todayISO = SP_DATE_FORMATTER.format(new Date());
  const tomorrowAnchor = new Date(`${todayISO}T12:00:00Z`);
  tomorrowAnchor.setUTCDate(tomorrowAnchor.getUTCDate() + 1);
  const tomorrowISO = tomorrowAnchor.toISOString().slice(0, 10);

  // São Paulo não observa horário de verão desde 2019 (offset fixo -03:00) — meia-noite de lá é
  // sempre 03:00 UTC do mesmo dia civil.
  const { data } = await supabase
    .from("xp_transactions")
    .select("reason")
    .eq("user_id", userId)
    .gte("created_at", `${todayISO}T03:00:00.000Z`)
    .lt("created_at", `${tomorrowISO}T03:00:00.000Z`);

  const reasons = new Set((data ?? []).map((row) => row.reason));
  return {
    taskCompletedToday: reasons.has("task_completed"),
    focusLoggedToday: reasons.has("focus_session"),
    streakActive: currentStreak > 0,
  };
}

/**
 * Um ponto por dia dos últimos `days` dias (padrão ~26 semanas) — intensidade = nº de eventos de
 * XP naquele dia (tarefa concluída + sessão de foco premiada), fuso America/Sao_Paulo (mesmo
 * critério de streak em `award_xp`, SQL). Tabelas são novas — sem histórico nenhum, o heatmap
 * começa vazio de verdade e vai preenchendo com uso real, nunca simula dado passado.
 */
export async function getActivityHeatmap(userId: string, days = 182): Promise<HeatmapDay[]> {
  const supabase = await createClient();
  const todayISO = SP_DATE_FORMATTER.format(new Date());
  // Âncora ao meio-dia UTC: Brasil não observa horário de verão desde 2019 (offset fixo -03:00),
  // então somar/subtrair dias em UTC aqui nunca cruza pro dia errado no calendário de São Paulo.
  const anchor = new Date(`${todayISO}T12:00:00Z`);
  const from = new Date(anchor);
  from.setUTCDate(from.getUTCDate() - (days - 1));

  const { data } = await supabase.from("xp_transactions").select("created_at").eq("user_id", userId).gte("created_at", from.toISOString());

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const day = toSaoPauloISODate(row.created_at);
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }

  return Array.from({ length: days }, (_, i) => {
    const date = new Date(anchor);
    date.setUTCDate(date.getUTCDate() - (days - 1 - i));
    const iso = date.toISOString().slice(0, 10);
    return { date: iso, count: counts.get(iso) ?? 0 };
  });
}
