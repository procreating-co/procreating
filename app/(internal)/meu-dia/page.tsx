import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/supabase/current-user";
import { listTasksByAssignee } from "@/lib/tasks/queries";
import { getUserStats, getActiveSession, getTodaySummary } from "@/lib/gamification/queries";
import { GreetingHeader } from "@/components/dashboard/greeting-header";
import { MyDayTasks } from "@/components/meu-dia/my-day-tasks";
import { LevelBadge } from "@/components/meu-dia/level-badge";
import { StreakCounter } from "@/components/meu-dia/streak-counter";
import { FocusTimer } from "@/components/meu-dia/focus-timer";
import { DailyMissions } from "@/components/meu-dia/daily-missions";
import { EmptyInline } from "@/components/dashboard/empty-inline";
import { SectionHeader } from "@/components/dashboard/section-header";
import { Flame } from "lucide-react";
import { ADMIN_LOGIN_PATH } from "@/lib/admin/auth/constants";

export const metadata: Metadata = {
  title: "Meu Dia — Procreating",
  robots: { index: false, follow: false },
};

/**
 * "Meu Espaço" desta fase: saudação + faixa de gamificação (nível/XP, streak, timer de foco,
 * missões diárias — Workspace gamificado, ver `lib/gamification/**`) + tarefas pessoais (`tasks`
 * com `context_type` nulo, mas também mostra qualquer outra atribuída ao usuário, ex.:
 * onboarding). `user_stats` pode não existir ainda (usuário nunca ganhou XP) — nesse caso a faixa
 * mostra um estado vazio honesto em vez de "Nível 1 / 0 XP / 0 dias" como se fosse dado real.
 */
export default async function MeuDiaPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect(ADMIN_LOGIN_PATH);

  const [tasks, stats, activeSession] = await Promise.all([listTasksByAssignee(userId), getUserStats(userId), getActiveSession(userId)]);
  const todaySummary = await getTodaySummary(userId, stats?.current_streak ?? 0);
  const openTasks = tasks.filter((task) => task.status !== "done");

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-10 px-6 py-16 lg:px-10">
      <GreetingHeader />

      <section className="flex flex-col gap-4">
        <SectionHeader title="Progresso" />
        {stats ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="flex flex-col justify-center rounded-xl border border-border/60 bg-card p-4">
              <LevelBadge totalXp={stats.total_xp} />
            </div>
            <div className="flex items-center">
              <StreakCounter currentStreak={stats.current_streak} longestStreak={stats.longest_streak} />
            </div>
            <FocusTimer initialSession={activeSession} tasks={openTasks} />
          </div>
        ) : (
          <EmptyInline icon={Flame} label="Conclua sua primeira tarefa pra começar a ganhar XP, nível e sequência." />
        )}
        <DailyMissions summary={todaySummary} />
      </section>

      <MyDayTasks tasks={tasks} userId={userId} />
    </main>
  );
}
