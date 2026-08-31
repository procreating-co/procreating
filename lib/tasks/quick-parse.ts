import { addDaysISO, todayISO } from "@/lib/date";

/**
 * Master prompt ("evolução profunda"), §49/§50 — "a criação de Task deve ser feita por uma única
 * linha... o parser deve entender". Puro (sem I/O, sem `server-only`) — chamado no client pra
 * mostrar o preview ao digitar, e de novo (mesma função) na hora de submeter, sem duplicar a
 * lógica entre os dois momentos.
 *
 * Task Intelligence (rodada seguinte) — estendido, não reescrito: os campos originais
 * (título/data/hora/responsável) continuam com o mesmo comportamento e os mesmos testes; os
 * campos novos (`estimatedMinutes`, `executionMode`/`pomodoros`, `clientId`/`clientCandidates`)
 * são detectados na mesma passada, sempre depois de já ter tirado @menção/hora/data do texto —
 * assim nenhum deles "come" um token que já virou outra coisa.
 *
 * Cliente: só resolve se exatamente 1 cliente real bate com uma palavra capitalizada do texto
 * (nunca por adivinhação) — 0 match = `clientId: null`; 2+ matches = `clientId: null` +
 * `clientCandidates` preenchido, pra quem chama mostrar confirmação em vez de escolher sozinho.
 */

export type QuickParseTeamMember = { id: string; name: string };
export type QuickParseClient = { id: string; name: string };

export type ExecutionMode = "free" | "pomodoro";

export type ParsedQuickTask = {
  title: string;
  dueDate: string | null;
  dueTime: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  estimatedMinutes: number | null;
  executionMode: ExecutionMode | null;
  pomodoros: number | null;
  clientId: string | null;
  clientName: string | null;
  /** Preenchido só quando 2+ clientes reais batem com a mesma palavra do texto — nunca escolhido
   *  ao acaso, quem chama decide (mostrar confirmação). */
  clientCandidates: QuickParseClient[];
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

// Abreviação de 3 letras SÓ entre parênteses — "(sex)", "(seg)" (achado real: o próprio exemplo
// de seed do pedido usa "marcar captação (sex)"). De propósito NÃO adicionada como sinônimo bare
// no meio do texto: "ter" (terça) é também o verbo comum "ter" — bare, isso geraria falso
// positivo toda vez que alguém escrevesse uma frase com o verbo. Entre parênteses o risco
// desaparece (ninguém escreve "(ter)" querendo dizer o verbo).
const WEEKDAY_ABBREVIATIONS: Record<string, number> = { dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sab: 6, "sáb": 6 };

const DEFAULT_POMODORO_MINUTES = 25;

/** Dia da semana (0=domingo) de uma data-calendário `YYYY-MM-DD` — mesmo padrão de
 *  `addDaysISO`/`formatDateOnly` (`lib/date.ts`): ancora em UTC-midnight pra ler de volta sem
 *  reintroduzir viés de fuso. */
function weekdayOf(dateOnlyISO: string): number {
  return new Date(`${dateOnlyISO}T00:00:00Z`).getUTCDay();
}

function stripMatch(text: string, match: RegExpMatchArray): string {
  return (text.slice(0, match.index) + text.slice((match.index ?? 0) + match[0].length)).replace(/\s+/g, " ").trim();
}

/** "2h" / "2 h" / "2 horas" / "1h30" / "90min" / "90 min" / "30min" → minutos. `null` se não achar
 *  nada — não confundir com "0" (0 é um valor válido em tese, `null` é "não foi dito").
 *
 * Ambiguidade real entre duração e hora do dia no formato terso "Xh"/"XhYY" sem "às" na frente:
 * "1h30" quer dizer 90 minutos de duração, mas "15h30" (já testado em `describe("hora")`, sem
 * "às") quer dizer 15:30 — o MESMO formato, dois significados. Resolvido por faixa de valor: 1–8
 * é duração muitíssimo mais provável que hora do dia sem "às" na frente (ninguém marca "às" 1h-8h
 * implicitamente); 9+ segue sendo hora, como já era. Só vale pra essa forma bare — "2 horas"
 * (palavra por extenso) e "90min" são sempre duração, qualquer valor, sem essa faixa. */
function extractDurationMinutes(text: string): { minutes: number; match: RegExpMatchArray } | null {
  const hoursWithMinutesLow = text.match(/\b([1-8])h([0-5]\d)\b/i);
  if (hoursWithMinutesLow) {
    return { minutes: Number(hoursWithMinutesLow[1]) * 60 + Number(hoursWithMinutesLow[2]), match: hoursWithMinutesLow };
  }
  const hoursOnlyLow = text.match(/\b([1-8])h\b/i);
  if (hoursOnlyLow) {
    return { minutes: Number(hoursOnlyLow[1]) * 60, match: hoursOnlyLow };
  }
  const hoursWord = text.match(/\b(\d{1,2}(?:[.,]\d)?)\s*horas?\b/i);
  if (hoursWord) {
    const hours = Number(hoursWord[1].replace(",", "."));
    return { minutes: Math.round(hours * 60), match: hoursWord };
  }
  const minutesOnly = text.match(/\b(\d{1,3})\s*min(?:utos?)?\b/i);
  if (minutesOnly) {
    return { minutes: Number(minutesOnly[1]), match: minutesOnly };
  }
  return null;
}

/** "pomodoro" / "3 pomodoros" / "2 poms" → contagem (padrão 1 quando a palavra aparece sozinha). */
function extractPomodoros(text: string): { count: number; match: RegExpMatchArray } | null {
  const withCount = text.match(/\b(\d{1,2})\s*pomodoros?\b/i);
  if (withCount) return { count: Number(withCount[1]), match: withCount };
  const bare = text.match(/\bpomodoros?\b/i);
  if (bare) return { count: 1, match: bare };
  return null;
}

/** Palavras "de nome próprio" candidatas a cliente — capitalizadas, ≥3 letras, sem serem a
 *  primeira palavra de uma frase em minúsculas comuns (heurística simples: exige maiúscula na
 *  posição em que aparece no texto ORIGINAL, não no início da frase inteira, pra reduzir falso
 *  positivo de início de frase capitalizado por acaso — como o texto de entrada aqui é sempre uma
 *  linha curta e o título nunca é recapitalizado à toa, isso é suficiente sem heurística maior). */
export function findClientMatch(text: string, clients: QuickParseClient[]): { client: QuickParseClient | null; candidates: QuickParseClient[]; match: RegExpMatchArray | null } {
  if (clients.length === 0) return { client: null, candidates: [], match: null };

  const wordPattern = /\p{Lu}[\p{L}]{2,}/gu; // palavra começando com maiúscula, 3+ letras
  const words = Array.from(text.matchAll(wordPattern));

  for (const wordMatch of words) {
    const word = wordMatch[0].toLowerCase();
    const matches = clients.filter((client) => client.name.toLowerCase().split(/\s+/).some((token) => token.replace(/[.,]/g, "") === word));
    if (matches.length === 1) {
      return { client: matches[0], candidates: [], match: wordMatch as RegExpMatchArray };
    }
    if (matches.length > 1) {
      return { client: null, candidates: matches, match: wordMatch as RegExpMatchArray };
    }
  }
  return { client: null, candidates: [], match: null };
}

export function parseQuickTask(rawText: string, teamMembers: QuickParseTeamMember[] = [], clients: QuickParseClient[] = []): ParsedQuickTask {
  let text = rawText;
  let assigneeId: string | null = null;
  let assigneeName: string | null = null;
  let dueDate: string | null = null;
  let dueTime: string | null = null;

  const mentionMatch = text.match(/@(\S+)/);
  if (mentionMatch) {
    const token = mentionMatch[1].toLowerCase().replace(/[^\p{L}\p{N}_]+$/u, "");
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

  // Hora explícita ("às Xh(MM)") — sempre hora, nunca duração, roda antes de qualquer coisa que
  // possa colidir. BUG REAL achado escrevendo o teste desta função (não era hipotético): `\b` do
  // JS só reconhece `[A-Za-z0-9_]` como caractere de palavra — "à" não conta, então `\bàs\b`
  // nunca batia quando precedido de espaço (o caso normal, "reunião às 15h"), porque nem o
  // espaço nem o "à" contam como lado "de palavra" pro `\b` enxergar uma borda ali.
  // `(?<![\p{L}\p{N}_])`/`(?![\p{L}\p{N}_])` (com a flag `u`) resolvem isso tratando qualquer
  // letra Unicode (inclusive acentuada) como "de palavra" de verdade.
  const explicitTimeMatch = text.match(/(?<![\p{L}\p{N}_])às\s+(\d{1,2})(?:h|:)(\d{2})?(?![\p{L}\p{N}_])/iu);
  if (explicitTimeMatch) {
    const hours = Math.min(23, Number(explicitTimeMatch[1]));
    const minutes = Math.min(59, Number(explicitTimeMatch[2] ?? 0));
    dueTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    text = stripMatch(text, explicitTimeMatch);
  }

  // Pomodoro + duração ANTES da hora bare "Xh(MM)" solta, de propósito — "1h30"/"2h" sem "às" na
  // frente é o mesmo formato textual de "15h30" (já tratado acima como hora quando vem com "às";
  // sem "às" o texto sozinho é ambíguo). `extractDurationMinutes` só reivindica a faixa 1–8 desse
  // formato terso (duração muitíssimo mais provável nessa faixa sem "às" na frente) — 9+ nesse
  // mesmo formato passa direto pra extração de hora bare logo abaixo, sem mudança de
  // comportamento. Ver o comentário de `extractDurationMinutes` pro raciocínio completo.
  let estimatedMinutes: number | null = null;
  let executionMode: ExecutionMode | null = null;
  let pomodoros: number | null = null;
  const pomodoroMatch = extractPomodoros(text);
  if (pomodoroMatch) {
    executionMode = "pomodoro";
    pomodoros = pomodoroMatch.count;
    estimatedMinutes = pomodoroMatch.count * DEFAULT_POMODORO_MINUTES;
    text = stripMatch(text, pomodoroMatch.match);
  }

  const durationMatch = extractDurationMinutes(text);
  if (durationMatch) {
    estimatedMinutes = durationMatch.minutes;
    text = stripMatch(text, durationMatch.match);
  }

  // Hora bare — "Xh(MM)" (9+ depois da duração já ter levado 1–8) ou "X:MM" com dois-pontos
  // (sempre hora, formato que duração nunca usa).
  const bareTimeMatch = text.match(/\b(\d{1,2})h(\d{2})?\b/i) ?? text.match(/\b(\d{1,2}):(\d{2})\b/);
  if (bareTimeMatch) {
    const hours = Math.min(23, Number(bareTimeMatch[1]));
    const minutes = Math.min(59, Number(bareTimeMatch[2] ?? 0));
    dueTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    text = stripMatch(text, bareTimeMatch);
  }

  const today = todayISO();
  if (/\bhoje\b/i.test(text)) {
    dueDate = today;
    text = text.replace(/\bhoje\b/i, "").trim();
  } else if (/(?<![\p{L}\p{N}_])amanh[ãa](?![\p{L}\p{N}_])/iu.test(text)) {
    // Mesmo bug do `às` acima: "amanhã" termina em "ã", que o `\b` do JS não reconhece como
    // caractere de palavra — a forma acentuada (a normal, a que as pessoas realmente digitam)
    // nunca batia em frase nenhuma ("...amanhã " ou "...amanhã" no fim da frase), só a forma sem
    // acento ("amanha") funcionava. Impacto real: o próprio exemplo do master prompt ("Editar
    // vídeo amanhã às 15h") virava hoje, não amanhã, e ainda deixava "às" solto no título.
    // "(para )?amanhã" também consome o prefixo opcional — "para amanhã" (§6 do pedido) sai
    // junto do título, não deixa "para" sobrando sozinho.
    dueDate = addDaysISO(today, 1);
    text = text.replace(/(?:\bpara\s+)?(?<![\p{L}\p{N}_])amanh[ãa](?![\p{L}\p{N}_])/iu, "").trim();
  } else if (Object.keys(WEEKDAY_ABBREVIATIONS).some((abbr) => new RegExp(`\\(${abbr}\\)`, "i").test(text))) {
    const abbrMatch = text.match(new RegExp(`\\((${Object.keys(WEEKDAY_ABBREVIATIONS).join("|")})\\)`, "i"))!;
    const weekdayIndex = WEEKDAY_ABBREVIATIONS[abbrMatch[1].toLowerCase()];
    const offset = (weekdayIndex - weekdayOf(today) + 7) % 7;
    dueDate = addDaysISO(today, offset);
    text = stripMatch(text, abbrMatch);
  } else {
    for (const weekday of WEEKDAYS) {
      const pattern = new RegExp(`\\b(?:pr[óo]xim[ao]\\s+|para\\s+|at[ée]\\s+)?(${weekday.names.join("|")})\\b`, "i");
      const match = text.match(pattern);
      if (match) {
        const offset = (weekday.index - weekdayOf(today) + 7) % 7;
        dueDate = addDaysISO(today, offset);
        text = stripMatch(text, match);
        break;
      }
    }
  }
  // Sem palavra de data nenhuma → hoje, por decisão explícita ("se eu não colocar uma data
  // automaticamente é pra ser feita HOJE"). Sem isso a tarefa nascia com `due_date: null` e
  // sumia — `listTodayAndOverdueTasks` só mostra `due_date <= hoje`, nulo nunca aparece ali,
  // então parecia que a tarefa nem tinha sido salva.
  if (dueDate === null) dueDate = today;

  const clientMatch = findClientMatch(text, clients);
  let clientId: string | null = null;
  let clientName: string | null = null;
  if (clientMatch.client) {
    clientId = clientMatch.client.id;
    clientName = clientMatch.client.name;
    if (clientMatch.match) text = stripMatch(text, clientMatch.match);
  }
  // Ambíguo (2+ clientes batendo na mesma palavra) — a palavra fica no título (não decidimos por
  // ela), só sinalizamos os candidatos pra quem chama mostrar confirmação.
  const clientCandidates = clientMatch.candidates;

  // `()` vazio sobra quando a única coisa dentro do parênteses era a abreviação/data já extraída
  // acima ("marcar captação (sex)" → "marcar captação ()"). Achado real de seed: "(Tarefa para
  // Amanhã)" tira só "para Amanhã", sobrando "(Tarefa )" — meta-comentário, não conteúdo real;
  // limpa também quando o que sobrou dentro dos parênteses é só uma dessas palavras soltas.
  const title = text
    .replace(/\(\s*(?:tarefa|nota|obs\.?|lembrete)?\s*\)/gi, "")
    .replace(/\s+/g, " ")
    .replace(/\.\s*$/, "")
    .trim();
  return { title, dueDate, dueTime, assigneeId, assigneeName, estimatedMinutes, executionMode, pomodoros, clientId, clientName, clientCandidates };
}

const previewDateFormatter = new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" });

/** Label do preview ao vivo — compartilhado entre `WorkspaceTasks` e `QuickAddMenu` (mesma leitura
 *  do que vai ser criado, os dois lugares onde esse input de linha única existe). */
export function describeQuickTaskPreview(rawText: string, teamMembers: QuickParseTeamMember[] = [], clients: QuickParseClient[] = []): string {
  const parsed = parseQuickTask(rawText, teamMembers, clients);
  if (!parsed.title) return "Escreva o que precisa ser feito.";
  const parts: string[] = [`"${parsed.title}"`];
  if (parsed.dueDate) {
    parts.push(parsed.dueDate === todayISO() ? "hoje" : previewDateFormatter.format(new Date(`${parsed.dueDate}T00:00:00Z`)));
  }
  if (parsed.dueTime) parts.push(parsed.dueTime);
  parts.push(parsed.assigneeName ? `responsável: ${parsed.assigneeName}` : "responsável: você");
  if (parsed.clientName) parts.push(`cliente: ${parsed.clientName}`);
  if (parsed.clientCandidates.length > 1) parts.push(`cliente ambíguo: ${parsed.clientCandidates.map((c) => c.name).join(" ou ")}?`);
  if (parsed.estimatedMinutes) parts.push(formatEstimatedMinutes(parsed.estimatedMinutes));
  if (parsed.executionMode === "pomodoro") parts.push(`${parsed.pomodoros} pomodoro${parsed.pomodoros === 1 ? "" : "s"}`);
  return parts.join(" · ");
}

export function formatEstimatedMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}h` : `${hours}h${String(rest).padStart(2, "0")}`;
}
