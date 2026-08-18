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

/** "Agora" como instante completo (timestamptz) — `new Date().toISOString()` já é correto pra
 *  isso (o instante em si não tem fuso "errado", só a LEITURA de volta como dia-de-calendário
 *  tem). Existe aqui só pra todo `updated_at`/`created_at` do projeto vir do mesmo lugar. */
export function nowISO(): string {
  return new Date().toISOString();
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
