"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { StrategyFormDialog } from "@/components/workspace-tasks/strategy-form-dialog";
import { ApplyStrategyDialog } from "@/components/workspace-tasks/apply-strategy-dialog";
import { deleteTaskStrategyAction } from "@/lib/tasks/strategy-actions";
import type { TaskStrategy, User } from "@/lib/supabase/types/database";
import type { QuickParseClient } from "@/lib/tasks/quick-parse";

/** Estratégias (§13) — moldes de tarefas reaproveitáveis. Painel simples: listar, criar,
 *  aplicar (vira um Task Group novo), excluir. */
export function StrategiesPanel({ strategies, teamMembers, clients }: { strategies: TaskStrategy[]; teamMembers: User[]; clients: QuickParseClient[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [applying, setApplying] = useState<TaskStrategy | null>(null);
  const [deleting, setDeleting] = useState<TaskStrategy | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!deleting) return;
    startTransition(async () => {
      await deleteTaskStrategyAction(deleting.id);
      setDeleting(null);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Estratégias</h2>
        <Button type="button" variant="outline" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={() => setCreating(true)}>
          <Plus className="size-3" />
          Nova
        </Button>
      </div>

      {strategies.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma estratégia criada ainda.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border/60 rounded-xl border border-border/60 bg-card/40">
          {strategies.map((strategy) => (
            <li key={strategy.id} className="group flex items-center justify-between gap-2 px-4 py-3">
              <div className="flex flex-col">
                <span className="text-sm font-medium">{strategy.title}</span>
                {strategy.description && <span className="text-xs text-muted-foreground">{strategy.description}</span>}
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={() => setApplying(strategy)}>
                  <Sparkles className="size-3" />
                  Aplicar
                </Button>
                <button
                  type="button"
                  onClick={() => setDeleting(strategy)}
                  aria-label={`Excluir ${strategy.title}`}
                  className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <StrategyFormDialog open={creating} onOpenChange={setCreating} />
      {applying && <ApplyStrategyDialog strategy={applying} teamMembers={teamMembers} clients={clients} open onOpenChange={(open) => !open && setApplying(null)} />}
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Excluir estratégia?"
        description={deleting ? `"${deleting.title}" some pra sempre — tarefas já criadas a partir dela continuam existindo.` : undefined}
        isPending={isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
