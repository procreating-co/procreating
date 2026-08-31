/**
 * Camada central de data — item P0 da auditoria (§19: "hoje" era calculado em 6+ lugares
 * diferentes, todos via `new Date().toISOString().slice(0,10)`, sempre UTC, nunca ancorado no
 * fuso real da empresa). Duas regras, seguidas em todo o arquivo:
 *
 * 1. "Hoje" (o instante presente → dia de calendário) só pode vir de `todayISO()`/`todayParts()`
 *    — os únicos pontos que convertem "agora" pro fuso de Brasília de verdade. Nunca `new Date()`
 *    cru pra decidir "que dia é hoje".
 * 2. Uma data-calendário já armazenada (coluna `date`, tipo "YYYY-MM-DD", sem hora — `due_date`,
 *    `start_date`, `paid_at` etc.) nunca deve virar `new Date(str)` pra ler ano/mês/dia de volta
 *    — `new Date("2026-08-31").getMonth()` já reintroduz o mesmo viés de fuso na LEITURA. Sempre
 *    fatiar a string diretamente (`monthKeyOf`, `dayOfMonth`, etc.).
 *
 * Sem dependência nova — `Intl.DateTimeFormat` com `timeZone` é nativo do runtime (Node/Edge/
 * browser), funciona igual em Server Component, Server Action e Client Component.
 */

const TIMEZONE = "America/Sao_Paulo";

export type DateParts = { year: number; month: number; day: number }; // month: 1-12

/** "Hoje" no calendário de Brasília, como "YYYY-MM-DD" — correto mesmo rodando num processo cujo
 *  relógio de sistema está em UTC (padrão da Vercel) ou em qualquer outro fuso (dev local). `en-CA`
 *  é só pelo formato de saída nativo dessa locale (YYYY-MM-DD) — não é sobre idioma. */
export function todayISO(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export function todayParts(): DateParts {
  const [year, month, day] = todayISO().split("-").map(Number);
  return { year, month, day };
}

/** Dia de calendário (em Brasília) de um INSTANTE (timestamptz — `created_at`, `paid_at` de
 *  evento, etc.), como "YYYY-MM-DD". Existe porque `isoInstant.slice(0,10)` dá o dia em UTC, não
 *  em Brasília — a mesma armadilha que este arquivo inteiro existe pra evitar, só que aplicada a
 *  um instante gravado pelo banco (`now()`) em vez de "agora" no processo. Nunca fatiar um
 *  timestamptz na mão pra virar dia-de-calendário — sempre por aqui. */
export function calendarDateOf(isoInstant: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(isoInstant));
}

/** Hora:minuto de Brasília de um INSTANTE (timestamptz), em minutos desde meia-noite — mesmo
 *  raciocínio de `calendarDateOf`, só que pra hora em vez de dia (usado pelo TaskPlanner,
 *  `lib/tasks/planner.ts`, pra ler `time_blocks.start_at`/`end_at` de volta como "minutos do
 *  dia" sem reintroduzir o viés de fuso do servidor). */
export function minutesOfDayInBrasilia(isoInstant: string): number {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: TIMEZONE, hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date(isoInstant));
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return hour * 60 + minute;
}

/** "Agora" em Brasília, como minutos desde meia-noite — mesma regra de `todayISO()` (nunca
 *  `new Date().getHours()` cru, que leria a hora local do SERVIDOR, não de Brasília). */
export function nowMinutesOfDayInBrasilia(): number {
  return minutesOfDayInBrasilia(new Date().toISOString());
}

/** "Agora" como instante completo (timestamptz) — `new Date().toISOString()` já é correto pra
 *  isso (o instante em si não tem fuso "errado", só a LEITURA de volta como dia-de-calendário
 *  tem). Existe aqui só pra todo `updated_at`/`created_at` do projeto vir do mesmo lugar. */
export function nowISO(): string {
  return new Date().toISOString();
}

/** Data-calendário (`YYYY-MM-DD`) + hora local de Brasília (`HH:MM`) → instante (timestamptz)
 *  correto, como string ISO com offset explícito — usada por Time Blocks (`due_date`/`due_time`
 *  de uma Task viram `start_at`/`end_at` reais). Offset fixo `-03:00`: Brasília não observa
 *  horário de verão desde 2019, então não existe o caso "mesma hora, dois offsets possíveis"
 *  que tornaria isto ambíguo. Sem o offset explícito, `new Date("2026-08-27T14:00:00")` seria
 *  lido como hora LOCAL DO SERVIDOR (UTC na Vercel) — 14h vira 11h de Brasília, o mesmo viés que
 *  todo o resto deste arquivo existe pra evitar, só que na ESCRITA em vez da leitura. */
export function brasiliaDateTimeToISO(dateOnlyISO: string, time: string): string {
  const hhmm = time.length === 5 ? time : time.slice(0, 5);
  return `${dateOnlyISO}T${hhmm}:00-03:00`;
}

/** Um `Date` em UTC-midnight representando o dia de hoje em Brasília — só pra quando o chamador
 *  precisa mesmo de aritmética de `Date` (ex.: iterar meses). Ler de volta SEMPRE com os getters
 *  `getUTC*` (nunca `getFullYear()`/`getMonth()`/`getDate()` locais) — é o que mantém a garantia. */
export function todayUTCAnchor(): Date {
  const { year, month, day } = todayParts();
  return new Date(Date.UTC(year, month - 1, day));
}

/** Mês/ano de uma data-calendário `YYYY-MM-DD`, como "MM/YYYY" — parse por string, nunca via
 *  `new Date(str)`. */
export function monthKeyOf(dateOnlyISO: string): string {
  const [year, month] = dateOnlyISO.slice(0, 7).split("-");
  return `${month}/${year}`;
}

export function currentMonthKey(): string {
  return monthKeyOf(todayISO());
}

/** Dia do mês (1-31) de uma data-calendário `YYYY-MM-DD` — parse por string. */
export function dayOfMonthOf(dateOnlyISO: string): number {
  return Number(dateOnlyISO.slice(8, 10));
}

/** Quantos dias tem `month` (1-12) de `year` — usa `Date.UTC` só como truque de aritmética de
 *  calendário (dia 0 do mês seguinte = último dia deste), não pra ler "agora"/fuso, então não
 *  sofre do viés que o resto deste arquivo evita. Compartilhado entre Dashboard (ritmo de meta) e
 *  Financeiro (mesmo cálculo, novo lugar) — única fonte, evita duas contas de calendário
 *  divergirem. */
export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Formata uma data-calendário (`YYYY-MM-DD`, sem hora) pra exibição — achado em produção via
 *  hydration mismatch real (React #418): `new Intl.DateTimeFormat(...).format(new Date(dateOnly))`
 *  sem `timeZone` explícito usa o fuso LOCAL do runtime — servidor (Vercel, UTC) e navegador
 *  (Brasil, UTC-3) formatam a MESMA data-calendário como dois dias diferentes perto da meia-noite,
 *  e React vê o servidor dizer "14/08" e o cliente dizer "13/08" no mesmo elemento. `timeZone:
 *  "UTC"` aqui não é sobre fuso de verdade — é travar os dois lados (SSR e hidratação) no mesmo
 *  resultado determinístico pra um valor que já é só uma data, sem hora, pra começo de conversa. */
export function formatDateOnly(dateOnlyISO: string, options: Intl.DateTimeFormatOptions = { dateStyle: "short" }): string {
  return new Intl.DateTimeFormat("pt-BR", { ...options, timeZone: "UTC" }).format(new Date(`${dateOnlyISO}T00:00:00Z`));
}

/** Desloca uma data-calendário em N dias (aceita negativo). Aritmética de dias em si não sofre
 *  do viés de fuso (não depende de "que horas são agora") — só o ponto de PARTIDA precisa estar
 *  ancorado em `todayISO()` quando representa "hoje". */
export function addDaysISO(dateOnlyISO: string, days: number): string {
  const [year, month, day] = dateOnlyISO.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Diferença em dias (sempre positiva) entre duas datas-calendário `YYYY-MM-DD` — mesma
 *  aritmética de `addDaysISO` (não sofre do viés de fuso, é só contagem de dias). */
export function diffDaysISO(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.abs(Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000;
}

/** Últimos `count` meses (incluindo o atual), do mais antigo ao mais recente, como "MM/YYYY" —
 *  chave compatível com `monthKeyOf`, pra bater com o agrupamento de `revenue`/`expenses`. */
export function lastMonthKeys(count: number): string[] {
  const { year, month } = todayParts(); // month: 1-12
  const months: string[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const totalMonths = year * 12 + (month - 1) - i;
    const y = Math.floor(totalMonths / 12);
    const m = (totalMonths % 12) + 1;
    months.push(`${String(m).padStart(2, "0")}/${y}`);
  }
  return months;
}

const MONTH_NAMES_PT = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

/** `monthKeyOf`-shaped "MM/YYYY" por extenso — "02/2026" → "Fevereiro/2026". Só lookup em array,
 *  sem `Date`/fuso envolvido (não há dia nem hora aqui pra ter viés nenhum). */
export function formatMonthKeyLong(monthKey: string): string {
  const [mm, yyyy] = monthKey.split("/");
  return `${MONTH_NAMES_PT[Number(mm) - 1] ?? mm}/${yyyy}`;
}

/** Desloca "MM/YYYY" em N meses (aceita negativo) — mesma aritmética inteira de `lastMonthKeys`
 *  (total de meses desde o ano 0, sem `Date`/fuso envolvido). Base da navegação de mês do
 *  Dashboard (◀▶). */
export function shiftMonthKey(monthKey: string, delta: number): string {
  const [mm, yyyy] = monthKey.split("/").map(Number);
  const totalMonths = yyyy * 12 + (mm - 1) + delta;
  const year = Math.floor(totalMonths / 12);
  const month = (totalMonths % 12) + 1;
  return `${String(month).padStart(2, "0")}/${year}`;
}

/** Compara duas "MM/YYYY" — negativo se `a` é antes de `b`, 0 se iguais, positivo se depois. */
export function compareMonthKeys(a: string, b: string): number {
  const [am, ay] = a.split("/").map(Number);
  const [bm, by] = b.split("/").map(Number);
  return ay * 12 + am - (by * 12 + bm);
}

/** Primeiro e último dia de "MM/YYYY" como `YYYY-MM-DD` — comparável por string com
 *  `due_date`/`start_date`/`end_date` sem nunca construir um `Date` a partir deles (mesma regra
 *  de sempre: comparação lexicográfica de `YYYY-MM-DD` já é comparação cronológica correta). */
export function monthKeyBounds(monthKey: string): { start: string; end: string } {
  const [mm, yyyy] = monthKey.split("/");
  const year = Number(yyyy);
  const month = Number(mm);
  const lastDay = daysInMonth(year, month);
  return { start: `${yyyy}-${mm}-01`, end: `${yyyy}-${mm}-${String(lastDay).padStart(2, "0")}` };
}
