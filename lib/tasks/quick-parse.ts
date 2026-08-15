import { addDaysISO, todayISO } from "@/lib/date";

/**
 * Master prompt ("evolução profunda"), §49/§50 — "a criação de Task deve ser feita por uma única
 * linha... o parser deve entender". Puro (sem I/O, sem `server-only`) — chamado no client pra
 * mostrar o preview ao digitar, e de novo (mesma função) na hora de submeter, sem duplicar a
 * lógica entre os dois momentos.
 *
 * Suporta exatamente o vocabulário dos exemplos do prompt — nada além disso é inventado:
 * "hoje"/"amanhã", dia da semana (próxima ocorrência — hoje mesmo se hoje já é esse dia), hora
 * ("às 15h", "15h30", "15:00") e "@Nome" (casa por primeiro nome ou nome completo, contra a
 * lista de membros da equipe já carregada — nunca por adivinhação/fuzzy match arriscado).
 */

export type QuickParseTeamMember = { id: string; name: string };

export type ParsedQuickTask = {
  title: string;
  dueDate: string | null;
  dueTime: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
};

const WEEKDAYS: { names: string[]; index: number }[] = [
  { names: ["domingo"], index: 0 },
  { names: ["segunda-feira", "segunda"], index: 1 },
  { names: ["terça-feira", "terça", "terca-feira", "terca"], index: 2 },
  { names: ["quarta-feira", "quarta"], index: 3 },
  { names: ["quinta-feira", "quinta"], index: 4 },
  { names: ["sexta-feira", "sexta"], index: 5 },
  { names: ["sábado", "sabado"], index: 6 },
];

/** Dia da semana (0=domingo) de uma data-calendário `YYYY-MM-DD` — mesmo padrão de
 *  `addDaysISO`/`formatDateOnly` (`lib/date.ts`): ancora em UTC-midnight pra ler de volta sem
 *  reintroduzir viés de fuso. */
function weekdayOf(dateOnlyISO: string): number {
  return new Date(`${dateOnlyISO}T00:00:00Z`).getUTCDay();
}

function stripMatch(text: string, match: RegExpMatchArray): string {
  return (text.slice(0, match.index) + text.slice((match.index ?? 0) + match[0].length)).replace(/\s+/g, " ").trim();
}

export function parseQuickTask(rawText: string, teamMembers: QuickParseTeamMember[] = []): ParsedQuickTask {
  let text = rawText;
  let assigneeId: string | null = null;
  let assigneeName: string | null = null;
  let dueDate: string | null = null;
  let dueTime: string | null = null;

  const mentionMatch = text.match(/@(\S+)/);
  if (mentionMatch) {
    const token = mentionMatch[1].toLowerCase();
    const member = teamMembers.find((m) => {
      const firstName = m.name.toLowerCase().split(/\s+/)[0];
      return firstName === token || m.name.toLowerCase() === token;
    });
    if (member) {
      assigneeId = member.id;
      assigneeName = member.name;
      text = stripMatch(text, mentionMatch);
    }
  }

  // Hora — tenta "às Xh(MM)" primeiro (mais específico), depois "Xh(MM)"/"X:MM" soltos.
  const explicitTimeMatch = text.match(/\bàs\s+(\d{1,2})(?:h|:)(\d{2})?\b/i);
  const bareTimeMatch = text.match(/\b(\d{1,2})h(\d{2})?\b/i) ?? text.match(/\b(\d{1,2}):(\d{2})\b/);
  const timeMatch = explicitTimeMatch ?? bareTimeMatch;
  if (timeMatch) {
    const hours = Math.min(23, Number(timeMatch[1]));
    const minutes = Math.min(59, Number(timeMatch[2] ?? 0));
    dueTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    text = stripMatch(text, timeMatch);
  }

  const today = todayISO();
  if (/\bhoje\b/i.test(text)) {
    dueDate = today;
    text = text.replace(/\bhoje\b/i, "").trim();
  } else if (/\bamanh[ãa]\b/i.test(text)) {
    dueDate = addDaysISO(today, 1);
    text = text.replace(/\bamanh[ãa]\b/i, "").trim();
  } else {
    for (const weekday of WEEKDAYS) {
      const pattern = new RegExp(`\\b(?:pr[óo]xim[ao]\\s+)?(${weekday.names.join("|")})\\b`, "i");
      const match = text.match(pattern);
      if (match) {
        const offset = (weekday.index - weekdayOf(today) + 7) % 7;
        dueDate = addDaysISO(today, offset);
        text = stripMatch(text, match);
        break;
      }
    }
  }

  const title = text.replace(/\s+/g, " ").trim();
  return { title, dueDate, dueTime, assigneeId, assigneeName };
}

const previewDateFormatter = new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" });

/** Label do preview ao vivo — compartilhado entre `WorkspaceTasks` e `QuickAddMenu` (mesma leitura
 *  do que vai ser criado, os dois lugares onde esse input de linha única existe). */
export function describeQuickTaskPreview(rawText: string, teamMembers: QuickParseTeamMember[] = []): string {
  const parsed = parseQuickTask(rawText, teamMembers);
  if (!parsed.title) return "Escreva o que precisa ser feito.";
  const parts: string[] = [`"${parsed.title}"`];
  if (parsed.dueDate) {
    parts.push(parsed.dueDate === todayISO() ? "hoje" : previewDateFormatter.format(new Date(`${parsed.dueDate}T00:00:00Z`)));
  }
  if (parsed.dueTime) parts.push(parsed.dueTime);
  parts.push(parsed.assigneeName ? `responsável: ${parsed.assigneeName}` : "responsável: você");
  return parts.join(" · ");
}
