import { cn } from "@/lib/utils";

export type StatusTone = "active" | "pending" | "neutral";

const TONE_STYLES: Record<StatusTone, { pill: string; dot: string }> = {
  active: { pill: "border-emerald-400/25 text-emerald-300/90", dot: "bg-emerald-400" },
  pending: { pill: "border-amber-400/25 text-amber-300/90", dot: "bg-amber-400" },
  neutral: { pill: "border-border/60 text-muted-foreground", dot: "bg-muted-foreground/50" },
};

/** Pill com ponto colorido pra estado de item de lista (ex.: status de projeto). */
export function StatusDot({ tone, label }: { tone: StatusTone; label: string }) {
  const styles = TONE_STYLES[tone];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs", styles.pill)}>
      <span className={cn("size-1.5 rounded-full", styles.dot)} />
      {label}
    </span>
  );
}
