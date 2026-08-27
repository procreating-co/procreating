import { describe, expect, it } from "vitest";
import { addDaysISO, brasiliaDateTimeToISO, currentMonthKey, dayOfMonthOf, formatDateOnly, lastMonthKeys, minutesOfDayInBrasilia, monthKeyOf, todayISO } from "@/lib/date";

describe("addDaysISO", () => {
  it("soma dias dentro do mesmo mês", () => {
    expect(addDaysISO("2026-08-10", 5)).toBe("2026-08-15");
  });

  it("vira o mês (31 de agosto + 1 dia)", () => {
    expect(addDaysISO("2026-08-31", 1)).toBe("2026-09-01");
  });

  it("vira o ano (31 de dezembro + 1 dia)", () => {
    expect(addDaysISO("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("aceita deslocamento negativo (volta o mês)", () => {
    expect(addDaysISO("2026-09-01", -1)).toBe("2026-08-31");
  });

  it("aceita deslocamento negativo (volta o ano)", () => {
    expect(addDaysISO("2027-01-01", -1)).toBe("2026-12-31");
  });

  it("deslocamento zero retorna a mesma data", () => {
    expect(addDaysISO("2026-08-15", 0)).toBe("2026-08-15");
  });

  it("atravessa fevereiro em ano bissexto", () => {
    expect(addDaysISO("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDaysISO("2028-02-29", 1)).toBe("2028-03-01");
  });

  it("atravessa fevereiro em ano não-bissexto", () => {
    expect(addDaysISO("2026-02-28", 1)).toBe("2026-03-01");
  });
});

describe("monthKeyOf", () => {
  it("extrai MM/YYYY de uma data-calendário", () => {
    expect(monthKeyOf("2026-08-15")).toBe("08/2026");
  });

  it("não sofre viés de fuso — não usa new Date() por baixo", () => {
    // Regressão-alvo: `new Date("2026-01-01").getMonth()` já reintroduziria o bug de fuso que
    // lib/date.ts existe pra evitar. `monthKeyOf` fatia a string direto.
    expect(monthKeyOf("2026-01-01")).toBe("01/2026");
    expect(monthKeyOf("2026-12-31")).toBe("12/2026");
  });
});

describe("dayOfMonthOf", () => {
  it("extrai o dia como número", () => {
    expect(dayOfMonthOf("2026-08-05")).toBe(5);
    expect(dayOfMonthOf("2026-08-31")).toBe(31);
  });
});

describe("lastMonthKeys", () => {
  it("retorna N meses terminando no mês corrente, do mais antigo pro mais recente", () => {
    const keys = lastMonthKeys(6);
    expect(keys).toHaveLength(6);
    expect(keys[keys.length - 1]).toBe(currentMonthKey());
  });

  it("cada chave é consecutiva (vira ano corretamente na janela)", () => {
    const keys = lastMonthKeys(3);
    for (let i = 1; i < keys.length; i += 1) {
      const [prevMonth, prevYear] = keys[i - 1].split("/").map(Number);
      const [month, year] = keys[i].split("/").map(Number);
      const prevTotal = prevYear * 12 + prevMonth;
      const total = year * 12 + month;
      expect(total).toBe(prevTotal + 1);
    }
  });

  it("count=1 retorna só o mês corrente", () => {
    expect(lastMonthKeys(1)).toEqual([currentMonthKey()]);
  });
});

describe("todayISO", () => {
  it("retorna uma data-calendário no formato YYYY-MM-DD", () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("formatDateOnly", () => {
  it("formata sem depender do fuso do runtime (ancorado em UTC de propósito)", () => {
    // `dateStyle: "short"` em pt-BR — só confirma que não lança e que o dia não "escorrega" pro
    // dia anterior/seguinte por causa do fuso local do processo (o bug de hidratação documentado
    // em lib/date.ts).
    const formatted = formatDateOnly("2026-08-31", { day: "2-digit", month: "2-digit", year: "numeric" });
    expect(formatted).toContain("31");
    expect(formatted).toContain("08");
  });
});

describe("brasiliaDateTimeToISO / minutesOfDayInBrasilia (Task Intelligence — Time Blocks)", () => {
  it("gera instante com offset -03:00 explícito, ida e volta bate", () => {
    const iso = brasiliaDateTimeToISO("2026-08-27", "14:00");
    expect(iso).toBe("2026-08-27T14:00:00-03:00");
    expect(minutesOfDayInBrasilia(iso)).toBe(14 * 60);
  });

  it("não sofre o viés de fuso do servidor — 14:00 Brasília continua 14:00 lido de volta, não 11:00 nem 17:00", () => {
    const iso = brasiliaDateTimeToISO("2026-08-27", "23:30");
    // Achado real que este teste existe pra prevenir: sem offset explícito, `new
    // Date("2026-08-27T23:30:00").getHours()` na Vercel (processo em UTC) leria 23:30 como UTC —
    // minutesOfDayInBrasilia converteria de volta pra 20:30 de Brasília, não 23:30.
    expect(minutesOfDayInBrasilia(iso)).toBe(23 * 60 + 30);
  });

  it("meia-noite de Brasília não vira o dia UTC anterior/seguinte", () => {
    const iso = brasiliaDateTimeToISO("2026-08-27", "00:00");
    expect(minutesOfDayInBrasilia(iso)).toBe(0);
  });
});
