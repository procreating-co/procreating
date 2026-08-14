"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/dashboard/empty-state";
import { createTaskAction, updateTaskStatusAction } from "@/lib/tasks/actions";
import type { Task } from "@/lib/supabase/types/database";
import { cn } from "@/lib/utils";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });

export function MyDayTasks({ tasks, userId }: { tasks: Task[]; userId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createTaskAction({ title, assigneeId: userId, dueDate: dueDate || null, contextType: null, contextId: null });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setTitle("");
      setDueDate("");
      router.refresh();
    });
  }

  function toggle(task: Task) {
    startTransition(async () => {
      await updateTaskStatusAction(task.id, task.status === "done" ? "pending" : "done");
      router.refresh();
    });
  }

  const pending = tasks.filter((t) => t.status !== "done");
  const done = tasks.filter((t) => t.status === "done");

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleCreate} className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/40 p-5 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-2">
          <label htmlFor="task-title" className="text-xs text-muted-foreground">
            Nova tarefa
          </label>
          <Input id="task-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="O que precisa ser feito hoje?" required />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="task-due" className="text-xs text-muted-foreground">
            Prazo
          </label>
          <Input id="task-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="sm:w-40" />
        </div>
        <Button type="submit" disabled={isPending} className="gap-2">
          <Plus className="size-4" />
          Adicionar
        </Button>
      </form>
      {error && <p className="text-sm text-destructive">{error}</p>}

      {tasks.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="Nenhuma tarefa vencendo hoje ou atrasada"
          description="Adicione uma tarefa acima, ou aproveite o dia livre."
          fullBleed={false}
        />
      ) : (
        <div className="flex flex-col gap-6">
          <TaskGroup title="Pendentes" tasks={pending} onToggle={toggle} disabled={isPending} />
          {done.length > 0 && <TaskGroup title="Concluídas" tasks={done} onToggle={toggle} disabled={isPending} />}
        </div>
      )}
    </div>
  );
}

function TaskGroup({ title, tasks, onToggle, disabled }: { title: string; tasks: Task[]; onToggle: (task: Task) => void; disabled: boolean }) {
  if (tasks.length === 0) return <p className="text-sm text-muted-foreground">Nenhuma tarefa pendente — dia livre.</p>;
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</h2>
      <ul className="flex flex-col divide-y divide-border/60 rounded-xl border border-border/60 bg-card/40">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-center gap-3 px-4 py-3">
            <input
              type="checkbox"
              checked={task.status === "done"}
              disabled={disabled}
              onChange={() => onToggle(task)}
              className="size-4 rounded border-input"
            />
            <span className={cn("flex-1 text-sm", task.status === "done" && "text-muted-foreground line-through")}>{task.title}</span>
            {task.due_date && <span className="text-xs text-muted-foreground">{dateFormatter.format(new Date(`${task.due_date}T00:00:00`))}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
