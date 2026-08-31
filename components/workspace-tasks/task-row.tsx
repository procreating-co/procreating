"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, GripVertical, MoreHorizontal, Pencil, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TaskCheckbox } from "@/components/workspace-tasks/task-checkbox";
import { StartFocusDialog } from "@/components/workspace-tasks/start-focus-dialog";
import { formatEstimatedMinutes } from "@/lib/tasks/quick-parse";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/supabase/types/database";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });

/**
 * Uma linha de tarefa — drag & drop (§9), seleção múltipla (§10), badges de cliente/duração
 * (§7/§5) e o gatilho de Timer/Pomodoro (§15/§16) juntos, um componente só (antes espalhado
 * inline em `workspace-tasks.tsx`). "Mover pra cima/baixo" sempre visível (não só no hover) —
 * alternativa ao drag pro mobile (§27), onde arrastar não é a única forma de reordenar.
 */
export function TaskRow({
  task,
  clientName,
  selected,
  selectionMode,
  onToggleDone,
  onToggleSelect,
  onEdit,
  onMove,
  onFocusStarted,
  disabled,
  dragHandleProps,
}: {
  task: Task;
  clientName: string | null;
  selected: boolean;
  selectionMode: boolean;
  onToggleDone: () => void;
  onToggleSelect: () => void;
  onEdit: () => void;
  onMove: (direction: "up" | "down") => void;
  onFocusStarted: () => void;
  disabled: boolean;
  dragHandleProps: React.HTMLAttributes<HTMLButtonElement>;
}) {
  const [focusMode, setFocusMode] = useState<"free" | "pomodoro" | null>(null);

  return (
    <li className={cn("group flex items-center gap-2 px-4 py-3 transition-colors", selected && "bg-brand/5")}>
      <button
        type="button"
        {...dragHandleProps}
        aria-label={`Arrastar "${task.title}" pra reordenar`}
        className="hidden shrink-0 cursor-grab text-muted-foreground/50 hover:text-foreground active:cursor-grabbing sm:block"
      >
        <GripVertical className="size-4" />
      </button>

      <div className="flex shrink-0 flex-col">
        <button type="button" onClick={() => onMove("up")} aria-label={`Mover "${task.title}" pra cima`} className="text-muted-foreground/50 hover:text-foreground">
          <ChevronUp className="size-3" />
        </button>
        <button type="button" onClick={() => onMove("down")} aria-label={`Mover "${task.title}" pra baixo`} className="text-muted-foreground/50 hover:text-foreground">
          <ChevronDown className="size-3" />
        </button>
      </div>

      {selectionMode ? (
        <TaskCheckbox checked={selected} onToggle={onToggleSelect} disabled={disabled} label={`Selecionar "${task.title}"`} />
      ) : (
        <TaskCheckbox checked={task.status === "done"} onToggle={onToggleDone} disabled={disabled} label={`Marcar "${task.title}" como concluída`} />
      )}

      <span className={cn("flex-1 text-sm", task.status === "done" && "text-muted-foreground line-through")}>{task.title}</span>

      {clientName && (
        <Badge variant="outline" className="shrink-0">
          {clientName}
        </Badge>
      )}
      {task.estimated_minutes && (
        <Badge variant="default" className="shrink-0">
          {formatEstimatedMinutes(task.estimated_minutes)}
        </Badge>
      )}
      {task.due_date && (
        <span className="shrink-0 text-xs text-muted-foreground">
          {dateFormatter.format(new Date(`${task.due_date}T00:00:00`))}
          {task.due_time && ` · ${task.due_time.slice(0, 5)}`}
        </span>
      )}

      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" aria-label={`Ações de "${task.title}"`} className="rounded p-1 text-muted-foreground hover:text-foreground">
              <MoreHorizontal className="size-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setFocusMode("free")}>
              <Timer className="size-3.5" />
              Iniciar timer
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setFocusMode("pomodoro")}>
              <Timer className="size-3.5" />
              Iniciar Pomodoro
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <button type="button" onClick={onEdit} aria-label={`Editar ${task.title}`} className="rounded p-1 text-muted-foreground hover:text-foreground">
          <Pencil className="size-3.5" />
        </button>
      </div>

      {focusMode && (
        <StartFocusDialog
          taskId={task.id}
          taskTitle={task.title}
          mode={focusMode}
          open={focusMode !== null}
          onOpenChange={(open) => !open && setFocusMode(null)}
          onStarted={() => {
            setFocusMode(null);
            onFocusStarted();
          }}
        />
      )}
    </li>
  );
}
