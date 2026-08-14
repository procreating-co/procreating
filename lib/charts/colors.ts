"use client";

import { useTheme } from "@/lib/theme/theme-provider";

/**
 * Rampa sequencial de gráfico — os mesmos valores de `--chart-1`..`--chart-5` em
 * `app/globals.css` (dentro do escopo `.os-shell`, claro→escuro na leitura visual, monocromática,
 * sem matiz decorativo). Hardcoded aqui em vez de lido via `var(--color-chart-N)` porque nem toda
 * versão do Recharts resolve custom property em atributo SVG de forma confiável.
 *
 * Duas variantes (light/dark) porque agora o shell interno tem os dois temas — Recharts não
 * reage a mudança de CSS var em runtime do jeito que uma classe Tailwind reagiria, então o valor
 * certo precisa ser escolhido em JS via `useChartColors()`, não fixo num módulo. Se
 * `app/globals.css` mudar esses tokens, atualize aqui também.
 */
const CHART_SEQUENTIAL_LIGHT = ["oklch(0.19 0.006 90)", "oklch(0.4 0.008 90)", "oklch(0.58 0.01 90)", "oklch(0.74 0.008 90)", "oklch(0.88 0.006 90)"] as const;
const CHART_SEQUENTIAL_DARK = ["oklch(0.94 0.003 90)", "oklch(0.78 0.006 90)", "oklch(0.6 0.008 90)", "oklch(0.42 0.006 90)", "oklch(0.28 0.005 90)"] as const;

/**
 * Cor de marca do produto (mesmo valor de `--brand`) — pra gráficos onde a série principal
 * merece o acento do produto (ex.: "Receita" no gráfico de evolução do Financeiro). Nunca usar
 * pra mais de uma série no mesmo gráfico — é identidade de marca, não uma categórica.
 */
const CHART_BRAND_LIGHT = "oklch(0.48 0.05 250)";
const CHART_BRAND_DARK = "oklch(0.72 0.08 250)";

/** Cores de status — mesmos valores de `--success`/`--warning`/`--danger`/`--muted-foreground`
 *  de cada tema, não uma paleta paralela. Matiz bem distante do novo `brand` (azul ~250°) em
 *  qualquer um dos dois — verde ~155°, laranja ~60°, vermelho ~25°, todos a mais de 90° de
 *  distância angular, folga bem maior que a que o dourado anterior exigia calcular. */
const CHART_STATUS_LIGHT = { positive: "oklch(0.5 0.14 155)", warning: "oklch(0.55 0.16 60)", danger: "oklch(0.55 0.19 25)", neutral: "oklch(0.48 0.01 90)" } as const;
const CHART_STATUS_DARK = { positive: "oklch(0.72 0.15 155)", warning: "oklch(0.74 0.17 60)", danger: "oklch(0.68 0.19 25)", neutral: "oklch(0.62 0.006 90)" } as const;

export type ChartColors = {
  sequential: readonly string[];
  brand: string;
  status: { positive: string; warning: string; danger: string; neutral: string };
};

/** Único jeito certo de pegar cor de gráfico dentro do shell interno — lê o tema atual do
 *  `ThemeProvider` e devolve o conjunto certo, em vez de qualquer componente importar a
 *  constante fixa direto (que ficaria presa no tema errado depois do toggle). */
export function useChartColors(): ChartColors {
  const { theme } = useTheme();
  return theme === "dark"
    ? { sequential: CHART_SEQUENTIAL_DARK, brand: CHART_BRAND_DARK, status: CHART_STATUS_DARK }
    : { sequential: CHART_SEQUENTIAL_LIGHT, brand: CHART_BRAND_LIGHT, status: CHART_STATUS_LIGHT };
}
