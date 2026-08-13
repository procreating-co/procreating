/**
 * `pipeline_stages.color` (banco) é uma chave livre ("slate", "sky", ...), não um hex cru — o
 * mesmo espírito de `STAGE_DOT_CLASSES` em `lib/prospeccao/stages.ts`. Este mapa traduz pra
 * classes Tailwind; cores reaproveitadas das que o projeto já usa em `StatusDot`
 * (`components/dashboard/status-dot.tsx`: emerald/amber/red), não inventadas agora.
 */
export const STAGE_COLOR_CLASSES: Record<string, { dot: string; badge: string }> = {
  slate: { dot: "bg-muted-foreground/50", badge: "border-border/60 text-muted-foreground" },
  sky: { dot: "bg-sky-400", badge: "border-sky-400/25 text-sky-300/90" },
  violet: { dot: "bg-violet-400", badge: "border-violet-400/25 text-violet-300/90" },
  amber: { dot: "bg-amber-400", badge: "border-amber-400/25 text-amber-300/90" },
  orange: { dot: "bg-orange-400", badge: "border-orange-400/25 text-orange-300/90" },
  emerald: { dot: "bg-emerald-400", badge: "border-emerald-400/25 text-emerald-300/90" },
  red: { dot: "bg-red-400", badge: "border-red-400/25 text-red-300/90" },
};

const FALLBACK = STAGE_COLOR_CLASSES.slate;

export function stageColorClasses(color: string) {
  return STAGE_COLOR_CLASSES[color] ?? FALLBACK;
}
