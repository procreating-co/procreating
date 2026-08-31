"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PlanResultList } from "@/components/workspace-tasks/plan-result-list";
import { planMyDayAction, applyPlanAction } from "@/lib/tasks/plan-actions";
import type { PlannerResult } from "@/lib/tasks/planner";

/**
 * "Planejar meu dia" (§21) — analisa tarefas de hoje/atrasadas + blocos já existentes, sugere um
 * encaixe (`TaskPlanner`, determinístico) e SÓ aplica com confirmação explícita ("Aplicar
 * plano") — nunca cria os blocos sozinho.
 *
 * `open`/`onOpenChange` são opcionais — o botão controla o próprio estado sozinho quando
 * ninguém de fora passa nada (uso normal), mas `/plan` (§20, comando rápido) precisa abrir isto
 * de fora sem duplicar o diálogo inteiro — por isso aceita controle externo também.
 */
export function PlanDayButton({ open: controlledOpen, onOpenChange: setControlledOpen }: { open?: boolean; onOpenChange?: (open: boolean) => void }) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = setControlledOpen ?? setInternalOpen;

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
    planMyDayAction().then((result) => {
      setPlan(result);
      setLoading(false);
    });
  }, [open]);

  function apply(force: boolean) {
    if (!plan || plan.scheduled.length === 0) return;
    startTransition(async () => {
      const result = await applyPlanAction(plan.scheduled, force);
      if (!result.ok) {
        setError(result.error);
        // A sugestão já evita os blocos existentes por construção (§12) — um conflito aqui só
        // acontece se algo mudou entre calcular e aplicar (outro bloco criado nesse meio-tempo).
        // Mesmo aviso do §19: "Manter mesmo assim" / "Escolher outro horário" — não impede sozinho.
        setHadConflict(result.error.includes("Conflito"));
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      {controlledOpen === undefined && (
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-1.5">
          <CalendarClock className="size-3.5" />
          Planejar meu dia
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Plano sugerido</DialogTitle>
            <DialogDescription>Tarefas de hoje e atrasadas, encaixadas nos horários livres.</DialogDescription>
          </DialogHeader>

          {loading ? (
            <p className="text-sm text-muted-foreground">Calculando...</p>
          ) : plan ? (
            <PlanResultList plan={plan} />
          ) : (
            <p className="text-sm text-muted-foreground">Não foi possível calcular o plano.</p>
          )}

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Fechar
            </Button>
            {hadConflict ? (
              <Button type="button" disabled={isPending} onClick={() => apply(true)}>
                {isPending ? "Aplicando..." : "Manter mesmo assim"}
              </Button>
            ) : (
              <Button type="button" disabled={isPending || !plan || plan.scheduled.length === 0} onClick={() => apply(false)}>
                {isPending ? "Aplicando..." : "Aplicar plano"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
