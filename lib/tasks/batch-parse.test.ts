import { describe, expect, it } from "vitest";
import { parseTaskBatch } from "@/lib/tasks/batch-parse";

const CLIENTS = [
  { id: "elenita", name: "Dra. Elenita Luzardo" },
  { id: "kawhen", name: "Kawhen Confecções e Transportes LTDA" },
  { id: "aline", name: "Aline Menezes" },
  { id: "maria-gracas", name: "Maria das Graças" },
  { id: "maria-tabarez", name: "Maria Tabarez Harmonização Facial LTDA" },
  { id: "pascoal", name: "Pascoal Bombas" },
];

describe("parseTaskBatch — não é lote", () => {
  it("uma linha só → null (quem chama cai pro parseQuickTask normal)", () => {
    expect(parseTaskBatch("Arrumar roteador")).toBeNull();
  });
});

describe("parseTaskBatch — exemplo real do pedido", () => {
  const text = [
    "Operacional:",
    "Elenita: Roteiro Ep. 01, marcar reunião, acertar com convidadas, marcar captação sexta e mandar contrato.",
    "Kawhen: Anúncios.",
    "Aline: Anúncios.",
    "Maria: Reprogramar posts, mandar fotos e mandar contrato.",
    "Pascoal: Anúncios, marcar captação e escrever roteiros para amanhã.",
  ].join("\n");

  const result = parseTaskBatch(text, [], CLIENTS)!;

  it("reconhece 1 grupo: Operacional", () => {
    expect(result).not.toBeNull();
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0].title).toBe("Operacional");
    expect(result.ungrouped).toHaveLength(0);
  });

  it("Elenita: 5 tarefas, cliente resolvido em todas (rótulo não-ambíguo)", () => {
    const elenitaTasks = result.groups[0].items.filter((i) => i.clientId === "elenita");
    expect(elenitaTasks).toHaveLength(5);
    expect(elenitaTasks.map((i) => i.title)).toEqual(["Roteiro Ep. 01", "marcar reunião", "acertar com convidadas", "marcar captação", "mandar contrato"]);
  });

  it("'marcar captação sexta' vira 1 item com dueDate de sexta e cliente Elenita", () => {
    const item = result.groups[0].items.find((i) => i.rawLine.includes("captação"));
    expect(item).toBeDefined();
    expect(item!.clientId).toBe("elenita");
    expect(item!.title).toBe("marcar captação");
    expect(item!.dueDate).not.toBeNull();
  });

  it("Kawhen/Aline: 1 tarefa cada, cliente resolvido", () => {
    const kawhen = result.groups[0].items.filter((i) => i.clientId === "kawhen");
    expect(kawhen).toHaveLength(1);
    expect(kawhen[0].title).toBe("Anúncios");
    const aline = result.groups[0].items.filter((i) => i.clientId === "aline");
    expect(aline).toHaveLength(1);
  });

  it("'Maria' é ambíguo (2 clientes reais) — não escolhe, propaga candidatos", () => {
    const mariaTasks = result.groups[0].items.filter((i) => i.rawLine.toLowerCase().includes("posts") || i.rawLine.toLowerCase().includes("fotos") || i.rawLine.toLowerCase().includes("contrato"));
    const withCandidates = result.groups[0].items.filter((i) => i.clientCandidates.length > 1);
    expect(withCandidates.length).toBeGreaterThan(0);
    expect(withCandidates.every((i) => i.clientId === null)).toBe(true);
  });

  it("Pascoal: 3 tarefas, 'escrever roteiros para amanhã' com data de amanhã", () => {
    const pascoalTasks = result.groups[0].items.filter((i) => i.clientId === "pascoal");
    expect(pascoalTasks).toHaveLength(3);
    const roteiro = pascoalTasks.find((i) => i.title.toLowerCase().includes("roteiro"));
    expect(roteiro).toBeDefined();
  });
});

describe("parseTaskBatch — múltiplos grupos + linhas soltas + rótulo não-cliente", () => {
  const text = ["Arrumar roteador", "Comercial:", "Atualizar CRM", "Adicionar Trianon", "Prospecção: Eventos, Fábricas, Advogados."].join("\n");
  const result = parseTaskBatch(text, [], CLIENTS)!;

  it("'Arrumar roteador' fica solto (nenhum grupo aberto ainda)", () => {
    expect(result.ungrouped).toHaveLength(1);
    expect(result.ungrouped[0].title).toBe("Arrumar roteador");
  });

  it("1 grupo: Comercial, com as linhas soltas + a linha rotulada expandida", () => {
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0].title).toBe("Comercial");
    const titles = result.groups[0].items.map((i) => i.title);
    expect(titles).toContain("Atualizar CRM");
    expect(titles).toContain("Adicionar Trianon");
  });

  it("'Prospecção:' não é cliente real → vira sufixo de contexto no título, 3 tarefas", () => {
    const prospeccaoTasks = result.groups[0].items.filter((i) => i.title.includes("(Prospecção)"));
    expect(prospeccaoTasks).toHaveLength(3);
    expect(prospeccaoTasks.map((i) => i.title)).toEqual(["Eventos (Prospecção)", "Fábricas (Prospecção)", "Advogados (Prospecção)"]);
  });
});
