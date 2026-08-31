/**
 * Comandos rápidos (§20) — opcionais na UI, suportados pelo parser porque são simples: um
 * prefixo `/palavra` seguido do resto do texto, que cada comando interpreta do seu jeito. Puro,
 * sem I/O — só reconhece a intenção, quem chama decide o que fazer com ela.
 */
export type SlashCommandType = "task" | "time" | "pomodoro" | "plan" | "strategy";

export type SlashCommand = { type: SlashCommandType; rest: string };

// `[\s\S]*` em vez de `.*` com flag `s` — o alvo de TS deste projeto não suporta a flag `s`
// (dotAll); `[\s\S]` já cobre "qualquer caractere, inclusive quebra de linha" sem precisar dela.
const COMMAND_PATTERN = /^\/(task|time|pomodoro|plan|strategy)\b\s*([\s\S]*)$/i;

export function parseSlashCommand(input: string): SlashCommand | null {
  const match = input.trim().match(COMMAND_PATTERN);
  if (!match) return null;
  return { type: match[1].toLowerCase() as SlashCommandType, rest: match[2].trim() };
}
