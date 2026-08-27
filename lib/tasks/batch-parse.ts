import { findClientMatch, parseQuickTask, type ParsedQuickTask, type QuickParseClient, type QuickParseTeamMember } from "@/lib/tasks/quick-parse";

/**
 * Entrada em lote — "Operacional:\nElenita: Roteiro Ep. 01, marcar reunião...\nKawhen: Anúncios"
 * vira N tarefas agrupadas. Puro (sem I/O), mesma ideia de `quick-parse.ts`: cada frase resultante
 * passa pela MESMA `parseQuickTask` (não duplica a extração de data/hora/duração/cliente/menção —
 * só decide COMO cortar o texto em frases antes de entregar pra ela).
 *
 * Regra de grupo, só uma: uma linha terminada em ":" e SEM MAIS NADA depois abre um grupo novo
 * ("Operacional:", "Comercial:") — uma linha com conteúdo depois dos dois-pontos ("Elenita:
 * Roteiro...", "Prospecção: Eventos, Fábricas...") é sempre uma LINHA DE DADO dentro do grupo
 * corrente (ou solta, se nenhum grupo foi aberto ainda), nunca um grupo novo. Isso distingue as
 * duas coisas sem heurística maior: cabeçalho de grupo é rótulo sozinho na linha, dado é rótulo
 * com conteúdo do lado.
 */

export type BatchParsedItem = ParsedQuickTask & { rawLine: string };
export type BatchParsedGroup = { title: string; items: BatchParsedItem[] };
export type ParsedTaskBatch = { ungrouped: BatchParsedItem[]; groups: BatchParsedGroup[] };

const BARE_GROUP_HEADER = /^([^:]{1,60}):\s*$/;
const LABELED_LINE = /^([^:]{1,60}):\s*(.+)$/;

/** "a, b, c" / "a + b + c" / "a e b" (só quando não há vírgula/mais nenhuma, senão o "e" natural
 *  de dentro de uma frase virava corte errado) → frases separadas. Sempre tira ponto final. */
function splitPhrases(text: string): string[] {
  const trimmed = text.trim().replace(/\.\s*$/, "");
  if (/[,+]/.test(trimmed)) {
    // Antes de cortar em vírgula/"+", troca o ÚLTIMO " e " (conjunção final, "...sexta e mandar
    // contrato") por vírgula — só o último, pra não quebrar um "e" que faça parte de uma frase
    // no meio da lista.
    const lastE = trimmed.toLowerCase().lastIndexOf(" e ");
    const withCommaJoin = lastE === -1 ? trimmed : `${trimmed.slice(0, lastE)}, ${trimmed.slice(lastE + 3)}`;
    return withCommaJoin
      .split(/[,+]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  const lastE = trimmed.toLowerCase().lastIndexOf(" e ");
  if (lastE !== -1) {
    return [trimmed.slice(0, lastE).trim(), trimmed.slice(lastE + 3).trim()].filter(Boolean);
  }
  return trimmed ? [trimmed] : [];
}

/** Aplica `parseQuickTask` numa frase e, se o rótulo da linha (`label`) resolver a exatamente 1
 *  cliente real e a frase em si não tiver identificado nenhum, herda o cliente do rótulo — é o
 *  caso comum ("Elenita: Roteiro Ep. 01" → cliente Elenita vem do rótulo, não da frase). Se o
 *  rótulo não bater com nenhum cliente, vira um sufixo de contexto no título (nunca descartado —
 *  "não inventar relacionamento" corta o vínculo de cliente, não a informação em si). Rótulo
 *  ambíguo (2+ clientes) propaga os candidatos, mesma regra de `parseQuickTask`. */
function parsePhraseWithLabel(phrase: string, label: string | null, teamMembers: QuickParseTeamMember[], clients: QuickParseClient[]): BatchParsedItem {
  const parsed = parseQuickTask(phrase, teamMembers, clients);
  if (!label) return { ...parsed, rawLine: phrase };

  if (parsed.clientId || parsed.clientCandidates.length > 0) {
    // A própria frase já identificou (ou ficou ambígua n)o cliente — rótulo não sobrepõe.
    return { ...parsed, rawLine: phrase };
  }

  const labelMatch = findClientMatch(label, clients);
  if (labelMatch.client) {
    return { ...parsed, clientId: labelMatch.client.id, clientName: labelMatch.client.name, rawLine: phrase };
  }
  if (labelMatch.candidates.length > 0) {
    return { ...parsed, clientCandidates: labelMatch.candidates, rawLine: phrase };
  }
  // Rótulo não é cliente nenhum (ex.: "Prospecção", "Comercial") — mantém como contexto no título.
  return { ...parsed, title: parsed.title ? `${parsed.title} (${label})` : label, rawLine: phrase };
}

/** `null` quando o texto não parece lote nenhum (uma linha só, sem "Rótulo:") — quem chama cai de
 *  volta pro `parseQuickTask` de sempre nesse caso, comportamento de hoje 100% preservado. */
export function parseTaskBatch(rawText: string, teamMembers: QuickParseTeamMember[] = [], clients: QuickParseClient[] = []): ParsedTaskBatch | null {
  const lines = rawText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length <= 1) return null;

  const ungrouped: BatchParsedItem[] = [];
  const groups: BatchParsedGroup[] = [];
  let currentGroup: BatchParsedGroup | null = null;

  for (const line of lines) {
    const bareHeader = line.match(BARE_GROUP_HEADER);
    if (bareHeader) {
      currentGroup = { title: bareHeader[1].trim(), items: [] };
      groups.push(currentGroup);
      continue;
    }

    const labeled = line.match(LABELED_LINE);
    const target = currentGroup?.items ?? ungrouped;
    if (labeled) {
      const label = labeled[1].trim();
      for (const phrase of splitPhrases(labeled[2])) {
        const item = parsePhraseWithLabel(phrase, label, teamMembers, clients);
        if (item.title) target.push(item);
      }
    } else {
      const item = parsePhraseWithLabel(line, null, teamMembers, clients);
      if (item.title) target.push(item);
    }
  }

  if (ungrouped.length === 0 && groups.length === 0) return null;
  return { ungrouped, groups };
}
