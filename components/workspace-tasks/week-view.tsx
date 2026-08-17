"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateTaskStatusAction } from "@/lib/tasks/actions";
import { addDaysISO, formatDateOnly, todayISO } from "@/lib/date";
import type { Task } from "@/lib/supabase/types/database";
import { cn } from "@/lib/utils";

/**
 * Visão de semana (item 3) — 7 colunas (hoje + 6 dias seguintes), distribuição por dia, NÃO uma
 * agenda com grade de hora (volume real de tarefas é baixo hoje — grid de horário seria
 * complexidade sem necessidade real). Substitui "Próximos prazos": mesmo dado no fundo (tarefas
 * dos próximos dias), duas UIs mostrando a mesma coisa de formas diferentes seria redundante.
 *
 * `tasks` já vem filtrado pro intervalo certo (`listWeekTasks`, `lib/tasks/queries.ts`) — este
 * componente só agrupa por `due_date` e desenha; toggle de concluída reaproveita
 * `updateTaskStatusAction`, a mesma Server Action que "Tarefas de hoje" já usa.
 *
 * `formatDateOnly` (não `new Date(dateOnly).format()` cru) — evita o mesmo mismatch de hidratação
 * já documentado em `lib/date.ts` (SSR em UTC vs. navegador em UTC-3 formatando dia diferente
 * perto da meia-noite).
 */
export function WeekView({ tasks }: { tasks: Task[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const today = todayISO();
  const days = Array.from({ length: 7 }, (_, i) => addDaysISO(today, i));

  const tasksByDay = new Map<string, Task[]>(days.map((day) => [day, []]));
  for (const task of tasks) {
    if (task.due_date && tasksByDay.has(task.due_date)) tasksByDay.get(task.due_date)!.push(task);
  }

  function toggle(task: Task) {
    startTransition(async () => {
      await updateTaskStatusAction(task.id, task.status === "done" ? "pending" : "done");
      router.refresh();
    });
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      {days.map((day, index) => {
        const dayTasks = tasksByDay.get(day) ?? [];
        return (
          <div key={day} className="flex min-h-28 flex-col gap-2 rounded-xl border border-border/60 bg-card/40 p-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className={cn("text-xs font-medium uppercase tracking-wide", index === 0 ? "text-brand" : "text-muted-foreground")}>
                {index === 0 ? "Hoje" : formatDateOnly(day, { weekday: "short" })}
              </span>
              <span className="text-[11px] text-muted-foreground">{formatDateOnly(day, { day: "2-digit", month: "2-digit" })}</span>
            </div>
            {dayTasks.length === 0 ? (
              <p className="text-xs text-muted-foreground/60">—</p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {dayTasks.map((task) => (
                  <li key={task.id} className="flex items-start gap-1.5">
                    <input
                      type="checkbox"
                      checked={task.status === "done"}
                      disabled={isPending}
                      onChange={() => toggle(task)}
                      aria-label={`Marcar "${task.title}" como concluída`}
                      className="mt-0.5 size-3.5 shrink-0 rounded border-input"
                    />
                    <span className={cn("text-xs leading-snug", task.status === "done" && "text-muted-foreground line-through")}>{task.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
