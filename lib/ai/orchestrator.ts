"use server";

import { getSession } from "@/lib/admin/auth";
import { canViewFinancials } from "@/lib/auth/permissions";
import { getAvailableTools, executeTool } from "@/lib/ai/tools";
import { callClaude, AnthropicApiError, type AnthropicMessage, type AnthropicContentBlock } from "@/lib/ai/client";

/**
 * Orquestrador de IA (§73-74) — MVP somente-leitura. Uma pergunta → um array de mensagens novo
 * (SEM histórico persistido entre perguntas ainda, decisão explícita desta rodada) → loop de tool
 * use até o modelo dar uma resposta em texto ou estourar `MAX_TOOL_ROUNDS`. Nenhuma ferramenta de
 * escrita existe (`lib/ai/tools.ts`), então não há risco de o modelo alterar dado — o pior caso é
 * uma resposta ruim, nunca uma ação indevida.
 */

const SYSTEM_PROMPT = `Você é o assistente interno do Procreating OS, uma agência de marketing. Responda em português, de forma direta e curta.

Regras estritas:
- Todo número que você disser vem de uma ferramenta — nunca calcule, estime ou invente um valor sozinho.
- Se a pergunta pedir algo que nenhuma ferramenta cobre, diga isso claramente em vez de inventar uma resposta.
- Se uma ferramenta retornar "Sem acesso a dados financeiros" ou não existir na sua lista, não tente contornar isso nem sugira que os dados existem — apenas informe que você não tem acesso a essa informação para o papel do usuário atual.
- Seja conciso: respostas de 2-5 frases, não um relatório.`;

const MAX_TOOL_ROUNDS = 4;

export type AskAssistantResult = { ok: true; answer: string; toolsUsed: string[] } | { ok: false; error: string };

export async function askAssistantAction(question: string): Promise<AskAssistantResult> {
  const trimmed = question.trim();
  if (!trimmed) return { ok: false, error: "Escreva uma pergunta." };
  if (!process.env.ANTHROPIC_API_KEY) return { ok: false, error: "IA ainda não configurada neste ambiente — falta ANTHROPIC_API_KEY." };

  const session = await getSession();
  if (!session) return { ok: false, error: "Sessão expirada — faça login de novo." };

  const canView = canViewFinancials(session.user.role);
  const tools = getAvailableTools(canView);
  const toolDefs = tools.map((tool) => tool.definition);

  const messages: AnthropicMessage[] = [{ role: "user", content: trimmed }];
  const toolsUsed: string[] = [];

  for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
    let response;
    try {
      response = await callClaude(messages, toolDefs, SYSTEM_PROMPT);
    } catch (err) {
      const message = err instanceof AnthropicApiError ? err.message : "Falha ao chamar a IA.";
      return { ok: false, error: message };
    }

    const toolUseBlocks = response.content.filter((block): block is Extract<AnthropicContentBlock, { type: "tool_use" }> => block.type === "tool_use");

    if (toolUseBlocks.length === 0) {
      const answer = response.content
        .filter((block): block is Extract<AnthropicContentBlock, { type: "text" }> => block.type === "text")
        .map((block) => block.text)
        .join("\n")
        .trim();
      return { ok: true, answer: answer || "Não consegui gerar uma resposta.", toolsUsed };
    }

    messages.push({ role: "assistant", content: response.content });

    const toolResults: AnthropicContentBlock[] = [];
    for (const block of toolUseBlocks) {
      toolsUsed.push(block.name);
      const result = await executeTool(block.name, block.input, { userId: session.user.id, canView });
      toolResults.push({ type: "tool_result", tool_use_id: block.id, content: JSON.stringify(result) });
    }
    messages.push({ role: "user", content: toolResults });
  }

  return { ok: false, error: "A IA precisou de muitas etapas pra responder — tente reformular a pergunta." };
}
