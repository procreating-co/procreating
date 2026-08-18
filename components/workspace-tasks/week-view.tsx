"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createTaskAction, updateTaskAction, updateTaskStatusAction } from "@/lib/tasks/actions";
import { addDaysISO, formatDateOnly, todayISO } from "@/lib/date";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Task, User } from "@/lib/supabase/types/database";
import { cn } from "@/lib/utils";

/**
 * Visão de semana — 7 colunas (hoje + 6 dias seguintes), distribuição por dia, NÃO uma agenda com
 * grade de hora (volume real de tarefas é baixo hoje — grid de horário seria complexidade sem
 * necessidade real). Substitui "Próximos prazos": mesmo dado no fundo, duas UIs mostrando a mesma
 * coisa de formas diferentes seria redundante.
 *
 * `tasks` já vem filtrado pro intervalo certo (`listWeekTasks`, `lib/tasks/queries.ts`) — este
 * componente só agrupa por `due_date` e desenha; toggle de concluída reaproveita
 * `updateTaskStatusAction`, a mesma Server Action que "Tarefas de hoje" já usa.
 *
 * Task + Calendar bidirecional (§51) — arrastar uma tarefa pra outro dia reagenda de verdade
 * (`updateTaskAction`, já existe, sem action nova). Mesmo padrão de drag-and-drop do Pipeline
 * (`pipeline-board.tsx`): estado React (`draggingTaskId`), não `dataTransfer.getData` no drop —
 * é o que já funciona neste projeto, não reinventado aqui.
 *
 * `formatDateOnly` (não `new Date(dateOnly).format()` cru) — evita o mesmo mismatch de hidratação
 * já documentado em `lib/date.ts` (SSR em UTC vs. navegador em UTC-3 formatando dia diferente
 * perto da meia-noite).
 */
export function WeekView({ tasks, userId, teamMembers }: { tasks: Task[]; userId: string; teamMembers: User[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverDay, setDragOverDay] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Clicar num dia abre modal pra adicionar tarefa naquele dia (pedido explícito) — `addingDay`
  // guarda a data-calendário do dia clicado, `null` = modal fechado.
  const [addingDay, setAddingDay] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState(userId);
  const [addError, setAddError] = useState<string | null>(null);
  const [isAdding, startAddTransition] = useTransition();

  const today = todayISO();
  const days = Array.from({ length: 7 }, (_, i) => addDaysISO(today, i));

  const tasksByDay = new Map<string, Task[]>(days.map((day) => [day, []]));
  for (const task of tasks) {
    if (task.due_date && tasksByDay.has(task.due_date)) tasksByDay.get(task.due_date)!.push(task);
  }

  // Auditoria de estados de erro (hardening) — os dois toggles abaixo eram "dispara e esquece":
  // se a Server Action falhasse (rede, RLS), o checkbox/card só voltava sozinho no refresh sem
  // explicar por quê, parecendo um clique perdido. Mesmo padrão `role="alert"` já usado no resto
  // do produto.
  function toggle(task: Task) {
    setError(null);
    startTransition(async () => {
      const result = await updateTaskStatusAction(task.id, task.status === "done" ? "pending" : "done");
      if (!result.ok) setError(result.error);
      router.refresh();
    });
  }

  function handleDrop(day: string) {
    const taskId = draggingTaskId;
    setDraggingTaskId(null);
    setDragOverDay(null);
    if (!taskId) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.due_date === day) return;

    setError(null);
    startTransition(async () => {
      const result = await updateTaskAction(task.id, {
        title: task.title,
        assigneeId: task.assignee_id,
        dueDate: day,
        dueTime: task.due_time,
        contextType: task.context_type,
        contextId: task.context_id,
      });
      if (!result.ok) setError(result.error);
      router.refresh();
    });
  }

  function openAddTask(day: string) {
    setAddError(null);
    setNewTaskTitle("");
    setNewTaskAssignee(userId);
    setAddingDay(day);
  }

  function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!addingDay) return;
    setAddError(null);
    startAddTransition(async () => {
      const result = await createTaskAction({ title: newTaskTitle, assigneeId: newTaskAssignee || null, dueDate: addingDay });
      if (!result.ok) {
        setAddError(result.error);
        return;
      }
      setAddingDay(null);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {days.map((day, index) => {
          const dayTasks = tasksByDay.get(day) ?? [];
          const isDragOver = dragOverDay === day;
          return (
            <div
              key={day}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverDay(day);
              }}
              onDragLeave={() => setDragOverDay((current) => (current === day ? null : current))}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(day);
              }}
              className={cn(
                "flex min-h-28 flex-col gap-2 rounded-xl border border-border/60 bg-card/40 p-3 transition-colors",
                isDragOver && "border-foreground/40 bg-card/70",
              )}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className={cn("text-xs font-medium uppercase tracking-wide", index === 0 ? "text-brand" : "text-muted-foreground")}>
                  {index === 0 ? "Hoje" : formatDateOnly(day, { weekday: "short" })}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-muted-foreground">{formatDateOnly(day, { day: "2-digit", month: "2-digit" })}</span>
                  {/* Clicar no dia abre modal pra adicionar tarefa nele (pedido explícito) */}
                  <button
                    type="button"
                    onClick={() => openAddTask(day)}
                    aria-label={`Adicionar tarefa em ${formatDateOnly(day)}`}
                    className="flex size-4 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
                  >
                    <Plus className="size-3" />
                  </button>
                </div>
              </div>
              {dayTasks.length === 0 ? (
                <p className="text-xs text-muted-foreground/60">—</p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {dayTasks.map((task) => (
                    <li
                      key={task.id}
                      draggable
                      onDragStart={() => setDraggingTaskId(task.id)}
                      onDragEnd={() => setDraggingTaskId(null)}
                      className={cn("flex cursor-grab items-start gap-1.5 active:cursor-grabbing", draggingTaskId === task.id && "opacity-30")}
                    >
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

      <Dialog open={addingDay !== null} onOpenChange={(open) => !open && setAddingDay(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Nova tarefa</DialogTitle>
            <DialogDescription>{addingDay ? formatDateOnly(addingDay, { weekday: "long", day: "2-digit", month: "long" }) : ""}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddTask} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="week-add-title">Título</Label>
              <Input id="week-add-title" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} required autoFocus />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="week-add-assignee">Responsável</Label>
              <select
                id="week-add-assignee"
                value={newTaskAssignee}
                onChange={(e) => setNewTaskAssignee(e.target.value)}
                className="h-9 rounded-md border border-input bg-input-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
            {addError && (
              <p role="alert" className="text-sm text-destructive">
                {addError}
              </p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddingDay(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isAdding || !newTaskTitle.trim()}>
                {isAdding ? "Adicionando..." : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
