/**
 * Rampa sequencial de gráfico — os mesmos 5 valores de `--chart-1`..`--chart-5` em
 * `app/globals.css` (claro→escuro, monocromática, sem matiz — a linguagem visual "sem
 * gradiente/sem cor decorativa" que o resto do dashboard já usa). Hardcoded aqui em vez de lido
 * via `var(--color-chart-N)` porque nem toda versão do Recharts resolve custom property em
 * atributo SVG de forma confiável — mesmo valor, duas formas de chegar até ele. Se
 * `app/globals.css` mudar esses tokens, atualize aqui também.
 */
export const CHART_SEQUENTIAL = [
  "oklch(0.94 0.005 90)",
  "oklch(0.72 0.01 90)",
  "oklch(0.52 0.015 90)",
  "oklch(0.35 0.01 90)",
  "oklch(0.20 0.008 90)",
] as const;

/** Cores de status já usadas em `StatusDot` (`components/dashboard/status-dot.tsx`) — mesmos
 *  hex/token, não uma paleta nova só pra gráfico. */
export const CHART_STATUS = {
  positive: "oklch(0.7 0.15 155)", // emerald-400
  warning: "oklch(0.77 0.15 75)", // amber-400
  danger: "oklch(0.65 0.2 25)", // red-400
  neutral: "oklch(0.55 0.015 90)", // muted-foreground
} as const;
