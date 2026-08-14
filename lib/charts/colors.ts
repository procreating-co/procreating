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

/**
 * Cor de marca do produto (mesmo valor de `--brand` em `app/globals.css`) — pra gráficos onde a
 * série principal merece o mesmo dourado usado em ação primária/métrica-âncora (ex.: a série de
 * "Receita" no gráfico de evolução do Financeiro). Nunca usar pra mais de uma série no mesmo
 * gráfico — é identidade de marca, não uma categórica.
 */
export const CHART_BRAND = "oklch(0.8 0.095 90)";

/** Cores de status — mesmos valores de `--success`/`--warning`/`--danger`/`--muted-foreground`
 *  em `app/globals.css`, não uma paleta paralela. `warning` deliberadamente distante de
 *  `CHART_BRAND` (ΔE ≈16, calculado antes de aplicar) pra nunca ficar parecido com a cor de
 *  marca quando os dois aparecem no mesmo gráfico. */
export const CHART_STATUS = {
  positive: "oklch(0.72 0.17 155)", // --success
  warning: "oklch(0.74 0.19 38)", // --warning
  danger: "oklch(0.66 0.2 25)", // --danger
  neutral: "oklch(0.55 0.015 90)", // --muted-foreground
} as const;
