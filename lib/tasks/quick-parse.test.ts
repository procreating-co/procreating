import { describe, expect, it } from "vitest";
import { parseQuickTask } from "@/lib/tasks/quick-parse";
import { addDaysISO, todayISO } from "@/lib/date";

const TEAM = [
  { id: "u1", name: "Eduardo Fraresso" },
  { id: "u2", name: "Beyoncé" }, // nome de um só token — ver nota no describe("@nome...") abaixo
];

/** Índice do dia da semana de hoje (0=domingo), calculado do mesmo jeito que `weekdayOf` interno
 *  do parser — os testes de "dia da semana" precisam ser corretos em QUALQUER dia que rodem, não
 *  fixos numa data hardcoded. */
function todayWeekdayIndex(): number {
  return new Date(`${todayISO()}T00:00:00Z`).getUTCDay();
}

const WEEKDAY_NAMES = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

describe("parseQuickTask — data", () => {
  it("sem palavra de data nenhuma → vira hoje (bug real reportado: sem isso a tarefa sumia)", () => {
    const result = parseQuickTask("revisar contrato");
    expect(result.dueDate).toBe(todayISO());
    expect(result.title).toBe("revisar contrato");
  });

  it("'amanhã' → hoje + 1 dia, palavra removida do título", () => {
    const result = parseQuickTask("revisar contrato amanhã");
    expect(result.dueDate).toBe(addDaysISO(todayISO(), 1));
    expect(result.title).toBe("revisar contrato");
  });

  it("'amanha' sem acento também funciona", () => {
    const result = parseQuickTask("revisar contrato amanha");
    expect(result.dueDate).toBe(addDaysISO(todayISO(), 1));
  });

  it("dia da semana que é HOJE mesmo → resolve pra hoje, não pra semana que vem", () => {
    const todayName = WEEKDAY_NAMES[todayWeekdayIndex()];
    const result = parseQuickTask(`ligar pro cliente ${todayName}`);
    expect(result.dueDate).toBe(todayISO());
  });

  it("dia da semana diferente de hoje → próxima ocorrência (2 dias à frente)", () => {
    const targetName = WEEKDAY_NAMES[(todayWeekdayIndex() + 2) % 7];
    const result = parseQuickTask(`ligar pro cliente ${targetName}`);
    expect(result.dueDate).toBe(addDaysISO(todayISO(), 2));
  });

  it("'próxima segunda' (com prefixo) também casa", () => {
    const targetIndex = (todayWeekdayIndex() + 3) % 7;
    const result = parseQuickTask(`ligar próxima ${WEEKDAY_NAMES[targetIndex]}`);
    const expectedOffset = (targetIndex - todayWeekdayIndex() + 7) % 7;
    expect(result.dueDate).toBe(addDaysISO(todayISO(), expectedOffset));
  });
});

describe("parseQuickTask — hora", () => {
  it("'às 15h' → 15:00", () => {
    expect(parseQuickTask("reunião às 15h").dueTime).toBe("15:00");
  });

  it("'15h30' (sem 'às') → 15:30", () => {
    expect(parseQuickTask("reunião 15h30").dueTime).toBe("15:30");
  });

  it("'15:00' (dois pontos) → 15:00", () => {
    expect(parseQuickTask("reunião 15:00").dueTime).toBe("15:00");
  });

  it("hora de 1 dígito ('9h') → preenche com zero à esquerda", () => {
    expect(parseQuickTask("reunião às 9h").dueTime).toBe("09:00");
  });

  it("sem hora nenhuma → null", () => {
    expect(parseQuickTask("revisar contrato").dueTime).toBeNull();
  });
});

describe("parseQuickTask — @responsável", () => {
  it("casa por primeiro nome", () => {
    const result = parseQuickTask("@Eduardo ligar pro cliente", TEAM);
    expect(result.assigneeId).toBe("u1");
    expect(result.assigneeName).toBe("Eduardo Fraresso");
    expect(result.title).toBe("ligar pro cliente");
  });

  it("casa por nome completo quando o nome cadastrado é um token só", () => {
    // Achado ao escrever este teste: a regex de menção é `@(\S+)` — para de capturar no primeiro
    // espaço, então "@Eduardo Fraresso" (dois tokens) NUNCA casa pelo nome completo de verdade,
    // só pelo primeiro nome ("Eduardo"). O branch `m.name.toLowerCase() === token` só é alcançável
    // quando o nome cadastrado É um token só (ex.: "Beyoncé") — é o que este teste cobre. Não é
    // uma regressão nem algo pra corrigir agora (fora do escopo desta rodada de hardening, que é
    // auditoria — não reabrir o parser); registrado aqui como comportamento real, não hipotético.
    const result = parseQuickTask("@Beyoncé revisar contrato", TEAM);
    expect(result.assigneeId).toBe("u2");
  });

  it("sem @menção → assigneeId null (quem chama decide o fallback, ex.: usuário logado)", () => {
    const result = parseQuickTask("revisar contrato", TEAM);
    expect(result.assigneeId).toBeNull();
    expect(result.assigneeName).toBeNull();
  });

  it("@menção que não bate com ninguém da equipe → ignorada, fica no título", () => {
    const result = parseQuickTask("@fulano revisar contrato", TEAM);
    expect(result.assigneeId).toBeNull();
    expect(result.title).toBe("@fulano revisar contrato");
  });
});

describe("parseQuickTask — combinação de tudo junto", () => {
  it("@responsável + data + hora, título limpo no final", () => {
    const result = parseQuickTask("@Eduardo editar vídeo amanhã às 15h", TEAM);
    expect(result.assigneeId).toBe("u1");
    expect(result.dueDate).toBe(addDaysISO(todayISO(), 1));
    expect(result.dueTime).toBe("15:00");
    expect(result.title).toBe("editar vídeo");
  });

  it("título vazio depois de tirar tudo → title vazio (chamador decide o erro)", () => {
    const result = parseQuickTask("@Eduardo amanhã às 15h", TEAM);
    expect(result.title).toBe("");
  });
});
