import { Lock, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AchievementWithStatus } from "@/lib/gamification/queries";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

/** Bloqueada/desbloqueada — `--brand-subtle`/`--brand-subtle-border` pro estado desbloqueado
 *  (mesmo tratamento que `EmptyState` já usa pro ícone em destaque, sem inventar cor nova). Nunca
 *  marcada manualmente — `unlockedAt` vem de `user_achievements`, escrito só por
 *  `check_achievements` (SQL) contra dado real. */
export function AchievementCard({ achievement }: { achievement: AchievementWithStatus }) {
  const unlocked = achievement.unlockedAt != null;
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-xl border p-4 text-center",
        unlocked ? "border-brand-subtle-border bg-brand-subtle" : "border-border/60 bg-card",
      )}
    >
      <span className={cn("flex size-10 items-center justify-center rounded-full", unlocked ? "bg-background text-brand" : "bg-muted text-muted-foreground/50")}>
        {unlocked ? <Trophy className="size-5" /> : <Lock className="size-4" />}
      </span>
      <div className="flex flex-col gap-0.5">
        <span className={cn("text-xs font-medium", !unlocked && "text-muted-foreground")}>{achievement.title}</span>
        <span className="text-[11px] text-muted-foreground">{achievement.description}</span>
        {unlocked && <span className="text-[10px] text-muted-foreground/70">{dateFormatter.format(new Date(achievement.unlockedAt as string))}</span>}
      </div>
    </div>
  );
}
