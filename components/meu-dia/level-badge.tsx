import { cn } from "@/lib/utils";
import { levelForXp, levelProgressPercentage, xpIntoLevel, XP_PER_LEVEL } from "@/lib/gamification/level";
import { ProgressBar } from "@/components/dashboard/progress-bar";

/**
 * Nível + barra de progresso até o próximo — fórmula em `lib/gamification/level.ts` (100 XP por
 * nível, flat, visível: "X/100 XP pro próximo nível", sem curva escondida nem multiplicador
 * mágico). `--brand-subtle`/`--brand-subtle-border` no círculo (mesmo tratamento que
 * `EmptyState` já usa pro ícone em destaque) — sem inventar cor nova.
 */
export function LevelBadge({ totalXp, size = "md" }: { totalXp: number; size?: "md" | "lg" }) {
  const level = levelForXp(totalXp);
  const into = xpIntoLevel(totalXp);
  const percentage = levelProgressPercentage(totalXp);

  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full border border-brand-subtle-border bg-brand-subtle font-mono font-semibold tabular-nums text-brand",
          size === "lg" ? "size-16 text-2xl" : "size-10 text-base",
        )}
      >
        {level}
      </div>
      <div className={cn("flex flex-col gap-1.5", size === "lg" ? "min-w-56" : "min-w-40")}>
        <span className="text-xs text-muted-foreground">Nível {level}</span>
        <ProgressBar label={`${into} / ${XP_PER_LEVEL} XP`} percentage={percentage} />
      </div>
    </div>
  );
}
