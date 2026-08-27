"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck, ListChecks, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/dashboard/empty-state";
import { TaskEditDialog } from "@/components/workspace-tasks/task-edit-dialog";
import { TaskRow } from "@/components/workspace-tasks/task-row";
import { TaskGroupSection } from "@/components/workspace-tasks/task-group-section";
import { BulkActionBar } from "@/components/workspace-tasks/bulk-action-bar";
import { ClientAmbiguityDialog } from "@/components/workspace-tasks/client-ambiguity-dialog";
import { FocusTimerBar } from "@/components/workspace-tasks/focus-timer-bar";
import { createTaskAction, createTaskBatchAction, reorderTaskAction, updateTaskStatusAction, type RunningFocusSession } from "@/lib/tasks/actions";
import { parseQuickTask, type ParsedQuickTask, type QuickParseClient } from "@/lib/tasks/quick-parse";
import { parseTaskBatch, type BatchParsedItem } from "@/lib/tasks/batch-parse";
import { computePositionBetween } from "@/lib/tasks/position";
import type { Task, User } from "@/lib/supabase/types/database";
import type { TaskInput } from "@/lib/tasks/types";
import { cn } from "@/lib/utils";

function toTaskInput(item: BatchParsedItem | ParsedQuickTask, fallbackAssigneeId: string): TaskInput {
  return {
    title: item.title,
    assigneeId: item.assigneeId ?? fallbackAssigneeId,
    dueDate: item.dueDate,
    dueTime: item.dueTime,
    clientId: item.clientId,
    estimatedMinutes: item.estimatedMinutes,
    contextType: null,
    contextId: null,
  };
}

/**
 * Task Intelligence — evolução de `WorkspaceTasks` (Master prompt §49/§50 original). Continua o
 * MESMO componente/lista/Server Actions de sempre, estendido: entrada aceita texto em várias
 * linhas (`parseTaskBatch`) além da linha única de sempre (`parseQuickTask`), grupos (§14),
 * seleção múltipla + ações em lote (§10), drag & drop com posição persistente (§8/§9), e o
 * gatilho de Timer/Pomodoro por tarefa (§15/§16) embutido em `TaskRow`.
 */
export function WorkspaceTasks({
  tasks,
  userId,
  teamMembers,
  clients,
  taskGroups,
  initialRunningSession,
}: {
  tasks: Task[];
  userId: string;
  teamMembers: User[];
  clients: QuickParseClient[];
  taskGroups: { id: string; title: string }[];
  initialRunningSession: RunningFocusSession | null;
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [ambiguity, setAmbiguity] = useState<ParsedQuickTask | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [localTasks, setLocalTasks] = useState(tasks);

  const clientNameById = useMemo(() => new Map(clients.map((c) => [c.id, c.name])), [clients]);
  const groupTitleById = useMemo(() => new Map(taskGroups.map((g) => [g.id, g.title])), [taskGroups]);

  // `localTasks` só diverge de `tasks` durante um drag otimista — qualquer criação/toggle passa
  // por `router.refresh()` de qualquer forma, então re-sincroniza sozinho na próxima render com
  // `tasks` novo vindo do servidor. Só precisa ficar "à frente" nos milissegundos entre o drop e
  // a resposta da Server Action.
  const displayTasks = localTasks === tasks ? tasks : localTasks;

  function createSingle(parsed: ParsedQuickTask, clientIdOverride: string | null | undefined) {
    startTransition(async () => {
      const input = toTaskInput({ ...parsed, clientId: clientIdOverride !== undefined ? clientIdOverride : parsed.clientId }, userId);
      const created = await createTaskAction(input);
      if (!created.ok) {
        setError(created.error);
        return;
      }
      setText("");
      setAmbiguity(null);
      router.refresh();
    });
  }

  function createBatch(groups: { title: string | null; items: BatchParsedItem[] }[]) {
    startTransition(async () => {
      for (const group of groups) {
        if (group.items.length === 0) continue;
        const result = await createTaskBatchAction(
          group.title,
          group.items.map((item) => toTaskInput(item, userId)),
        );
        if (!result.ok) {
          setError(result.error);
          return;
        }
      }
      setText("");
      router.refresh();
    });
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setError(null);

    const batch = parseTaskBatch(text, teamMembers, clients);
    if (batch) {
      createBatch([{ title: null, items: batch.ungrouped }, ...batch.groups]);
      return;
    }

    const parsed = parseQuickTask(text, teamMembers, clients);
    if (!parsed.title) {
      setError("A tarefa ficou sem título depois de tirar data/hora/responsável — reescreva.");
      return;
    }
    if (parsed.clientCandidates.length > 1) {
      setAmbiguity(parsed);
      return;
    }
    createSingle(parsed, undefined);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCreate(e as unknown as React.FormEvent);
    }
  }

  function toggle(task: Task) {
    setError(null);
    startTransition(async () => {
      const result = await updateTaskStatusAction(task.id, task.status === "done" ? "pending" : "done");
      if (!result.ok) setError(result.error);
      router.refresh();
    });
  }

  function toggleSelect(taskId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  }

  function clearSelection() {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }

  /** Reordenação — otimista (a lista muda na hora) com rollback se a Server Action falhar
   *  (§9 — "não deixar a interface pulando" pra cima, mas também não fingir sucesso na falha). */
  function reorder(list: Task[], draggedId: string, targetId: string) {
    const draggedIndex = list.findIndex((t) => t.id === draggedId);
    const targetIndex = list.findIndex((t) => t.id === targetId);
    if (draggedIndex === -1 || targetIndex === -1) return;

    const next = [...list];
    const [dragged] = next.splice(draggedIndex, 1);
    const insertAt = next.findIndex((t) => t.id === targetId);
    next.splice(insertAt, 0, dragged);

    const before = next[insertAt - 1]?.position ?? null;
    const after = next[insertAt + 1]?.position ?? null;
    const newPosition = computePositionBetween(before, after);

    const optimistic = next.map((t) => (t.id === draggedId ? { ...t, position: newPosition } : t));
    const previous = localTasks;
    setLocalTasks(optimistic);

    startTransition(async () => {
      const result = await reorderTaskAction(draggedId, newPosition);
      if (!result.ok) {
        setError(result.error);
        setLocalTasks(previous);
        return;
      }
      router.refresh();
    });
  }

  function moveOneStep(list: Task[], task: Task, direction: "up" | "down") {
    const index = list.findIndex((t) => t.id === task.id);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    reorder(list, task.id, list[targetIndex].id);
  }

  const sortedTasks = [...displayTasks].sort((a, b) => a.position - b.position);
  const ungroupedTasks = sortedTasks.filter((t) => !t.group_id);
  const groupedByGroupId = new Map<string, Task[]>();
  for (const task of sortedTasks) {
    if (!task.group_id) continue;
    const arr = groupedByGroupId.get(task.group_id) ?? [];
    arr.push(task);
    groupedByGroupId.set(task.group_id, arr);
  }

  const pending = ungroupedTasks.filter((t) => t.status !== "done");
  // Pedido explícito — "Concluídas" mostra no máximo 3, o resto some da lista (a tarefa continua
  // existindo/contando em qualquer relatório, só não ocupa espaço aqui depois das 3 mais
  // recentes).
  const done = ungroupedTasks.filter((t) => t.status === "done").slice(0, 3);

  const hasAnyTask = sortedTasks.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <FocusTimerBar initialSession={initialRunningSession} />

      <form onSubmit={handleCreate} className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card/40 p-5">
        <div className="flex items-start gap-3">
          {/* Textarea (não Input) — aceita colar um bloco de várias linhas ("Operacional:\n
           *  Elenita: ...") sem perder a experiência de linha única de sempre: Enter continua
           *  criando na hora (Shift+Enter é que quebra linha), igual antes. */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nova tarefa... (ou cole várias linhas: 'Operacional:' + 'Elenita: roteiro, reunião...')"
            rows={text.includes("\n") ? Math.min(8, text.split("\n").length + 1) : 1}
            className="flex-1 resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
          <Button type="submit" disabled={isPending || !text.trim()} className="shrink-0 gap-2">
            <Plus className="size-4" />
            Adicionar
          </Button>
        </div>
        {!selectionMode && hasAnyTask && (
          <button type="button" onClick={() => setSelectionMode(true)} className="w-fit text-xs text-muted-foreground transition-colors hover:text-foreground">
            Selecionar várias
          </button>
        )}
      </form>
      {error && <p className="text-sm text-destructive">{error}</p>}

      {!hasAnyTask ? (
        <EmptyState icon={CalendarCheck} title="Nenhuma tarefa vencendo hoje ou atrasada" description="Adicione uma tarefa acima, ou aproveite o dia livre." fullBleed={false} />
      ) : (
        <div className="flex flex-col gap-6">
          {[...groupedByGroupId.entries()].map(([groupId, groupTasks]) => (
            <TaskGroupSection
              key={groupId}
              title={groupTitleById.get(groupId) ?? "Grupo"}
              tasks={groupTasks}
              clientNameById={clientNameById}
              selectedIds={selectedIds}
              selectionMode={selectionMode}
              onToggleDone={toggle}
              onToggleSelect={toggleSelect}
              onEdit={setEditingTask}
              onMove={(task, direction) => moveOneStep(groupTasks, task, direction)}
              onDrop={(draggedId, targetId) => reorder(groupTasks, draggedId, targetId)}
              onFocusStarted={() => router.refresh()}
              disabled={isPending}
            />
          ))}

          <TaskListSection
            title="Pendentes"
            tasks={pending}
            emptyLabel="Nenhuma tarefa pendente — dia livre."
            clientNameById={clientNameById}
            selectedIds={selectedIds}
            selectionMode={selectionMode}
            onToggleDone={toggle}
            onToggleSelect={toggleSelect}
            onEdit={setEditingTask}
            onMove={(task, direction) => moveOneStep(pending, task, direction)}
            onDrop={(draggedId, targetId) => reorder(pending, draggedId, targetId)}
            onFocusStarted={() => router.refresh()}
            disabled={isPending}
          />
          {done.length > 0 && (
            <TaskListSection
              title="Concluídas"
              tasks={done}
              emptyLabel={null}
              clientNameById={clientNameById}
              selectedIds={selectedIds}
              selectionMode={selectionMode}
              onToggleDone={toggle}
              onToggleSelect={toggleSelect}
              onEdit={setEditingTask}
              onMove={(task, direction) => moveOneStep(done, task, direction)}
              onDrop={(draggedId, targetId) => reorder(done, draggedId, targetId)}
              onFocusStarted={() => router.refresh()}
              disabled={isPending}
            />
          )}
        </div>
      )}

      {editingTask && (
        <TaskEditDialog key={editingTask.id} task={editingTask} teamMembers={teamMembers} clients={clients} open onOpenChange={(open) => !open && setEditingTask(null)} />
      )}

      {ambiguity && (
        <ClientAmbiguityDialog
          candidates={ambiguity.clientCandidates}
          taskTitle={ambiguity.title}
          open
          onOpenChange={(open) => !open && setAmbiguity(null)}
          onResolve={(clientId) => createSingle(ambiguity, clientId)}
        />
      )}

      <BulkActionBar selectedIds={[...selectedIds]} onClear={clearSelection} />
    </div>
  );
}

function TaskListSection({
  title,
  tasks,
  emptyLabel,
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
  emptyLabel: string | null;
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
  const [dragId, setDragId] = useState<string | null>(null);

  if (tasks.length === 0) {
    return emptyLabel ? <p className="text-sm text-muted-foreground">{emptyLabel}</p> : null;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <ListChecks className="size-3.5 text-muted-foreground" />
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</h2>
      </div>
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
    </div>
  );
}
