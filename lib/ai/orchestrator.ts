"use server";

import { getSession } from "@/lib/admin/auth";
import { canViewFinancials } from "@/lib/auth/permissions";
import { getAvailableTools, executeTool } from "@/lib/ai/tools";
import { matchIntent, formatToolResult } from "@/lib/ai/intent-engine";
import { callClaude, AnthropicApiError, type AnthropicMessage, type AnthropicContentBlock } from "@/lib/ai/client";

/**
 * Orquestrador de IA (§73-74) — "Cérebro do Procreating OS", local-first (pedido explícito, achado
 * que motivou isto: a conta Anthropic ficou sem crédito e o assistente parou de funcionar por
 * completo). Fluxo novo, em 2 camadas:
 *
 * 1. **Intent Engine** (`intent-engine.ts`, zero custo, zero rede externa) — reconhece a pergunta
 *    por padrão e chama uma das ferramentas determinísticas direto. Cobre a marioria das
 *    perguntas do dia a dia (MRR, meta, atrasados, pipeline, tarefas...) sem NUNCA tocar a
 *    Anthropic. Isto sozinho já deixa o assistente funcionando de novo com R$0 de custo
 *    recorrente pras funções principais (pedido explícito, item 1).
 * 2. **Claude** (`client.ts`) — só entra quando a pergunta não bate em nenhum padrão conhecido, e
 *    vira um ADAPTER OPCIONAL de verdade: se a chamada falhar por qualquer motivo (sem crédito,
 *    sem chave, rede fora), o erro NUNCA aparece cru pro usuário (nada de "credit balance too
 *    low") — cai numa mensagem amigável, e o resto do produto continua funcionando normalmente
 *    (pedido explícito, item 20 — "nunca deixar a ausência do modelo quebrar o produto").
 *
 * As MESMAS ferramentas (`lib/ai/tools.ts`) atendem os dois caminhos — nunca um cálculo próprio
 * do Intent Engine divergindo do que o Claude usaria. RBAC idêntico nos dois: `getAvailableTools`/
 * `executeTool` continuam sendo o único portão (papel sem `canViewFinancials` nunca alcança uma
 * ferramenta financeira, em nenhum dos dois caminhos).
 */

const SYSTEM_PROMPT = `Você é o assistente interno do Procreating OS, uma agência de marketing. Responda em português, de forma direta e curta.

Regras estritas:
- Todo número que você disser vem de uma ferramenta — nunca calcule, estime ou invente um valor sozinho.
- Se a pergunta pedir algo que nenhuma ferramenta cobre, diga isso claramente em vez de inventar uma resposta.
- Se uma ferramenta retornar "Sem acesso a dados financeiros" ou não existir na sua lista, não tente contornar isso nem sugira que os dados existem — apenas informe que você não tem acesso a essa informação para o papel do usuário atual.
- Seja conciso: respostas de 2-5 frases, não um relatório.`;

const MAX_TOOL_ROUNDS = 4;

export type AskAssistantResult = { ok: true; answer: string; toolsUsed: string[]; local: boolean } | { ok: false; error: string };

export async function askAssistantAction(question: string): Promise<AskAssistantResult> {
  const trimmed = question.trim();
  if (!trimmed) return { ok: false, error: "Escreva uma pergunta." };

  const session = await getSession();
  if (!session) return { ok: false, error: "Sessão expirada — faça login de novo." };

  const canView = canViewFinancials(session.user.role);
  const ctx = { userId: session.user.id, canView };

  // 1. Intent Engine primeiro — sempre, mesmo com a Anthropic configurada e com crédito. É mais
  //    rápido (sem round-trip de rede) e mais barato (zero) pras perguntas que ele já cobre.
  const matchedTool = matchIntent(trimmed);
  if (matchedTool) {
    const available = getAvailableTools(canView).some((tool) => tool.definition.name === matchedTool);
    if (available) {
      const result = await executeTool(matchedTool, {}, ctx);
      return { ok: true, answer: formatToolResult(matchedTool, result), toolsUsed: [matchedTool], local: true };
    }
    // Ferramenta reconhecida mas fora do papel do usuário (ex.: pergunta financeira, sem acesso)
    // — mesma mensagem que `executeTool` já devolveria, sem tentar contornar via Claude.
    return { ok: true, answer: "Você não tem acesso a esse dado com o seu papel atual.", toolsUsed: [], local: true };
  }

  // 2. Claude — adapter opcional. Sem chave configurada, nem tenta (mesma resposta amigável de
  //    "sem crédito"/"sem chave", nunca um erro técnico cru).
  if (!process.env.ANTHROPIC_API_KEY) {
    return { ok: true, answer: "Não reconheci essa pergunta ainda, e o assistente de linguagem natural não está configurado neste ambiente. Tente reformular usando termos como 'MRR', 'meta', 'atrasados' ou 'pipeline'.", toolsUsed: [], local: true };
  }

  const tools = getAvailableTools(canView);
  const toolDefs = tools.map((tool) => tool.definition);
  const messages: AnthropicMessage[] = [{ role: "user", content: trimmed }];
  const toolsUsed: string[] = [];

  for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
    let response;
    try {
      response = await callClaude(messages, toolDefs, SYSTEM_PROMPT);
    } catch (err) {
      // Nunca ecoa `err.message` (pode conter "credit balance too low", status HTTP, etc.) —
      // loga no servidor pra quem for investigar, devolve só uma mensagem amigável pro usuário.
      if (err instanceof AnthropicApiError) console.error("[ai] Anthropic indisponível:", err.message);
      return {
        ok: true,
        answer: "Não reconheci essa pergunta como um padrão conhecido, e o assistente de linguagem natural está indisponível no momento. Tente reformular usando termos como 'MRR', 'meta', 'atrasados' ou 'pipeline'.",
        toolsUsed: [],
        local: true,
      };
    }

    const toolUseBlocks = response.content.filter((block): block is Extract<AnthropicContentBlock, { type: "tool_use" }> => block.type === "tool_use");

    if (toolUseBlocks.length === 0) {
      const answer = response.content
        .filter((block): block is Extract<AnthropicContentBlock, { type: "text" }> => block.type === "text")
        .map((block) => block.text)
        .join("\n")
        .trim();
      return { ok: true, answer: answer || "Não consegui gerar uma resposta.", toolsUsed, local: false };
    }

    messages.push({ role: "assistant", content: response.content });

    const toolResults: AnthropicContentBlock[] = [];
    for (const block of toolUseBlocks) {
      toolsUsed.push(block.name);
      const result = await executeTool(block.name, block.input, ctx);
      toolResults.push({ type: "tool_result", tool_use_id: block.id, content: JSON.stringify(result) });
    }
    messages.push({ role: "user", content: toolResults });
  }

  return { ok: true, answer: "Essa pergunta precisou de muitas etapas — tente reformular de forma mais direta.", toolsUsed, local: false };
}
