import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Chama + dias consecutivos — tom `--warning` (cor de status, nunca `--brand`, mesma regra de
 * `status-badge.tsx`). Só renderizado quando `currentStreak >= 1` (a RPC `award_xp` nunca grava um
 * streak zero — zero só existe como "ainda não existe `user_stats`", tratado como estado vazio
 * pelo caller, não como "0 dias" aqui).
 */
export function StreakCounter({ currentStreak, longestStreak, size = "md" }: { currentStreak: number; longestStreak: number; size?: "md" | "lg" }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-2.5">
      <span className={cn("flex items-center justify-center rounded-full bg-warning/10 text-warning", size === "lg" ? "size-10" : "size-8")}>
        <Flame className={size === "lg" ? "size-5" : "size-4"} />
      </span>
      <div className="flex flex-col">
        <span className={cn("font-semibold tabular-nums", size === "lg" ? "text-2xl" : "text-lg")}>
          {currentStreak} {currentStreak === 1 ? "dia" : "dias"}
        </span>
        <span className="text-xs text-muted-foreground">
          Recorde: {longestStreak} {longestStreak === 1 ? "dia" : "dias"}
        </span>
      </div>
    </div>
  );
}
