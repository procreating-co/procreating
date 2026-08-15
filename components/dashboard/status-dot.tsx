import { cn } from "@/lib/utils";

export type StatusTone = "active" | "pending" | "neutral" | "danger";

/**
 * Cores vêm dos tokens semânticos de `app/globals.css` (`--success`/`--warning`/`--danger`),
 * não mais de classes Tailwind cravadas (`emerald-400` etc.) — Fase B (redesign), um só lugar
 * pra ajustar o tom de cada estado no produto inteiro. Deliberadamente NUNCA usa `--brand`: cor
 * de marca e cor de status são famílias separadas, pra "isto precisa de atenção" nunca ficar
 * parecido com "ação primária" (ver nota em app/globals.css sobre a distância calculada entre
 * as duas).
 */
/* Pill com fundo suave por status (Warm Ivory: --success-subtle etc.) em vez de opacidade sobre
 * a cor cheia — mais legível e combina com o resto da paleta ("papel premium", nunca
 * translúcido). Fora do `.os-shell` (dark/admin), os tokens `-subtle` caem no fallback = mesma
 * cor cheia (ver `@theme inline`), então isto continua funcionando lá, só sem o preenchimento
 * diferenciado. */
const TONE_STYLES: Record<StatusTone, { pill: string; dot: string }> = {
  active: { pill: "border-success/25 bg-success-subtle text-success", dot: "bg-success" },
  pending: { pill: "border-warning/25 bg-warning-subtle text-warning", dot: "bg-warning" },
  neutral: { pill: "border-border/60 bg-muted text-muted-foreground", dot: "bg-muted-foreground/50" },
  danger: { pill: "border-danger/25 bg-danger-subtle text-danger", dot: "bg-danger" },
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
