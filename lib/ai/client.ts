import "server-only";

/**
 * Cliente mínimo da Anthropic Messages API — `fetch` cru, sem SDK nova (evita mexer em
 * `package.json`/`package-lock.json`, arquivo compartilhado com a outra sessão que trabalha neste
 * mesmo repositório; a API é só HTTP+JSON, não precisa de dependência pra isto). Só o suficiente
 * pra sustentar o orquestrador somente-leitura (§73-74): mensagens + tool use, sem streaming
 * (respostas curtas, um round-trip por pergunta, streaming seria complexidade sem necessidade
 * nesta primeira fatia).
 */

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const MODEL = "claude-sonnet-5";
const MAX_TOKENS = 1024;

export type AnthropicTextBlock = { type: "text"; text: string };
export type AnthropicToolUseBlock = { type: "tool_use"; id: string; name: string; input: Record<string, unknown> };
export type AnthropicToolResultBlock = { type: "tool_result"; tool_use_id: string; content: string };
export type AnthropicContentBlock = AnthropicTextBlock | AnthropicToolUseBlock | AnthropicToolResultBlock;

export type AnthropicMessage = { role: "user" | "assistant"; content: string | AnthropicContentBlock[] };

export type AnthropicToolDef = { name: string; description: string; input_schema: Record<string, unknown> };

export type AnthropicResponse = { content: AnthropicContentBlock[]; stop_reason: string };

export class AnthropicApiError extends Error {}

/** Assinatura fixa: `system` sempre nosso, `messages` monta o histórico da rodada (não persistido
 *  entre perguntas — cada pergunta começa um array novo), `tools` já vem PRÉ-FILTRADA por quem
 *  chama (`lib/ai/orchestrator.ts` decide o que o papel do usuário pode ver antes de chegar aqui;
 *  este arquivo não sabe nada de RBAC, só fala com a API). */
export async function callClaude(messages: AnthropicMessage[], tools: AnthropicToolDef[], system: string): Promise<AnthropicResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new AnthropicApiError("ANTHROPIC_API_KEY não configurada.");

  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system,
      messages,
      ...(tools.length > 0 ? { tools } : {}),
    }),
  });

  if (!res.ok) {
    // Nunca ecoa o corpo bruto (pode conter detalhe demais) além de um recorte curto — e nunca a
    // API key, que só existe no header da requisição, nunca no corpo/resposta.
    const bodyText = await res.text().catch(() => "");
    throw new AnthropicApiError(`Anthropic API respondeu ${res.status}: ${bodyText.slice(0, 300)}`);
  }

  return res.json() as Promise<AnthropicResponse>;
}
