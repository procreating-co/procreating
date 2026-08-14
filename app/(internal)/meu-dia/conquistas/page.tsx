import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/supabase/current-user";
import { getUserStats, listAchievements, getActivityHeatmap } from "@/lib/gamification/queries";
import { LevelBadge } from "@/components/meu-dia/level-badge";
import { StreakCounter } from "@/components/meu-dia/streak-counter";
import { AchievementGrid } from "@/components/meu-dia/achievement-grid";
import { ActivityHeatmap } from "@/components/meu-dia/activity-heatmap";
import { SectionHeader } from "@/components/dashboard/section-header";
import { EmptyInline } from "@/components/dashboard/empty-inline";
import { Trophy } from "lucide-react";
import { ADMIN_LOGIN_PATH } from "@/lib/admin/auth/constants";

export const metadata: Metadata = {
  title: "Conquistas — Procreating OS",
  robots: { index: false, follow: false },
};

/**
 * Trofeu do Workspace gamificado — nível/streak em versão maior, o catálogo inteiro de conquistas
 * (bloqueadas/desbloqueadas) e o heatmap de atividade dos últimos ~26 semanas. Tudo lido de
 * `lib/gamification/queries.ts`, contra dado real (`user_stats`/`xp_transactions`/
 * `work_sessions`) — nada aqui é marcado manualmente.
 */
export default async function ConquistasPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect(ADMIN_LOGIN_PATH);

  const [stats, achievements, heatmap] = await Promise.all([getUserStats(userId), listAchievements(userId), getActivityHeatmap(userId)]);

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-10 px-6 py-16 lg:px-10">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl">Conquistas</h1>
        <p className="max-w-lg text-sm text-muted-foreground">Seu progresso no Workspace — nível, sequência, conquistas desbloqueadas e atividade ao longo do tempo.</p>
      </div>

      {stats ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="flex flex-col justify-center rounded-xl border border-border/60 bg-card p-6 lg:col-span-2">
            <LevelBadge totalXp={stats.total_xp} size="lg" />
          </div>
          <div className="flex items-center">
            <StreakCounter currentStreak={stats.current_streak} longestStreak={stats.longest_streak} size="lg" />
          </div>
        </div>
      ) : (
        <EmptyInline icon={Trophy} label="Conclua sua primeira tarefa em Meu Dia pra começar a desbloquear conquistas." />
      )}

      <section className="flex flex-col gap-4">
        <SectionHeader title="Conquistas" description="Catálogo fixo — desbloqueado automaticamente conforme seu progresso real." />
        <AchievementGrid achievements={achievements} />
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeader title="Atividade" description="Últimos ~6 meses — tarefas concluídas e sessões de foco registradas, por dia." />
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <ActivityHeatmap days={heatmap} />
        </div>
      </section>
    </main>
  );
}
