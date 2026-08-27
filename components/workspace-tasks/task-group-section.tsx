"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { TaskRow } from "@/components/workspace-tasks/task-row";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/supabase/types/database";

/** Bloco de tarefas (§14 — "Operacional: Elenita, Kawhen...") — expansível/recolhível,
 *  progresso "N/M concluídas". Reordenar/drag funciona dentro do grupo (entre grupos fica pra
 *  uma rodada futura — ver relatório). */
export function TaskGroupSection({
  title,
  tasks,
  clientNameById,
  selectedIds,
  selectionMode,
  onToggleDone,
  onToggleSelect,
  onEdit,
  onMove,
  onDrop,
  onFocusStarted,
  disabled,
}: {
  title: string;
  tasks: Task[];
  clientNameById: Map<string, string>;
  selectedIds: Set<string>;
  selectionMode: boolean;
  onToggleDone: (task: Task) => void;
  onToggleSelect: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onMove: (task: Task, direction: "up" | "down") => void;
  onDrop: (draggedId: string, targetId: string) => void;
  onFocusStarted: () => void;
  disabled: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const done = tasks.filter((t) => t.status === "done").length;

  return (
    <div className="flex flex-col gap-2">
      <button type="button" onClick={() => setCollapsed((c) => !c)} className="flex items-center gap-2 text-left">
        <ChevronRight className={cn("size-3.5 text-muted-foreground transition-transform", !collapsed && "rotate-90")} />
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</span>
        <span className="text-xs text-muted-foreground">
          {done}/{tasks.length} concluídas
        </span>
        <Progress value={tasks.length === 0 ? 0 : (done / tasks.length) * 100} className="h-1 max-w-[80px] flex-1" />
      </button>

      {!collapsed && (
        <ul className="flex flex-col divide-y divide-border/60 rounded-xl border border-border/60 bg-card/40">
          {tasks.map((task) => (
            <div
              key={task.id}
              draggable
              onDragStart={() => setDragId(task.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (dragId && dragId !== task.id) onDrop(dragId, task.id);
                setDragId(null);
              }}
              className={cn(dragId === task.id && "opacity-40")}
            >
              <TaskRow
                task={task}
                clientName={task.client_id ? (clientNameById.get(task.client_id) ?? null) : null}
                selected={selectedIds.has(task.id)}
                selectionMode={selectionMode}
                onToggleDone={() => onToggleDone(task)}
                onToggleSelect={() => onToggleSelect(task.id)}
                onEdit={() => onEdit(task)}
                onMove={(direction) => onMove(task, direction)}
                onFocusStarted={onFocusStarted}
                disabled={disabled}
                dragHandleProps={{}}
              />
            </div>
          ))}
        </ul>
      )}
    </div>
  );
}
