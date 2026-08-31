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

  it("abreviação entre parênteses '(sex)' → sexta-feira, parênteses vazios somem do título", () => {
    const targetIndex = 5; // sexta
    const expectedOffset = (targetIndex - todayWeekdayIndex() + 7) % 7;
    const result = parseQuickTask("marcar captação (sex)");
    expect(result.dueDate).toBe(addDaysISO(todayISO(), expectedOffset));
    expect(result.title).toBe("marcar captação");
  });

  it("'ter' (verbo comum) fora de parênteses NÃO é lido como terça — só a abreviação entre parênteses conta", () => {
    const result = parseQuickTask("preciso ter uma reunião");
    expect(result.title).toBe("preciso ter uma reunião");
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

describe("parseQuickTask — duração estimada", () => {
  it("'2h' → 120min", () => {
    expect(parseQuickTask("editar vídeo 2h").estimatedMinutes).toBe(120);
  });

  it("'1h30' → 90min", () => {
    expect(parseQuickTask("editar vídeo 1h30").estimatedMinutes).toBe(90);
  });

  it("'90min' → 90min", () => {
    expect(parseQuickTask("editar vídeo 90min").estimatedMinutes).toBe(90);
  });

  it("'30 min' (com espaço) → 30min", () => {
    expect(parseQuickTask("editar vídeo 30 min").estimatedMinutes).toBe(30);
  });

  it("'2 horas' → 120min, palavra removida do título", () => {
    const result = parseQuickTask("editar vídeo 2 horas");
    expect(result.estimatedMinutes).toBe(120);
    expect(result.title).toBe("editar vídeo");
  });

  it("sem duração nenhuma → null", () => {
    expect(parseQuickTask("editar vídeo").estimatedMinutes).toBeNull();
  });
});

describe("parseQuickTask — pomodoro", () => {
  it("'pomodoro' sozinho → 1 pomodoro, 25min, executionMode pomodoro", () => {
    const result = parseQuickTask("escrever roteiro pomodoro");
    expect(result.executionMode).toBe("pomodoro");
    expect(result.pomodoros).toBe(1);
    expect(result.estimatedMinutes).toBe(25);
  });

  it("'3 pomodoros' → 3, 75min", () => {
    const result = parseQuickTask("escrever roteiro Pascoal amanhã 3 pomodoros", [], [{ id: "c1", name: "Pascoal Bombas" }]);
    expect(result.executionMode).toBe("pomodoro");
    expect(result.pomodoros).toBe(3);
    expect(result.estimatedMinutes).toBe(75);
    expect(result.clientId).toBe("c1");
    expect(result.title).toBe("escrever roteiro");
  });
});

describe("parseQuickTask — cliente", () => {
  const CLIENTS = [
    { id: "c1", name: "Dra. Elenita Luzardo" },
    { id: "c2", name: "Pascoal Bombas" },
    { id: "c3", name: "Maria das Graças" },
    { id: "c4", name: "Maria Tabarez Harmonização Facial LTDA" },
  ];

  it("1 cliente bate → resolve direto, palavra some do título", () => {
    const result = parseQuickTask("editar vídeo Elenita", [], CLIENTS);
    expect(result.clientId).toBe("c1");
    expect(result.clientName).toBe("Dra. Elenita Luzardo");
    expect(result.title).toBe("editar vídeo");
    expect(result.clientCandidates).toHaveLength(0);
  });

  it("nome que não bate com nenhum cliente → clientId null, palavra fica no título", () => {
    const result = parseQuickTask("Arrumar roteador", [], CLIENTS);
    expect(result.clientId).toBeNull();
    expect(result.title).toBe("Arrumar roteador");
  });

  it("2 clientes batem na mesma palavra ('Maria') → não escolhe, devolve candidatos", () => {
    const result = parseQuickTask("Reprogramar posts Maria", [], CLIENTS);
    expect(result.clientId).toBeNull();
    expect(result.clientCandidates).toHaveLength(2);
    expect(result.clientCandidates.map((c) => c.id).sort()).toEqual(["c3", "c4"]);
  });

  it("combinação: @responsável + cliente + data + duração, tudo junto", () => {
    const team = [{ id: "u1", name: "Eduardo Fraresso" }];
    const result = parseQuickTask("@Eduardo roteiro Pascoal amanhã 2h", team, CLIENTS);
    expect(result.assigneeId).toBe("u1");
    expect(result.clientId).toBe("c2");
    expect(result.dueDate).toBe(addDaysISO(todayISO(), 1));
    expect(result.estimatedMinutes).toBe(120);
    expect(result.title).toBe("roteiro");
  });
});
