import { describe, expect, it } from "vitest";
import { parseSlashCommand } from "@/lib/tasks/slash-commands";

describe("parseSlashCommand", () => {
  it("/task @eduardo atualizar CRM amanhã", () => {
    const result = parseSlashCommand("/task @eduardo atualizar CRM amanhã");
    expect(result).toEqual({ type: "task", rest: "@eduardo atualizar CRM amanhã" });
  });

  it("/time escrever roteiro Pascoal 14:00 2h", () => {
    const result = parseSlashCommand("/time escrever roteiro Pascoal 14:00 2h");
    expect(result).toEqual({ type: "time", rest: "escrever roteiro Pascoal 14:00 2h" });
  });

  it("/pomodoro editar vídeo Elenita", () => {
    expect(parseSlashCommand("/pomodoro editar vídeo Elenita")).toEqual({ type: "pomodoro", rest: "editar vídeo Elenita" });
  });

  it("/plan hoje", () => {
    expect(parseSlashCommand("/plan hoje")).toEqual({ type: "plan", rest: "hoje" });
  });

  it("/strategy lançamento Elenita", () => {
    expect(parseSlashCommand("/strategy lançamento Elenita")).toEqual({ type: "strategy", rest: "lançamento Elenita" });
  });

  it("texto sem barra → null", () => {
    expect(parseSlashCommand("arrumar roteador")).toBeNull();
  });

  it("comando desconhecido → null (não finge reconhecer)", () => {
    expect(parseSlashCommand("/oi tudo bem")).toBeNull();
  });

  it("/plan sozinho, sem resto → rest vazio", () => {
    expect(parseSlashCommand("/plan")).toEqual({ type: "plan", rest: "" });
  });
});
