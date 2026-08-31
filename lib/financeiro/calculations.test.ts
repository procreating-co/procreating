import { describe, expect, it } from "vitest";
import { computeMargin, computeMrr, computeUpcomingReceivables, contractCoversMonth, groupRevenueByClient, sumAmount, sumAmountForMonth } from "@/lib/financeiro/calculations";
import { addDaysISO, monthKeyBounds, todayISO } from "@/lib/date";

describe("sumAmount", () => {
  it("soma o campo amount de uma lista", () => {
    expect(sumAmount([{ amount: 100 }, { amount: 50.5 }])).toBe(150.5);
  });

  it("lista vazia → 0", () => {
    expect(sumAmount([])).toBe(0);
  });

  it("amount vindo como string (Postgres numeric) é convertido corretamente", () => {
    expect(sumAmount([{ amount: "100.50" }, { amount: "49.50" }])).toBe(150);
  });
});

describe("sumAmountForMonth", () => {
  const rows = [
    { due_date: "2026-08-05", amount: 100 },
    { due_date: "2026-08-20", amount: 200 },
    { due_date: "2026-09-01", amount: 999 }, // mês diferente, não deve entrar
  ];

  it("soma só as linhas do mês pedido", () => {
    expect(sumAmountForMonth(rows, "08/2026")).toBe(300);
  });

  it("mês sem nenhuma linha → 0", () => {
    expect(sumAmountForMonth(rows, "01/2025")).toBe(0);
  });
});

describe("computeMrr", () => {
  it("soma monthly_value dos contratos", () => {
    expect(computeMrr([{ monthly_value: 1000 }, { monthly_value: 2500 }])).toBe(3500);
  });

  it("monthly_value null conta como 0, não quebra a soma", () => {
    expect(computeMrr([{ monthly_value: 1000 }, { monthly_value: null }])).toBe(1000);
  });

  it("sem contratos → 0", () => {
    expect(computeMrr([])).toBe(0);
  });
});

describe("contractCoversMonth", () => {
  const { start, end } = monthKeyBounds("09/2026"); // "2026-09-01".."2026-09-30"

  it("contrato em aberto (end_date null) iniciado antes do mês cobre o mês", () => {
    expect(contractCoversMonth({ start_date: "2026-01-15", end_date: null }, start, end)).toBe(true);
  });

  it("contrato que começa DEPOIS do mês não cobre", () => {
    expect(contractCoversMonth({ start_date: "2026-10-01", end_date: null }, start, end)).toBe(false);
  });

  it("contrato que termina ANTES do mês não cobre", () => {
    expect(contractCoversMonth({ start_date: "2026-01-01", end_date: "2026-08-31" }, start, end)).toBe(false);
  });

  it("contrato que termina DENTRO do mês cobre", () => {
    expect(contractCoversMonth({ start_date: "2026-01-01", end_date: "2026-09-15" }, start, end)).toBe(true);
  });

  it("borda exata — start_date no último dia do mês cobre", () => {
    expect(contractCoversMonth({ start_date: "2026-09-30", end_date: null }, start, end)).toBe(true);
  });

  it("borda exata — end_date no primeiro dia do mês cobre", () => {
    expect(contractCoversMonth({ start_date: "2026-01-01", end_date: "2026-09-01" }, start, end)).toBe(true);
  });

  it("borda exata — start_date um dia depois do fim do mês não cobre", () => {
    expect(contractCoversMonth({ start_date: "2026-10-01", end_date: null }, start, end)).toBe(false);
  });

  it("borda exata — end_date um dia antes do início do mês não cobre", () => {
    expect(contractCoversMonth({ start_date: "2026-01-01", end_date: "2026-08-31" }, start, end)).toBe(false);
  });

  it("contrato inteiramente dentro do mês (começa e termina no mesmo mês) cobre", () => {
    expect(contractCoversMonth({ start_date: "2026-09-05", end_date: "2026-09-20" }, start, end)).toBe(true);
  });
});

describe("computeMargin", () => {
  it("receita − despesas − custos", () => {
    expect(computeMargin(10000, 3000, 2000)).toBe(5000);
  });

  it("pode dar negativo (mês no vermelho) — nunca é forçado a 0", () => {
    expect(computeMargin(1000, 2000, 500)).toBe(-1500);
  });
});

describe("groupRevenueByClient", () => {
  const names = new Map([
    ["c1", "Cliente A"],
    ["c2", "Cliente B"],
  ]);

  it("agrupa cobranças do mesmo cliente numa entrada só", () => {
    const result = groupRevenueByClient(
      [
        { client_id: "c1", amount: 1000 },
        { client_id: "c1", amount: 500 }, // 2ª parcela do mesmo cliente no mês
        { client_id: "c2", amount: 300 },
      ],
      names,
    );
    const clienteA = result.find((r) => r.clientId === "c1");
    expect(clienteA?.amount).toBe(1500);
  });

  it("ordena do maior pro menor", () => {
    const result = groupRevenueByClient(
      [
        { client_id: "c2", amount: 300 },
        { client_id: "c1", amount: 1500 },
      ],
      names,
    );
    expect(result.map((r) => r.clientId)).toEqual(["c1", "c2"]);
  });

  it("client_id null vira 'Sem cliente vinculado', não quebra nem some", () => {
    const result = groupRevenueByClient([{ client_id: null, amount: 100 }], names);
    expect(result).toHaveLength(1);
    expect(result[0].clientName).toBe("Sem cliente vinculado");
  });

  it("client_id sem nome resolvido (removido) também vira 'Sem cliente vinculado'", () => {
    const result = groupRevenueByClient([{ client_id: "removido", amount: 100 }], names);
    expect(result[0].clientName).toBe("Sem cliente vinculado");
  });
});

describe("computeUpcomingReceivables", () => {
  const today = todayISO();

  it("inclui só status='pendente' dentro da janela — nunca 'atrasado' (alerta à parte)", () => {
    const revenue = [
      { id: "1", status: "pendente" as const, due_date: addDaysISO(today, 2), description: "Cliente X", amount: 100 },
      { id: "2", status: "atrasado" as const, due_date: addDaysISO(today, 2), description: "Cliente Y", amount: 200 },
    ];
    const result = computeUpcomingReceivables(revenue, today, 5);
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].description).toBe("Cliente X");
    expect(result.total).toBe(100);
  });

  it("exclui vencimento fora da janela (depois de today+windowDays)", () => {
    const revenue = [{ id: "1", status: "pendente" as const, due_date: addDaysISO(today, 10), description: "Cliente X", amount: 100 }];
    const result = computeUpcomingReceivables(revenue, today, 5);
    expect(result.entries).toHaveLength(0);
  });

  it("inclui vencimento hoje (limite inferior inclusivo)", () => {
    const revenue = [{ id: "1", status: "pendente" as const, due_date: today, description: "Cliente X", amount: 100 }];
    const result = computeUpcomingReceivables(revenue, today, 5);
    expect(result.entries).toHaveLength(1);
  });

  it("inclui vencimento exatamente no limite superior da janela (today+windowDays, inclusivo)", () => {
    const windowDays = 5;
    const revenue = [{ id: "1", status: "pendente" as const, due_date: addDaysISO(today, windowDays), description: "Cliente X", amount: 100 }];
    const result = computeUpcomingReceivables(revenue, today, windowDays);
    expect(result.entries).toHaveLength(1);
  });

  it("exclui vencimento no passado (antes de hoje)", () => {
    const revenue = [{ id: "1", status: "pendente" as const, due_date: addDaysISO(today, -1), description: "Cliente X", amount: 100 }];
    const result = computeUpcomingReceivables(revenue, today, 5);
    expect(result.entries).toHaveLength(0);
  });

  it("windowDays retorna no resultado (janela configurável, não uma constante fixa)", () => {
    expect(computeUpcomingReceivables([], today, 12).windowDays).toBe(12);
  });
});
