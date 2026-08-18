import { describe, expect, it } from "vitest";
import { matchIntent, formatToolResult } from "@/lib/ai/intent-engine";

/** Cobre as perguntas exatas pedidas ("Testes obrigatórios") + variações de acento/maiúscula —
 *  o Intent Engine precisa reconhecer "está"/"esta" como a mesma coisa (pt-BR real digitado sem
 *  acento é comum). Cada caso é uma pergunta real que alguém digitaria, não um padrão artificial. */
describe("matchIntent", () => {
  it("reconhece perguntas de resumo financeiro/MRR", () => {
    expect(matchIntent("Quanto faturamos este mês?")).toBe("get_financial_summary");
    expect(matchIntent("qual nosso MRR?")).toBe("get_financial_summary");
    expect(matchIntent("Quanto temos para receber?")).not.toBe("get_financial_summary"); // é upcoming_receivables, não summary
  });

  it("reconhece contas atrasadas", () => {
    expect(matchIntent("Quais clientes estão atrasados?")).toBe("get_overdue_accounts");
    expect(matchIntent("quais clientes estao atrasados")).toBe("get_overdue_accounts"); // sem acento
    expect(matchIntent("temos alguém inadimplente?")).toBe("get_overdue_accounts");
  });

  it("reconhece meta e gap de crescimento", () => {
    expect(matchIntent("Quanto falta para R$30.000?")).toBe("get_goal_progress");
    expect(matchIntent("quanto falta pra bater nossa meta")).toBe("get_goal_progress");
    expect(matchIntent("Quantas vendas precisamos?")).toBe("get_growth_target");
  });

  it("reconhece cliente que mais gera receita", () => {
    expect(matchIntent("Qual cliente gera mais receita?")).toBe("get_top_client");
    expect(matchIntent("qual o maior cliente")).toBe("get_top_client");
  });

  it("reconhece pipeline/comercial", () => {
    expect(matchIntent("Quantos leads temos no pipeline?")).toBe("get_pipeline_summary");
    expect(matchIntent("qual estratégia tem mais reuniões?")).toBeNull(); // fora do escopo determinístico atual — cai pro Claude
  });

  it("reconhece tarefas e leads parados", () => {
    expect(matchIntent("o que eu tenho pra hoje?")).toBe("get_my_tasks_due");
    expect(matchIntent("quem está parado no pipeline?")).toBe("get_stale_leads");
  });

  it("não reconhece perguntas genéricas/fora de escopo — cai pro Claude", () => {
    expect(matchIntent("crie uma estratégia para clínicas")).toBeNull();
    expect(matchIntent("bom dia")).toBeNull();
    expect(matchIntent("")).toBeNull();
  });

  it("prioriza o padrão mais específico (meta antes de financeiro genérico)", () => {
    // "meta mensal" contém "mensal" mas não deve cair em receita/MRR
    expect(matchIntent("como está nossa meta mensal?")).toBe("get_goal_progress");
  });
});

describe("formatToolResult", () => {
  it("formata get_financial_summary sem inventar campo nenhum", () => {
    const text = formatToolResult("get_financial_summary", {
      mrr: "R$14.900",
      receitaDoMes: "R$18.640",
      despesasDoMes: "R$3.200",
      margem: "R$8.100",
    });
    expect(text).toContain("R$18.640");
    expect(text).toContain("R$14.900");
  });

  it("formata get_goal_progress quando não há meta definida", () => {
    const text = formatToolResult("get_goal_progress", { definida: false, mensagem: "Nenhuma meta definida para este mês (Configurações → Geral)." });
    expect(text).toBe("Nenhuma meta definida para este mês (Configurações → Geral).");
  });

  it("formata get_goal_progress com meta definida", () => {
    const text = formatToolResult("get_goal_progress", {
      definida: true,
      meta: "R$30.000",
      realizado: "R$18.640",
      restante: "R$11.360",
      percentualAtingido: "62.1%",
      diasRestantesNoMes: 13,
    });
    expect(text).toContain("R$11.360");
    expect(text).toContain("13 dias");
  });

  it("propaga mensagem de erro sem reformular (nunca inventa texto por cima)", () => {
    expect(formatToolResult("get_financial_summary", { error: "Sem acesso a dados financeiros." })).toBe("Sem acesso a dados financeiros.");
  });

  it("formata get_overdue_accounts com zero atrasados", () => {
    const text = formatToolResult("get_overdue_accounts", {
      contasAReceberAtrasadas: { total: 0, itens: [] },
      contasAPagarAtrasadas: { total: 0, itens: [] },
    });
    expect(text).toBe("Nenhuma conta atrasada, nem a receber nem a pagar.");
  });
});
