"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/dashboard/empty-state";
import { TaskEditDialog } from "@/components/workspace-tasks/task-edit-dialog";
import { createTaskAction, updateTaskStatusAction } from "@/lib/tasks/actions";
import { describeQuickTaskPreview, parseQuickTask } from "@/lib/tasks/quick-parse";
import type { Task, User } from "@/lib/supabase/types/database";
import { cn } from "@/lib/utils";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });

/**
 * Master prompt §49/§50 — uma linha só, o parser entende data/hora/responsável, sem abrir campos
 * separados. "Editar vídeo amanhã às 15h" ↵ → task pra amanhã, 15h, comigo. "@Eduardo editar
 * vídeo amanhã às 15h" ↵ → mesma coisa, responsável Eduardo. `parseQuickTask` roda a cada tecla
 * só pro preview (nada é salvo até enviar) e de novo no submit — mesma função, sem duplicar regra.
 */
export function WorkspaceTasks({ tasks, userId, teamMembers }: { tasks: Task[]; userId: string; teamMembers: User[] }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const preview = useMemo(() => describeQuickTaskPreview(text, teamMembers), [text, teamMembers]);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setError(null);
    const result = parseQuickTask(text, teamMembers);
    if (!result.title) {
      setError("A tarefa ficou sem título depois de tirar data/hora/responsável — reescreva.");
      return;
    }
    startTransition(async () => {
      const created = await createTaskAction({
        title: result.title,
        assigneeId: result.assigneeId ?? userId,
        dueDate: result.dueDate,
        dueTime: result.dueTime,
        contextType: null,
        contextId: null,
      });
      if (!created.ok) {
        setError(created.error);
        return;
      }
      setText("");
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
      <form onSubmit={handleCreate} className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card/40 p-5">
        <div className="flex items-center gap-3">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='"Editar vídeo amanhã às 15h" ou "@Eduardo ligar pro cliente sexta"'
            className="flex-1"
          />
          <Button type="submit" disabled={isPending || !text.trim()} className="shrink-0 gap-2">
            <Plus className="size-4" />
            Adicionar
          </Button>
        </div>
        {text.trim() && <p className="text-xs text-muted-foreground">{preview}</p>}
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
          <TaskGroup title="Pendentes" tasks={pending} onToggle={toggle} onEdit={setEditingTask} disabled={isPending} />
          {done.length > 0 && <TaskGroup title="Concluídas" tasks={done} onToggle={toggle} onEdit={setEditingTask} disabled={isPending} />}
        </div>
      )}

      {editingTask && (
        <TaskEditDialog key={editingTask.id} task={editingTask} teamMembers={teamMembers} open onOpenChange={(open) => !open && setEditingTask(null)} />
      )}
    </div>
  );
}

function TaskGroup({
  title,
  tasks,
  onToggle,
  onEdit,
  disabled,
}: {
  title: string;
  tasks: Task[];
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  disabled: boolean;
}) {
  if (tasks.length === 0) return <p className="text-sm text-muted-foreground">Nenhuma tarefa pendente — dia livre.</p>;
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</h2>
      <ul className="flex flex-col divide-y divide-border/60 rounded-xl border border-border/60 bg-card/40">
        {tasks.map((task) => (
          <li key={task.id} className="group flex items-center gap-3 px-4 py-3">
            <input
              type="checkbox"
              checked={task.status === "done"}
              disabled={disabled}
              onChange={() => onToggle(task)}
              className="size-4 rounded border-input"
            />
            <span className={cn("flex-1 text-sm", task.status === "done" && "text-muted-foreground line-through")}>{task.title}</span>
            {task.due_date && (
              <span className="text-xs text-muted-foreground">
                {dateFormatter.format(new Date(`${task.due_date}T00:00:00`))}
                {task.due_time && ` · ${task.due_time.slice(0, 5)}`}
              </span>
            )}
            <button
              type="button"
              onClick={() => onEdit(task)}
              aria-label={`Editar ${task.title}`}
              className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
            >
              <Pencil className="size-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
