"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlanResultList } from "@/components/workspace-tasks/plan-result-list";
import { planForTasksAction, applyPlanAction } from "@/lib/tasks/plan-actions";
import type { PlannerResult } from "@/lib/tasks/planner";

/**
 * "Planejar bloco" (§11) — seleção múltipla → sugestão de horários pra hoje, mesmo motor de
 * "Planejar meu dia" (`suggestSchedule`), só que restrito às tarefas selecionadas em vez de
 * todas as de hoje do usuário logado.
 */
export function ScheduleBlockDialog({ taskIds, open, onOpenChange, onDone }: { taskIds: string[]; open: boolean; onOpenChange: (open: boolean) => void; onDone: () => void }) {
  const router = useRouter();
  const [plan, setPlan] = useState<PlannerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hadConflict, setHadConflict] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    setHadConflict(false);
    planForTasksAction(taskIds).then((result) => {
      setPlan(result);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function apply(force: boolean) {
    if (!plan || plan.scheduled.length === 0) return;
    startTransition(async () => {
      const result = await applyPlanAction(plan.scheduled, force);
      if (!result.ok) {
        setError(result.error);
        setHadConflict(result.error.includes("Conflito"));
        return;
      }
      onOpenChange(false);
      onDone();
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Planejar bloco</DialogTitle>
          <DialogDescription>
            {taskIds.length} tarefa{taskIds.length === 1 ? "" : "s"} selecionada{taskIds.length === 1 ? "" : "s"} — sugestão de horário pra hoje.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="text-sm text-muted-foreground">Calculando...</p>
        ) : plan ? (
          <PlanResultList plan={plan} />
        ) : (
          <p className="text-sm text-muted-foreground">Não foi possível calcular — tarefas sem responsável em comum?</p>
        )}

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          {hadConflict ? (
            <Button type="button" disabled={isPending} onClick={() => apply(true)}>
              {isPending ? "Aplicando..." : "Manter mesmo assim"}
            </Button>
          ) : (
            <Button type="button" disabled={isPending || !plan || plan.scheduled.length === 0} onClick={() => apply(false)}>
              {isPending ? "Aplicando..." : "Aplicar"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
