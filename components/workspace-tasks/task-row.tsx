"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, GripVertical, MoreHorizontal, Pencil, Timer, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TaskCheckbox } from "@/components/workspace-tasks/task-checkbox";
import { StartFocusDialog } from "@/components/workspace-tasks/start-focus-dialog";
import { PRIORITY_DOT_CLASS } from "@/components/workspace-tasks/priority-filter";
import { deleteTaskAction } from "@/lib/tasks/actions";
import { formatEstimatedMinutes } from "@/lib/tasks/quick-parse";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/supabase/types/database";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });

/**
 * Uma linha de tarefa — drag & drop (§9), seleção múltipla (§10), badges de cliente/duração
 * (§7/§5), gatilho de Timer/Pomodoro (§15/§16), ponto de cor de prioridade (filtro, ver
 * `priority-filter.tsx`) e exclusão direta (1 clique + confirmação, sem precisar abrir "Editar"
 * primeiro — pedido explícito, "deve ser mais fácil excluir"). "Mover pra cima/baixo" sempre
 * visível (não só no hover) — alternativa ao drag pro mobile (§27).
 *
 * Raiz virou `motion.li` (era `<li>` puro) — o drag/drop que antes ficava num `<div>` telha por
 * fora agora é a própria linha, e isso é o que permite o fade de saída ao concluir (pedido
 * explícito): quem chama (`TaskListSection`/`TaskGroupSection`) tira a tarefa do array assim que
 * ela é marcada feita, e o `exit` do Framer Motion anima o desaparecimento em vez de sumir seco.
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
  draggable,
  dragging,
  onDragStart,
  onDragOver,
  onDrop,
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
  draggable?: boolean;
  dragging?: boolean;
  onDragStart?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}) {
  const router = useRouter();
  const [focusMode, setFocusMode] = useState<"free" | "pomodoro" | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();

  function handleDelete() {
    startDeleteTransition(async () => {
      const result = await deleteTaskAction(task.id);
      if (!result.ok) return;
      setConfirmingDelete(false);
      router.refresh();
    });
  }

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
      <button
        type="button"
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

      {task.priority && <span className={cn("size-1.5 shrink-0 rounded-full", PRIORITY_DOT_CLASS[task.priority])} aria-hidden="true" />}

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
        <button type="button" onClick={() => setConfirmingDelete(true)} aria-label={`Excluir "${task.title}"`} className="rounded p-1 text-muted-foreground hover:text-destructive">
          <Trash2 className="size-3.5" />
        </button>
        <button type="button" onClick={onEdit} aria-label={`Editar ${task.title}`} className="rounded p-1 text-muted-foreground hover:text-foreground">
          <Pencil className="size-3.5" />
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

      <ConfirmDialog
        open={confirmingDelete}
        onOpenChange={setConfirmingDelete}
        title="Excluir tarefa?"
        description={`"${task.title}" some pra sempre — não dá pra desfazer.`}
        isPending={isDeleting}
        onConfirm={handleDelete}
      />
    </motion.li>
  );
}
