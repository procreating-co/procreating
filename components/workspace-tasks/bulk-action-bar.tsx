"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, CheckCheck, Clock, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScheduleBlockDialog } from "@/components/workspace-tasks/schedule-block-dialog";
import { BulkDurationDialog } from "@/components/workspace-tasks/bulk-duration-dialog";
import { bulkDeleteTasksAction, bulkUpdateTaskStatusAction } from "@/lib/tasks/actions";

/**
 * Barra de ações em lote (§10/§11) — Concluir/Excluir/Definir duração/Planejar bloco. "Pomodoro
 * em massa" (citado no pedido) ficou de fora de propósito, não por esquecimento: a arquitetura
 * de Focus Session (§17) só permite 1 sessão rodando por vez por pessoa (`startFocusSessionAction`
 * já impõe isso) — "iniciar N pomodoros ao mesmo tempo" não tem sentido nesse desenho; iniciar um
 * de cada vez já está coberto pelo botão por tarefa (`TaskRow`).
 */
export function BulkActionBar({ selectedIds, onClear }: { selectedIds: string[]; onClear: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [schedulingOpen, setSchedulingOpen] = useState(false);
  const [durationOpen, setDurationOpen] = useState(false);

  if (selectedIds.length === 0) return null;

  function complete() {
    startTransition(async () => {
      await bulkUpdateTaskStatusAction(selectedIds, "done");
      onClear();
      router.refresh();
    });
  }

  function remove() {
    startTransition(async () => {
      await bulkDeleteTasksAction(selectedIds);
      onClear();
      router.refresh();
    });
  }

  return (
    <>
      <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 shadow-lg">
        <span className="text-sm text-muted-foreground">
          {selectedIds.length} selecionada{selectedIds.length === 1 ? "" : "s"}
        </span>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={() => setDurationOpen(true)} className="gap-1.5">
            <Clock className="size-3.5" />
            Duração
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={() => setSchedulingOpen(true)} className="gap-1.5">
            <CalendarClock className="size-3.5" />
            Planejar bloco
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={complete} className="gap-1.5">
            <CheckCheck className="size-3.5" />
            Concluir
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={remove} className="gap-1.5 text-destructive hover:text-destructive">
            <Trash2 className="size-3.5" />
            Excluir
          </Button>
          <Button type="button" variant="ghost" size="icon-sm" onClick={onClear} aria-label="Cancelar seleção">
            <X className="size-3.5" />
          </Button>
        </div>
      </div>

      <ScheduleBlockDialog taskIds={selectedIds} open={schedulingOpen} onOpenChange={setSchedulingOpen} onDone={onClear} />
      <BulkDurationDialog taskIds={selectedIds} open={durationOpen} onOpenChange={setDurationOpen} onDone={onClear} />
    </>
  );
}
