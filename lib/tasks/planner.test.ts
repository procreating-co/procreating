import { describe, expect, it } from "vitest";
import { clockToMinutes, minutesToClock, suggestSchedule } from "@/lib/tasks/planner";

describe("clockToMinutes / minutesToClock", () => {
  it("ida e volta", () => {
    expect(clockToMinutes("09:00")).toBe(540);
    expect(minutesToClock(540)).toBe("09:00");
    expect(minutesToClock(750)).toBe("12:30");
  });
});

describe("suggestSchedule — exemplo do pedido (§12)", () => {
  // 09:00–10:00 reunião, 11:00–12:00 Jiu-Jitsu, 14:00–16:00 "livre" (não é bloco, é ausência de bloco)
  const busy = [
    { startMinutes: clockToMinutes("09:00"), endMinutes: clockToMinutes("10:00"), label: "Reunião" },
    { startMinutes: clockToMinutes("11:00"), endMinutes: clockToMinutes("12:00"), label: "Jiu-Jitsu" },
  ];
  const tasks = [
    { id: "roteiro", title: "Roteiro", estimatedMinutes: 60 },
    { id: "crm", title: "CRM", estimatedMinutes: 30 },
    { id: "video", title: "Vídeo", estimatedMinutes: 90 },
  ];

  const result = suggestSchedule(tasks, busy);

  it("encaixa as 3 tarefas, nenhuma cai em cima de reunião/Jiu-Jitsu", () => {
    expect(result.scheduled).toHaveLength(3);
    expect(result.unscheduled).toHaveLength(0);
    for (const s of result.scheduled) {
      for (const b of busy) {
        const overlap = s.startMinutes < b.endMinutes && b.startMinutes < s.endMinutes;
        expect(overlap).toBe(false);
      }
    }
  });

  it("Roteiro (60min) usa exatamente o buraco livre 10:00–11:00", () => {
    const roteiro = result.scheduled.find((s) => s.taskId === "roteiro")!;
    expect(minutesToClock(roteiro.startMinutes)).toBe("10:00");
    expect(minutesToClock(roteiro.endMinutes)).toBe("11:00");
  });

  it("nenhuma tarefa sugerida se sobrepõe a outra tarefa sugerida", () => {
    const sorted = [...result.scheduled].sort((a, b) => a.startMinutes - b.startMinutes);
    for (let i = 1; i < sorted.length; i += 1) {
      expect(sorted[i].startMinutes >= sorted[i - 1].endMinutes).toBe(true);
    }
  });
});

describe("suggestSchedule — tarefa sem duração não entra no plano (nunca inventa)", () => {
  it("vai pra unscheduled, não ganha duração padrão inventada", () => {
    const result = suggestSchedule([{ id: "t1", title: "Sem estimativa", estimatedMinutes: null }], []);
    expect(result.scheduled).toHaveLength(0);
    expect(result.unscheduled).toHaveLength(1);
  });
});

describe("suggestSchedule — não cabe mais no dia", () => {
  it("tarefa que estouraria o fim do expediente vai pra unscheduled", () => {
    const result = suggestSchedule(
      [{ id: "t1", title: "Enorme", estimatedMinutes: 600 }],
      [],
      { startMinutes: clockToMinutes("17:00"), endMinutes: clockToMinutes("18:00") },
    );
    expect(result.scheduled).toHaveLength(0);
    expect(result.unscheduled).toHaveLength(1);
  });
});

describe("suggestSchedule — respeita 'agora', não sugere no passado", () => {
  it("cursor nunca antes de nowMinutes", () => {
    const result = suggestSchedule([{ id: "t1", title: "Tarde", estimatedMinutes: 30 }], [], undefined, clockToMinutes("15:00"));
    expect(result.scheduled[0].startMinutes).toBeGreaterThanOrEqual(clockToMinutes("15:00"));
  });
});
