import { addDaysISO, todayISO, todayParts } from "@/lib/date";

/**
 * Master prompt §66 — "Todo analytics deve possuir filtros consistentes. Presets: Today, 7 days,
 * 30 days, This month, Last month, Quarter, Year, Custom." Implementados os 7 presets fixos;
 * "Custom" (intervalo livre) fica de fora desta rodada — precisaria de um date-range picker novo
 * (2 campos + validação de intervalo), escopo maior que "adicionar filtro num analytics que já
 * existe". Documentado como próximo passo, não escondido.
 *
 * Todo range é um INSTANTE (timestamptz) em ISO 8601 com offset explícito `-03:00` (Brasília,
 * fixo — Brasil não tem mais horário de verão desde 2019) — nunca `new Date()` cru. `toISO` é
 * EXCLUSIVO (o dia seguinte ao fim do período), pra `gte`/`lt` cobrirem o último dia inteiro sem
 * precisar de aritmética de hora no call site.
 */
export type PeriodPreset = "today" | "7d" | "30d" | "month" | "last_month" | "quarter" | "year";

export type PeriodRange = { fromISO: string; toISO: string; label: string };

export const PERIOD_PRESETS: PeriodPreset[] = ["today", "7d", "30d", "month", "last_month", "quarter", "year"];

export const PERIOD_LABELS: Record<PeriodPreset, string> = {
  today: "Hoje",
  "7d": "7 dias",
  "30d": "30 dias",
  month: "Este mês",
  last_month: "Mês passado",
  quarter: "Trimestre",
  year: "Ano",
};

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toInstant(dateOnlyISO: string): string {
  return `${dateOnlyISO}T00:00:00-03:00`;
}

export function resolvePeriod(preset: PeriodPreset): PeriodRange {
  const today = todayISO();
  const tomorrow = addDaysISO(today, 1);
  const { year, month } = todayParts();
  const label = PERIOD_LABELS[preset];

  switch (preset) {
    case "today":
      return { fromISO: toInstant(today), toISO: toInstant(tomorrow), label };
    case "7d":
      return { fromISO: toInstant(addDaysISO(today, -6)), toISO: toInstant(tomorrow), label };
    case "30d":
      return { fromISO: toInstant(addDaysISO(today, -29)), toISO: toInstant(tomorrow), label };
    case "month": {
      const from = `${year}-${pad(month)}-01`;
      return { fromISO: toInstant(from), toISO: toInstant(tomorrow), label };
    }
    case "last_month": {
      const prevYear = month === 1 ? year - 1 : year;
      const prevMonth = month === 1 ? 12 : month - 1;
      const from = `${prevYear}-${pad(prevMonth)}-01`;
      const to = `${year}-${pad(month)}-01`;
      return { fromISO: toInstant(from), toISO: toInstant(to), label };
    }
    case "quarter": {
      const quarterStartMonth = Math.floor((month - 1) / 3) * 3 + 1;
      const from = `${year}-${pad(quarterStartMonth)}-01`;
      return { fromISO: toInstant(from), toISO: toInstant(tomorrow), label };
    }
    case "year": {
      const from = `${year}-01-01`;
      return { fromISO: toInstant(from), toISO: toInstant(tomorrow), label };
    }
  }
}

export function isPeriodPreset(value: string | undefined): value is PeriodPreset {
  return !!value && (PERIOD_PRESETS as string[]).includes(value);
}
