/**
 * TaskPlanner (§12/§21) — algoritmo determinístico, sem I/O (mesmo espírito de
 * `quick-parse.ts`/`batch-parse.ts`: puro, testável, chamável do client pra preview antes de
 * qualquer Server Action rodar). Encaixa tarefas em ordem (prioridade manual = ordem da lista
 * que chega, já ordenada por `position`) nos intervalos livres de um dia, contornando blocos já
 * ocupados e um horário de trabalho.
 *
 * Não existe "horário de trabalho" configurável no projeto (auditado — não existe) — o padrão
 * abaixo (`DEFAULT_WORK_WINDOW`, 9h–18h) é um valor explícito, documentado, não uma
 * configuração escondida; a UI deixa claro que é um padrão, não algo lido de uma preferência
 * real do usuário.
 *
 * Tarefa sem `estimatedMinutes` NUNCA entra no plano com uma duração inventada — vai pra
 * `unscheduled`, a UI mostra "sem duração definida" em vez de forçar um número.
 */

export type PlannerTask = { id: string; title: string; estimatedMinutes: number | null };
export type PlannerBusySlot = { startMinutes: number; endMinutes: number; label: string };
export type PlannerSuggestion = { taskId: string; title: string; startMinutes: number; endMinutes: number };
export type PlannerResult = { scheduled: PlannerSuggestion[]; unscheduled: PlannerTask[] };

export const DEFAULT_WORK_WINDOW = { startMinutes: 9 * 60, endMinutes: 18 * 60 };
/** Pausa mínima entre blocos sugeridos consecutivos — evita empilhar tarefas coladas sem
 *  respiro nenhum (não pedido explicitamente, mas "sem excesso" já é princípio do resto do
 *  produto — 10min é pequeno o bastante pra não distorcer a duração total do dia). */
const GAP_BETWEEN_BLOCKS_MINUTES = 10;

export function minutesToClock(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function clockToMinutes(clock: string): number {
  const [h, m] = clock.split(":").map(Number);
  return h * 60 + (m || 0);
}

/** Interseção de intervalos, forma clássica: `startA < endB && startB < endA`. */
function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function suggestSchedule(
  tasks: PlannerTask[],
  busySlots: PlannerBusySlot[],
  workWindow: { startMinutes: number; endMinutes: number } = DEFAULT_WORK_WINDOW,
  nowMinutes: number | null = null,
): PlannerResult {
  const sortedBusy = [...busySlots].sort((a, b) => a.startMinutes - b.startMinutes);
  const scheduled: PlannerSuggestion[] = [];
  const unscheduled: PlannerTask[] = [];

  let cursor = Math.max(workWindow.startMinutes, nowMinutes ?? workWindow.startMinutes);

  for (const task of tasks) {
    if (!task.estimatedMinutes || task.estimatedMinutes <= 0) {
      unscheduled.push(task);
      continue;
    }

    // Avança o cursor até um ponto livre — pula qualquer bloco ocupado (existente ou já
    // sugerido nesta mesma passada) que o intervalo candidato cruzar.
    let placed = false;
    // Máximo de iterações = nº de blocos ocupados + 1 (nunca laço infinito: cada iteração ou
    // encaixa a tarefa ou avança o cursor pra depois de um bloco concreto).
    for (let attempt = 0; attempt <= sortedBusy.length + scheduled.length; attempt += 1) {
      const candidateStart = cursor;
      const candidateEnd = cursor + task.estimatedMinutes;

      if (candidateEnd > workWindow.endMinutes) break; // não cabe mais hoje

      const allBusy = [...sortedBusy, ...scheduled.map((s) => ({ startMinutes: s.startMinutes, endMinutes: s.endMinutes, label: s.title }))];
      const collision = allBusy.find((busy) => overlaps(candidateStart, candidateEnd, busy.startMinutes, busy.endMinutes));

      if (!collision) {
        scheduled.push({ taskId: task.id, title: task.title, startMinutes: candidateStart, endMinutes: candidateEnd });
        // O respiro entra AQUI, só depois de uma tarefa colocada com sucesso — não ao pular um
        // compromisso já existente na agenda (ali o encaixe certo é colado na borda, "reunião
        // até 10h, tarefa começa às 10h", sem 10min de troco).
        cursor = candidateEnd + GAP_BETWEEN_BLOCKS_MINUTES;
        placed = true;
        break;
      }
      cursor = collision.endMinutes;
    }

    if (!placed) unscheduled.push(task);
  }

  return { scheduled, unscheduled };
}
