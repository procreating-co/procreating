"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, MoreHorizontal, Timer, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TaskCheckbox } from "@/components/workspace-tasks/task-checkbox";
import { StartFocusDialog } from "@/components/workspace-tasks/start-focus-dialog";
import { PRIORITY_DOT_CLASS, PRIORITY_LABEL } from "@/components/workspace-tasks/priority-filter";
import { formatEstimatedMinutes } from "@/lib/tasks/quick-parse";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/supabase/types/database";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });

/**
 * Uma linha de tarefa — redesenho pedido explícito: nenhum ícone à esquerda do título (saiu o
 * "grip" de arrastar — só decorativo, nunca foi o que disparava o drag de verdade, que continua
 * funcionando ao arrastar a linha inteira; e a prioridade virou um ponto depois do título, não
 * antes). Clicar no próprio título abre "Editar" (saiu o lápis separado). Mover pra cima/baixo
 * agora fica à direita, sempre visível (mobile não tem hover pra revelar nada escondido). Excluir
 * é 1 clique direto, sem confirmação (pedido explícito — "o mais rápido possível"): quem chama
 * (`workspace-tasks.tsx`) já tira a tarefa da lista otimisticamente antes da resposta do
 * servidor, mesmo padrão do fade ao concluir.
 */
export function TaskRow({
  task,
  clientName,
  assigneeName,
  selected,
  selectionMode,
  onToggleDone,
  onToggleSelect,
  onEdit,
  onMove,
  onDelete,
  onFocusStarted,
  disabled,
  draggable,
  dragging,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  task: Task;
  clientName: string | null;
  /** Primeiro nome do responsável — só passado quando há mais de 1 pessoa na conta (ver
   *  `assigneeNameById` em `workspace-tasks.tsx`); `null`/undefined não renderiza nada. */
  assigneeName?: string | null;
  selected: boolean;
  selectionMode: boolean;
  onToggleDone: () => void;
  onToggleSelect: () => void;
  onEdit: () => void;
  onMove: (direction: "up" | "down") => void;
  onDelete: () => void;
  onFocusStarted: () => void;
  disabled: boolean;
  draggable?: boolean;
  dragging?: boolean;
  onDragStart?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}) {
  const [focusMode, setFocusMode] = useState<"free" | "pomodoro" | null>(null);

  return (
    <motion.li
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={cn("group flex list-none items-center gap-2 overflow-hidden px-4 py-3 transition-colors", selected && "bg-brand/5", dragging && "opacity-40")}
    >
      {selectionMode ? (
        <TaskCheckbox checked={selected} onToggle={onToggleSelect} disabled={disabled} label={`Selecionar "${task.title}"`} />
      ) : (
        <TaskCheckbox checked={task.status === "done"} onToggle={onToggleDone} disabled={disabled} label={`Marcar "${task.title}" como concluída`} />
      )}

      <button
        type="button"
        onClick={onEdit}
        title="Editar"
        className={cn(
          "min-w-0 flex-1 truncate text-left text-sm underline-offset-2 hover:underline",
          task.status === "done" && "text-muted-foreground line-through",
        )}
      >
        {task.title}
      </button>

      {task.priority && (
        <span className={cn("size-1.5 shrink-0 rounded-full", PRIORITY_DOT_CLASS[task.priority])} role="img" aria-label={`Prioridade ${PRIORITY_LABEL[task.priority]}`} />
      )}
      {clientName && (
        <Badge variant="outline" className="shrink-0">
          {clientName}
        </Badge>
      )}
      {assigneeName && <span className="shrink-0 text-xs text-muted-foreground">{assigneeName}</span>}
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

      <div className="flex shrink-0 items-center gap-0.5">
        <button type="button" onClick={() => onMove("up")} aria-label={`Mover "${task.title}" pra cima`} className="rounded p-1 text-muted-foreground/60 hover:text-foreground">
          <ChevronUp className="size-3.5" />
        </button>
        <button type="button" onClick={() => onMove("down")} aria-label={`Mover "${task.title}" pra baixo`} className="rounded p-1 text-muted-foreground/60 hover:text-foreground">
          <ChevronDown className="size-3.5" />
        </button>
        <button type="button" onClick={onDelete} aria-label={`Excluir "${task.title}"`} className="rounded p-1 text-muted-foreground hover:text-destructive">
          <Trash2 className="size-3.5" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" aria-label={`Mais ações de "${task.title}"`} className="rounded p-1 text-muted-foreground hover:text-foreground">
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
    </motion.li>
  );
}
