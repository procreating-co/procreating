import { describe, expect, it, vi } from "vitest";
import { resolvePeriod, isPeriodPreset, PERIOD_PRESETS, type PeriodPreset } from "@/lib/comercial/period";
import { addDaysISO, todayISO, todayParts } from "@/lib/date";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

describe("resolvePeriod — os 7 presets, timezone-safe (offset -03:00 fixo)", () => {
  it("todos os presets retornam um range com offset -03:00 explícito", () => {
    for (const preset of PERIOD_PRESETS) {
      const range = resolvePeriod(preset);
      expect(range.fromISO).toMatch(/-03:00$/);
      expect(range.toISO).toMatch(/-03:00$/);
      expect(range.fromISO < range.toISO).toBe(true);
    }
  });

  it("'today' — de hoje 00:00 (inclusive) até amanhã 00:00 (exclusivo)", () => {
    const range = resolvePeriod("today");
    expect(range.fromISO).toBe(`${todayISO()}T00:00:00-03:00`);
    expect(range.toISO).toBe(`${addDaysISO(todayISO(), 1)}T00:00:00-03:00`);
    expect(range.label).toBe("Hoje");
  });

  it("'7d' — 7 dias incluindo hoje (hoje-6 até amanhã)", () => {
    const range = resolvePeriod("7d");
    expect(range.fromISO).toBe(`${addDaysISO(todayISO(), -6)}T00:00:00-03:00`);
    expect(range.toISO).toBe(`${addDaysISO(todayISO(), 1)}T00:00:00-03:00`);
  });

  it("'30d' — 30 dias incluindo hoje (hoje-29 até amanhã)", () => {
    const range = resolvePeriod("30d");
    expect(range.fromISO).toBe(`${addDaysISO(todayISO(), -29)}T00:00:00-03:00`);
  });

  it("'month' — dia 01 do mês corrente até amanhã", () => {
    const { year, month } = todayParts();
    const range = resolvePeriod("month");
    expect(range.fromISO).toBe(`${year}-${pad(month)}-01T00:00:00-03:00`);
    expect(range.toISO).toBe(`${addDaysISO(todayISO(), 1)}T00:00:00-03:00`);
  });

  it("'year' — 1º de janeiro do ano corrente até amanhã", () => {
    const { year } = todayParts();
    const range = resolvePeriod("year");
    expect(range.fromISO).toBe(`${year}-01-01T00:00:00-03:00`);
  });
});

describe("isPeriodPreset", () => {
  it("aceita os 7 presets válidos", () => {
    for (const preset of PERIOD_PRESETS) expect(isPeriodPreset(preset)).toBe(true);
  });

  it("rejeita string inválida, undefined e 'custom' (não implementado)", () => {
    expect(isPeriodPreset("custom")).toBe(false);
    expect(isPeriodPreset("qualquer-coisa")).toBe(false);
    expect(isPeriodPreset(undefined)).toBe(false);
  });
});

/**
 * Casos de virada de mês/ano — o tipo de bug que já aconteceu de verdade neste projeto (`lib/
 * dashboard/goals.ts`/`lib/comercial/metrics.ts`, ambos corrigidos por usarem `new Date()` cru
 * perto da virada). `resolvePeriod` em si já é timezone-safe, mas os testes acima rodam sempre
 * na data REAL de hoje — nunca exercitam janeiro (pra `last_month`) nem o primeiro/último mês de
 * um trimestre, a menos que a sessão rode exatamente nesses dias. Aqui a data é fixada via mock
 * de `@/lib/date` (só `todayISO`/`todayParts` — `addDaysISO` continua o de verdade, importado via
 * `importActual`), pra cobrir essas viradas de propósito, em qualquer dia que o teste rodar.
 */
describe("resolvePeriod — virada de mês/ano (data fixada via mock)", () => {
  async function resolveWithFixedToday(dateISO: string, parts: { year: number; month: number; day: number }, preset: PeriodPreset) {
    vi.resetModules();
    vi.doMock("@/lib/date", async () => {
      const actual = await vi.importActual<typeof import("@/lib/date")>("@/lib/date");
      return { ...actual, todayISO: () => dateISO, todayParts: () => parts };
    });
    const { resolvePeriod: resolveFixed } = await import("@/lib/comercial/period");
    const result = resolveFixed(preset);
    vi.doUnmock("@/lib/date");
    return result;
  }

  it("'last_month' em janeiro → dezembro do ANO ANTERIOR, não mês 0", async () => {
    const range = await resolveWithFixedToday("2027-01-15", { year: 2027, month: 1, day: 15 }, "last_month");
    expect(range.fromISO).toBe("2026-12-01T00:00:00-03:00");
    expect(range.toISO).toBe("2027-01-01T00:00:00-03:00");
  });

  it("'last_month' num mês qualquer (não-janeiro) → mês anterior, mesmo ano", async () => {
    const range = await resolveWithFixedToday("2026-08-20", { year: 2026, month: 8, day: 20 }, "last_month");
    expect(range.fromISO).toBe("2026-07-01T00:00:00-03:00");
    expect(range.toISO).toBe("2026-08-01T00:00:00-03:00");
  });

  it("'quarter' no primeiro mês do trimestre (abril, Q2) → começa no próprio mês", async () => {
    const range = await resolveWithFixedToday("2026-04-05", { year: 2026, month: 4, day: 5 }, "quarter");
    expect(range.fromISO).toBe("2026-04-01T00:00:00-03:00");
  });

  it("'quarter' no último mês do trimestre (dezembro, Q4) → começa em outubro, não dezembro", async () => {
    const range = await resolveWithFixedToday("2026-12-20", { year: 2026, month: 12, day: 20 }, "quarter");
    expect(range.fromISO).toBe("2026-10-01T00:00:00-03:00");
  });

  it("'quarter' no mês do meio (fevereiro, Q1) → começa em janeiro", async () => {
    const range = await resolveWithFixedToday("2026-02-10", { year: 2026, month: 2, day: 10 }, "quarter");
    expect(range.fromISO).toBe("2026-01-01T00:00:00-03:00");
  });
});
