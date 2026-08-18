"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Calculator } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DetailList } from "@/components/dashboard/detail-list";
import { EmptyInline } from "@/components/dashboard/empty-inline";
import { setCurrentMonthGoalAction } from "@/lib/dashboard/actions";
import type { DetailEntry, GoalProgress } from "@/lib/dashboard/executive-metrics";
import { cn } from "@/lib/utils";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

/** Calculadora "e se" — meta hipotética digitada aqui (default = meta oficial atual) recalcula
 *  %/restante/ritmo diário na hora, sem salvar nada; "Aplicar" grava de verdade via a mesma
 *  action que Configurações → Geral usa (`setCurrentMonthGoalAction`, agora com
 *  `requireFinancialAccess()` — dev_tester nunca chega a ver este bloco, ver `canView` no
 *  componente pai, mas a action em si também está protegida, não só a UI). */
function GoalCalculator({ goal }: { goal: GoalProgress }) {
  const router = useRouter();
  const [target, setTarget] = useState(String(goal.amount));
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetValue = Number(target);
  const valid = Number.isFinite(targetValue) && targetValue > 0;
  const percentage = valid ? (goal.realized / targetValue) * 100 : 0;
  const remaining = valid ? Math.max(0, targetValue - goal.realized) : 0;
  const dailyPaceNeeded = valid && goal.daysRemaining > 0 ? remaining / goal.daysRemaining : null;

  function handleApply() {
    if (!valid) return;
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await setCurrentMonthGoalAction(targetValue);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <Label htmlFor="goal-calc-target">Meta hipotética (R$)</Label>
        <Input
          id="goal-calc-target"
          type="number"
          inputMode="decimal"
          min="0"
          step="1"
          value={target}
          onChange={(e) => {
            setTarget(e.target.value);
            setSaved(false);
          }}
        />
      </div>
      <dl className="grid grid-cols-3 gap-2 rounded-lg border border-border/60 p-3 text-center">
        <div>
          <dt className="text-[11px] text-muted-foreground">% atingido</dt>
          <dd className="font-mono text-sm tabular-nums">{valid ? `${percentage.toFixed(1)}%` : "—"}</dd>
        </div>
        <div>
          <dt className="text-[11px] text-muted-foreground">Restante</dt>
          <dd className="font-mono text-sm tabular-nums">{valid ? currencyFormatter.format(remaining) : "—"}</dd>
        </div>
        <div>
          <dt className="text-[11px] text-muted-foreground">Ritmo/dia necessário</dt>
          <dd className="font-mono text-sm tabular-nums">{dailyPaceNeeded != null ? currencyFormatter.format(dailyPaceNeeded) : "—"}</dd>
        </div>
      </dl>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" variant="outline" onClick={handleApply} disabled={!valid || isPending}>
          {isPending ? "Salvando..." : "Aplicar como meta oficial do mês"}
        </Button>
        {saved && <span className="text-xs text-success">Meta atualizada.</span>}
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>
    </div>
  );
}

/**
 * Modal de meta mensal — pedido explícito: a linha de progresso da meta (`DashboardDateHeader`)
 * vira clicável, abrindo entradas do mês + a meta em si + uma calculadora de meta/KPIs, no mesmo
 * espírito de `CardWithDetail` (usado nos cards do Dashboard), só que com 2 seções extras em vez
 * de uma lista só. `revenueEntries` é a MESMA lista que alimenta o card "Receita" (nunca uma
 * segunda conta em paralelo, mesmo raciocínio do resto do Dashboard) — já vem mascarada por quem
 * chama quando `canView` é falso.
 */
export function GoalDetailDialog({
  goal,
  canView,
  revenueEntries,
  monthLabel,
  children,
  className,
}: {
  goal: GoalProgress;
  canView: boolean;
  revenueEntries: DetailEntry[];
  monthLabel: string;
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "w-full cursor-pointer rounded-lg text-left outline-none transition-opacity duration-150 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className,
        )}
      >
        {children}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Meta mensal — {monthLabel}</DialogTitle>
            <DialogDescription>
              {canView
                ? `${currencyFormatter.format(goal.realized)} de ${currencyFormatter.format(goal.amount)} (${goal.percentage.toFixed(1)}%).`
                : "Valores ocultos para seu papel."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-5">
            <section className="flex flex-col gap-2">
              <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Entradas do mês</h3>
              <DetailList items={revenueEntries} emptyLabel="Nenhuma receita com vencimento este mês ainda." />
            </section>

            <section className="flex flex-col gap-2">
              <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Calculadora de meta e ritmo</h3>
              {canView ? <GoalCalculator goal={goal} /> : <EmptyInline icon={Calculator} label="Calculadora oculta — requer acesso financeiro." />}
            </section>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
