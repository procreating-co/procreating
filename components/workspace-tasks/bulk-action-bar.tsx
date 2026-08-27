"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bulkDeleteTasksAction, bulkUpdateTaskStatusAction } from "@/lib/tasks/actions";

/** Barra de ações em lote (§10) — some quando nada está selecionado. Concluir/Excluir cobrem o
 *  essencial pedido; Agendar/Definir duração/Iniciar bloco/Pomodoro em lote ficam de fora desta
 *  rodada (ver relatório) — cada um exigiria decidir um valor único pra N tarefas diferentes de
 *  uma vez, o tipo de "inventar" que o pedido pede pra evitar sem uma tela própria pra isso. */
export function BulkActionBar({ selectedIds, onClear }: { selectedIds: string[]; onClear: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

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
    <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 shadow-lg">
      <span className="text-sm text-muted-foreground">{selectedIds.length} selecionada{selectedIds.length === 1 ? "" : "s"}</span>
      <div className="flex items-center gap-2">
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
  );
}
