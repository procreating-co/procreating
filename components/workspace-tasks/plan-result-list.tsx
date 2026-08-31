import { minutesToClock } from "@/lib/tasks/planner";
import type { PlannerResult } from "@/lib/tasks/planner";

/** Lista de preview compartilhada entre "Planejar meu dia" (§21) e "Planejar bloco" (§11) — o
 *  mesmo `PlannerResult`, dois botões de entrada diferentes. */
export function PlanResultList({ plan }: { plan: PlannerResult }) {
  if (plan.scheduled.length === 0 && plan.unscheduled.length === 0) {
    return <p className="text-sm text-muted-foreground">Nada pra planejar — sem tarefas pendentes com duração definida.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {plan.scheduled.length > 0 && (
        <ul className="flex flex-col divide-y divide-border/60 rounded-xl border border-border/60 bg-card/40">
          {plan.scheduled.map((item) => (
            <li key={item.taskId} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
              <span>{item.title}</span>
              <span className="font-mono text-xs text-muted-foreground">
                {minutesToClock(item.startMinutes)} – {minutesToClock(item.endMinutes)}
              </span>
            </li>
          ))}
        </ul>
      )}
      {plan.unscheduled.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Ficaram de fora</p>
          <ul className="flex flex-col gap-1">
            {plan.unscheduled.map((task) => (
              <li key={task.id} className="text-sm text-muted-foreground">
                {task.title} {task.estimatedMinutes === null ? "— sem duração definida" : "— não coube no expediente"}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
