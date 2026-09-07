"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, MotionConfig } from "framer-motion";
import { CalendarCheck, ListChecks, Search, X } from "lucide-react";
import { Plus } from "lucide-react";
import { PriorityFilterBar, type PriorityFilterValue } from "@/components/workspace-tasks/priority-filter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/dashboard/empty-state";
import { TaskEditDialog } from "@/components/workspace-tasks/task-edit-dialog";
import { TaskRow } from "@/components/workspace-tasks/task-row";
import { TaskGroupSection } from "@/components/workspace-tasks/task-group-section";
import { BulkActionBar } from "@/components/workspace-tasks/bulk-action-bar";
import { ClientAmbiguityDialog } from "@/components/workspace-tasks/client-ambiguity-dialog";
import { StartFocusDialog } from "@/components/workspace-tasks/start-focus-dialog";
import { PlanDayButton } from "@/components/workspace-tasks/plan-day-dialog";
import { StrategiesPanel } from "@/components/workspace-tasks/strategies-panel";
import { StrategyFormDialog } from "@/components/workspace-tasks/strategy-form-dialog";
import { ApplyStrategyDialog } from "@/components/workspace-tasks/apply-strategy-dialog";
import { createTaskAction, createTaskBatchAction, deleteTaskAction, reorderTaskAction, updateTaskStatusAction } from "@/lib/tasks/actions";
import { createTimeBlockAction } from "@/lib/tasks/time-block-actions";
import { parseQuickTask, type ParsedQuickTask, type QuickParseClient } from "@/lib/tasks/quick-parse";
import { parseTaskBatch, type BatchParsedItem } from "@/lib/tasks/batch-parse";
import { parseSlashCommand } from "@/lib/tasks/slash-commands";
import { computePositionBetween } from "@/lib/tasks/position";
import { brasiliaDateTimeToISO } from "@/lib/date";
import type { Task, TaskStrategy, User } from "@/lib/supabase/types/database";
import type { TaskInput } from "@/lib/tasks/types";

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

/** Estado do diálogo de estratégia — aplicar uma existente (achada por nome via `/strategy`) ou
 *  criar uma nova (nome digitado não encontrado — pré-preenche o título, não perde o que a
 *  pessoa já escreveu). */
type StrategyDialogState = { mode: "apply"; strategy: TaskStrategy } | { mode: "create"; initialTitle: string } | null;

/**
 * Task Intelligence — evolução de `WorkspaceTasks` (Master prompt §49/§50 original). Continua o
 * MESMO componente/lista/Server Actions de sempre, estendido: entrada aceita texto em várias
 * linhas (`parseTaskBatch`) além da linha única de sempre (`parseQuickTask`), grupos (§14),
 * seleção múltipla + ações em lote (§10), drag & drop com posição persistente (§8/§9), Timer/
 * Pomodoro por tarefa (§15/§16), comandos rápidos `/task /time /pomodoro /plan /strategy` (§20),
 * Time Blocks/"Planejar meu dia" (§11/§12/§21) e Estratégias (§13).
 */
export function WorkspaceTasks({
  tasks,
  userId,
  teamMembers,
  clients,
  taskGroups,
  strategies,
  todayDate,
}: {
  tasks: Task[];
  userId: string;
  teamMembers: User[];
  clients: QuickParseClient[];
  taskGroups: { id: string; title: string }[];
  strategies: TaskStrategy[];
  todayDate: string;
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
  const [pomodoroPrompt, setPomodoroPrompt] = useState<{ taskId: string; taskTitle: string } | null>(null);
  const [planDayOpen, setPlanDayOpen] = useState(false);
  const [strategyDialog, setStrategyDialog] = useState<StrategyDialogState>(null);
  // Fade ao concluir (pedido explícito) — some da lista assim que marcada, sem esperar o
  // round-trip do servidor. `AnimatePresence` só anima a saída se o item realmente sair do array
  // renderizado; isto é o que faz ele sair na hora, antes da resposta chegar. `deletingIds`
  // mesmo mecanismo pra exclusão (pedido explícito — "1 clique, o mais rápido possível", sem
  // diálogo de confirmação).
  const [completingIds, setCompletingIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilterValue>("all");
  // Busca + responsável (pedido explícito, redesign "clareza operacional") — client-side, a
  // lista já está toda carregada, sem round-trip, mesmo raciocínio do filtro de prioridade.
  const [searchQuery, setSearchQuery] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");

  const clientNameById = useMemo(() => new Map(clients.map((c) => [c.id, c.name])), [clients]);
  const groupTitleById = useMemo(() => new Map(taskGroups.map((g) => [g.id, g.title])), [taskGroups]);
  // Só carrega o mapa quando há mais de 1 pessoa — em conta de 1 pessoa só, mostrar "Santiago" em
  // toda tarefa seria ruído redundante (mesma regra de "só aparece quando faz diferença" do
  // filtro de prioridade, `hasAnyPriority` abaixo).
  const assigneeNameById = useMemo(
    () => (teamMembers.length > 1 ? new Map(teamMembers.map((u) => [u.id, u.name.split(" ")[0]])) : new Map<string, string>()),
    [teamMembers],
  );
  // União dos dois estados otimistas (concluir + excluir) — um único filtro pra "isto não deve
  // mais aparecer", usado em toda lista/grupo abaixo.
  const hiddenIds = useMemo(() => new Set([...completingIds, ...deletingIds]), [completingIds, deletingIds]);

  // Dado novo do servidor já reflete a realidade (a tarefa marcada feita agora TEM status "done"
  // de verdade, ou já não existe mais) — os estados otimistas ficam órfãos nesse momento, sem
  // função; limpa pra não crescer pra sempre numa sessão longa.
  useEffect(() => {
    setCompletingIds(new Set());
    setDeletingIds(new Set());
  }, [tasks]);

  // `localTasks` só diverge de `tasks` durante um drag otimista — qualquer criação/toggle passa
  // por `router.refresh()` de qualquer forma, então re-sincroniza sozinho na próxima render com
  // `tasks` novo vindo do servidor. Só precisa ficar "à frente" nos milissegundos entre o drop e
  // a resposta da Server Action.
  const displayTasks = localTasks === tasks ? tasks : localTasks;

  function createSingle(parsed: ParsedQuickTask, clientIdOverride: string | null | undefined, afterCreate?: (taskId: string) => void) {
    startTransition(async () => {
      const input = toTaskInput({ ...parsed, clientId: clientIdOverride !== undefined ? clientIdOverride : parsed.clientId }, userId);
      const created = await createTaskAction(input);
      if (!created.ok) {
        setError(created.error);
        return;
      }
      setText("");
      setAmbiguity(null);
      afterCreate?.(created.taskId);
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

  /** "/time <texto> <hora> <duração>" (§20) — cria a tarefa e, se a frase tiver data+hora+
   *  duração, já agenda o Time Block correspondente no mesmo passo. Sem hora/duração, cria só a
   *  tarefa (degrada bem, não é erro). */
  function createWithTimeBlock(parsed: ParsedQuickTask) {
    startTransition(async () => {
      const input = toTaskInput(parsed, userId);
      const created = await createTaskAction(input);
      if (!created.ok) {
        setError(created.error);
        return;
      }
      if (parsed.dueDate && parsed.dueTime && parsed.estimatedMinutes) {
        const startAtISO = brasiliaDateTimeToISO(parsed.dueDate, parsed.dueTime);
        const endMinutes = parsed.estimatedMinutes;
        const endDate = new Date(startAtISO);
        endDate.setMinutes(endDate.getMinutes() + endMinutes);
        // Recalcula com o mesmo helper (nunca `Date` cru pra escrever) — soma minutos primeiro
        // fora do fuso não importa aqui (é aritmética de instante, sempre correta), só a
        // CONSTRUÇÃO do instante inicial precisava do offset explícito.
        await createTimeBlockAction(created.taskId, startAtISO, endDate.toISOString(), false);
      }
      setText("");
      router.refresh();
    });
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setError(null);

    const command = parseSlashCommand(text);
    if (command) {
      handleCommand(command.type, command.rest);
      return;
    }

    createFromFreeText(text);
  }

  function createFromFreeText(raw: string) {
    const batch = parseTaskBatch(raw, teamMembers, clients);
    if (batch) {
      createBatch([{ title: null, items: batch.ungrouped }, ...batch.groups]);
      return;
    }

    const parsed = parseQuickTask(raw, teamMembers, clients);
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

  function handleCommand(type: "task" | "time" | "pomodoro" | "plan" | "strategy", rest: string) {
    switch (type) {
      case "task":
        if (!rest.trim()) {
          setError("Escreva o que precisa ser feito depois de /task.");
          return;
        }
        createFromFreeText(rest);
        return;

      case "time": {
        const parsed = parseQuickTask(rest, teamMembers, clients);
        if (!parsed.title) {
          setError("Escreva o que precisa ser feito depois de /time.");
          return;
        }
        createWithTimeBlock(parsed);
        return;
      }

      case "pomodoro": {
        const parsed = parseQuickTask(rest, teamMembers, clients);
        if (!parsed.title) {
          setError("Escreva o que precisa ser feito depois de /pomodoro.");
          return;
        }
        if (parsed.clientCandidates.length > 1) {
          setAmbiguity(parsed);
          return;
        }
        createSingle(parsed, undefined, (taskId) => setPomodoroPrompt({ taskId, taskTitle: parsed.title }));
        return;
      }

      case "plan":
        setText("");
        setPlanDayOpen(true);
        return;

      case "strategy": {
        setText("");
        const name = rest.trim().toLowerCase();
        const existing = strategies.find((s) => s.title.trim().toLowerCase() === name);
        if (existing) {
          setStrategyDialog({ mode: "apply", strategy: existing });
        } else {
          setStrategyDialog({ mode: "create", initialTitle: rest.trim() });
        }
        return;
      }
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCreate(e as unknown as React.FormEvent);
    }
  }

  function toggle(task: Task) {
    setError(null);
    const nextStatus = task.status === "done" ? "pending" : "done";
    // Pedido explícito — "ao clicar que foi feita, ela deve sumir com fade": tira da vista ANTES
    // da resposta do servidor. Só a direção "marcar como feita" precisa disto (a lista de
    // Pendentes que perde o item); desmarcar já reaparece sozinho quando o refresh trouxer o
    // status real, sem precisar de estado otimista pra essa direção.
    if (nextStatus === "done") setCompletingIds((prev) => new Set(prev).add(task.id));
    startTransition(async () => {
      const result = await updateTaskStatusAction(task.id, nextStatus);
      if (!result.ok) {
        setError(result.error);
        setCompletingIds((prev) => {
          const next = new Set(prev);
          next.delete(task.id);
          return next;
        });
        return;
      }
      router.refresh();
    });
  }

  /** Excluir — 1 clique, sem confirmação (pedido explícito: "o mais rápido possível"). Some da
   *  vista na hora (mesmo mecanismo otimista do `toggle` acima); se a exclusão falhar de verdade
   *  (raro), volta a aparecer com o erro visível, nunca finge sucesso. */
  function removeTask(task: Task) {
    setError(null);
    setDeletingIds((prev) => new Set(prev).add(task.id));
    startTransition(async () => {
      const result = await deleteTaskAction(task.id);
      if (!result.ok) {
        setError(result.error);
        setDeletingIds((prev) => {
          const next = new Set(prev);
          next.delete(task.id);
          return next;
        });
        return;
      }
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

  const matchesPriority = (t: Task) => priorityFilter === "all" || t.priority === priorityFilter;
  const matchesAssignee = (t: Task) => assigneeFilter === "all" || t.assignee_id === assigneeFilter;
  const matchesSearch = (t: Task) => !searchQuery.trim() || t.title.toLowerCase().includes(searchQuery.trim().toLowerCase());
  const matchesFilters = (t: Task) => matchesPriority(t) && matchesAssignee(t) && matchesSearch(t);

  const filteredPending = ungroupedTasks.filter((t) => t.status !== "done" && !hiddenIds.has(t.id) && matchesFilters(t));
  // Pedido explícito — "Concluídas" mostra no máximo 3, o resto some da lista (a tarefa continua
  // existindo/contando em qualquer relatório, só não ocupa espaço aqui depois das 3 mais
  // recentes).
  const done = ungroupedTasks.filter((t) => t.status === "done" && !hiddenIds.has(t.id) && matchesFilters(t)).slice(0, 3);

  // Agora / Próximas / Mais tarde (pedido explícito, redesign "clareza operacional") — regra
  // determinística sobre campos que já existem, nunca um relógio ao vivo (evitaria mismatch de
  // hidratação SSR/cliente): atrasada (venceu antes de hoje) ou prioridade alta = Agora;
  // prioridade baixa = Mais tarde; o resto (média, sem prioridade, vencendo hoje) = Próximas.
  function taskBucket(task: Task): "agora" | "proximas" | "maisTarde" {
    const overdue = task.due_date !== null && task.due_date < todayDate;
    if (overdue || task.priority === "high") return "agora";
    if (task.priority === "low") return "maisTarde";
    return "proximas";
  }
  const agora = filteredPending.filter((t) => taskBucket(t) === "agora");
  const proximas = filteredPending.filter((t) => taskBucket(t) === "proximas");
  const maisTarde = filteredPending.filter((t) => taskBucket(t) === "maisTarde");

  const hasAnyTask = sortedTasks.length > 0;
  const hasAnyPriority = sortedTasks.some((t) => t.priority != null);
  const hasActiveFilters = priorityFilter !== "all" || assigneeFilter !== "all" || searchQuery.trim().length > 0;
  const hasFilteredResults = filteredPending.length > 0 || done.length > 0;

  function clearFilters() {
    setPriorityFilter("all");
    setAssigneeFilter("all");
    setSearchQuery("");
  }

  return (
    // Reduced motion (pedido explícito de acessibilidade) — mesmo mecanismo já usado na proposta
    // pública (`proposal-public-view.tsx`): respeita `prefers-reduced-motion` do sistema pra
    // todas as animações Framer Motion desta árvore (fade ao concluir, entrada/saída dos cards).
    <MotionConfig reducedMotion="user">
      <div className="flex flex-col gap-6">
        <form onSubmit={handleCreate} className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card/40 p-5">
          <div className="flex items-start gap-3">
            {/* Textarea (não Input) — aceita colar um bloco de várias linhas ("Operacional:\n
             *  Elenita: ...") sem perder a experiência de linha única de sempre: Enter continua
             *  criando na hora (Shift+Enter é que quebra linha), igual antes. Comandos `/task
             *  /time /pomodoro /plan /strategy` (§20) funcionam na mesma caixa, sem UI própria. */}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Adicione uma tarefa, use / para comandos ou cole várias linhas"
              rows={text.includes("\n") ? Math.min(8, text.split("\n").length + 1) : 1}
              className="flex-1 resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
            <Button type="submit" disabled={isPending || !text.trim()} className="shrink-0 gap-2">
              <Plus className="size-4" />
              Adicionar
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!selectionMode && hasAnyTask ? (
                <button type="button" onClick={() => setSelectionMode(true)} className="text-xs text-muted-foreground transition-colors hover:text-foreground">
                  Selecionar várias
                </button>
              ) : (
                <span />
              )}
              {/* Atalhos discretos (pedido explícito) — só lembrete de texto, os comandos já
               *  funcionam sem isto; fica de fora quando a caixa está vazia por padrão? Não —
               *  sempre visível, é o "discreto" que pede, não escondido. */}
              <span className="hidden text-xs text-muted-foreground/70 sm:inline">/plan · /pomodoro · /time · /strategy</span>
            </div>
            <PlanDayButton open={planDayOpen} onOpenChange={setPlanDayOpen} />
          </div>
        </form>
        {error && <p className="text-sm text-destructive">{error}</p>}

        {/* Busca + filtros (pedido explícito) — client-side, mesmo raciocínio do filtro de
         *  prioridade que já existia. Responsável só aparece com >1 pessoa na conta
         *  (`assigneeNameById` fica vazio nesse caso, ver acima). */}
        {hasAnyTask && (
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[180px] flex-1">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar tarefa..."
                  aria-label="Buscar tarefa por título"
                  className="h-8 pl-8 text-sm"
                />
              </div>
              {assigneeNameById.size > 0 && (
                <select
                  value={assigneeFilter}
                  onChange={(e) => setAssigneeFilter(e.target.value)}
                  aria-label="Filtrar por responsável"
                  className="h-8 rounded-md border border-input bg-input-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <option value="all">Todos os responsáveis</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              )}
              {hasActiveFilters && (
                <button type="button" onClick={clearFilters} className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground">
                  <X className="size-3" />
                  Limpar filtros
                </button>
              )}
            </div>
            {/* Filtro por cor (pedido explícito) — só aparece quando existe alguma tarefa com
             *  prioridade definida (via "Editar"); minimalismo, sem controle vazio pra uma
             *  dimensão que ninguém usou ainda. */}
            {hasAnyPriority && <PriorityFilterBar value={priorityFilter} onChange={setPriorityFilter} />}
          </div>
        )}

        {!hasAnyTask ? (
          <EmptyState icon={CalendarCheck} title="Nenhuma tarefa vencendo hoje ou atrasada" description="Adicione uma tarefa acima, ou aproveite o dia livre." fullBleed={false} />
        ) : !hasFilteredResults && hasActiveFilters ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/60 py-10 text-center">
            <p className="text-sm text-muted-foreground">Nenhuma tarefa encontrada com esses filtros.</p>
            <button type="button" onClick={clearFilters} className="text-sm text-foreground underline-offset-2 hover:underline">
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {[...groupedByGroupId.entries()].map(([groupId, groupTasks]) => (
              <TaskGroupSection
                key={groupId}
                title={groupTitleById.get(groupId) ?? "Grupo"}
                tasks={groupTasks}
                clientNameById={clientNameById}
                assigneeNameById={assigneeNameById}
                hiddenIds={hiddenIds}
                selectedIds={selectedIds}
                selectionMode={selectionMode}
                onToggleDone={toggle}
                onToggleSelect={toggleSelect}
                onEdit={setEditingTask}
                onDelete={removeTask}
                onMove={(task, direction) => moveOneStep(groupTasks, task, direction)}
                onDrop={(draggedId, targetId) => reorder(groupTasks, draggedId, targetId)}
                onFocusStarted={() => router.refresh()}
                disabled={isPending}
              />
            ))}

            {/* "Agora / Próximas / Mais tarde / Concluídas" (pedido explícito) — no lugar da
             *  lista única "Pendentes" de antes; regra de cada balde documentada em
             *  `taskBucket` acima. */}
            <TaskListSection
              title="Agora"
              tasks={agora}
              emptyLabel={null}
              clientNameById={clientNameById}
              assigneeNameById={assigneeNameById}
              selectedIds={selectedIds}
              selectionMode={selectionMode}
              onToggleDone={toggle}
              onToggleSelect={toggleSelect}
              onEdit={setEditingTask}
              onDelete={removeTask}
              onMove={(task, direction) => moveOneStep(agora, task, direction)}
              onDrop={(draggedId, targetId) => reorder(agora, draggedId, targetId)}
              onFocusStarted={() => router.refresh()}
              disabled={isPending}
            />
            <TaskListSection
              title="Próximas"
              tasks={proximas}
              emptyLabel={null}
              clientNameById={clientNameById}
              assigneeNameById={assigneeNameById}
              selectedIds={selectedIds}
              selectionMode={selectionMode}
              onToggleDone={toggle}
              onToggleSelect={toggleSelect}
              onEdit={setEditingTask}
              onDelete={removeTask}
              onMove={(task, direction) => moveOneStep(proximas, task, direction)}
              onDrop={(draggedId, targetId) => reorder(proximas, draggedId, targetId)}
              onFocusStarted={() => router.refresh()}
              disabled={isPending}
            />
            <TaskListSection
              title="Mais tarde"
              tasks={maisTarde}
              emptyLabel={null}
              clientNameById={clientNameById}
              assigneeNameById={assigneeNameById}
              selectedIds={selectedIds}
              selectionMode={selectionMode}
              onToggleDone={toggle}
              onToggleSelect={toggleSelect}
              onEdit={setEditingTask}
              onDelete={removeTask}
              onMove={(task, direction) => moveOneStep(maisTarde, task, direction)}
              onDrop={(draggedId, targetId) => reorder(maisTarde, draggedId, targetId)}
              onFocusStarted={() => router.refresh()}
              disabled={isPending}
            />
            {agora.length === 0 && proximas.length === 0 && maisTarde.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma tarefa pendente — dia livre.</p>
            )}
            {done.length > 0 && (
              <TaskListSection
                title="Concluídas"
                tasks={done}
                emptyLabel={null}
                clientNameById={clientNameById}
                assigneeNameById={assigneeNameById}
                selectedIds={selectedIds}
                selectionMode={selectionMode}
                onToggleDone={toggle}
                onToggleSelect={toggleSelect}
                onEdit={setEditingTask}
                onDelete={removeTask}
                onMove={(task, direction) => moveOneStep(done, task, direction)}
                onDrop={(draggedId, targetId) => reorder(done, draggedId, targetId)}
                onFocusStarted={() => router.refresh()}
                disabled={isPending}
              />
            )}
          </div>
        )}

        <StrategiesPanel strategies={strategies} teamMembers={teamMembers} clients={clients} />

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

        {pomodoroPrompt && (
          <StartFocusDialog
            taskId={pomodoroPrompt.taskId}
            taskTitle={pomodoroPrompt.taskTitle}
            mode="pomodoro"
            open
            onOpenChange={(open) => !open && setPomodoroPrompt(null)}
            onStarted={() => {
              setPomodoroPrompt(null);
              router.refresh();
            }}
          />
        )}

        {strategyDialog?.mode === "apply" && (
          <ApplyStrategyDialog
            strategy={strategyDialog.strategy}
            teamMembers={teamMembers}
            clients={clients}
            open
            onOpenChange={(open) => !open && setStrategyDialog(null)}
          />
        )}
        {strategyDialog?.mode === "create" && (
          <StrategyFormDialog open initialTitle={strategyDialog.initialTitle} onOpenChange={(open) => !open && setStrategyDialog(null)} />
        )}

        <BulkActionBar selectedIds={[...selectedIds]} onClear={clearSelection} />
      </div>
    </MotionConfig>
  );
}

function TaskListSection({
  title,
  tasks,
  emptyLabel,
  clientNameById,
  assigneeNameById,
  selectedIds,
  selectionMode,
  onToggleDone,
  onToggleSelect,
  onEdit,
  onDelete,
  onMove,
  onDrop,
  onFocusStarted,
  disabled,
}: {
  title: string;
  tasks: Task[];
  emptyLabel: string | null;
  clientNameById: Map<string, string>;
  assigneeNameById: Map<string, string>;
  selectedIds: Set<string>;
  selectionMode: boolean;
  onToggleDone: (task: Task) => void;
  onToggleSelect: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
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
        <span className="text-xs text-muted-foreground/70">{tasks.length}</span>
      </div>
      <ul className="flex flex-col divide-y divide-border/60 rounded-xl border border-border/60 bg-card/40">
        <AnimatePresence initial={false}>
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              clientName={task.client_id ? (clientNameById.get(task.client_id) ?? null) : null}
              assigneeName={task.assignee_id ? (assigneeNameById.get(task.assignee_id) ?? null) : null}
              selected={selectedIds.has(task.id)}
              selectionMode={selectionMode}
              onToggleDone={() => onToggleDone(task)}
              onToggleSelect={() => onToggleSelect(task.id)}
              onEdit={() => onEdit(task)}
              onDelete={() => onDelete(task)}
              onMove={(direction) => onMove(task, direction)}
              onFocusStarted={onFocusStarted}
              disabled={disabled}
              draggable
              dragging={dragId === task.id}
              onDragStart={() => setDragId(task.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (dragId && dragId !== task.id) onDrop(dragId, task.id);
                setDragId(null);
              }}
            />
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
