"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { bulkSetEstimatedMinutesAction } from "@/lib/tasks/actions";

/** "Definir duração" em lote (§10/§11) — UM valor aplicado às N selecionadas, escolhido pela
 *  pessoa aqui, nunca inventado por tarefa. */
export function BulkDurationDialog({ taskIds, open, onOpenChange, onDone }: { taskIds: string[]; open: boolean; onOpenChange: (open: boolean) => void; onDone: () => void }) {
  const router = useRouter();
  const [minutes, setMinutes] = useState("30");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(minutes);
    if (!value || value <= 0) {
      setError("Informe um número de minutos maior que zero.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await bulkSetEstimatedMinutesAction(taskIds, value);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onOpenChange(false);
      onDone();
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle>Definir duração</DialogTitle>
          <DialogDescription>
            Aplica a {taskIds.length} tarefa{taskIds.length === 1 ? "" : "s"} selecionada{taskIds.length === 1 ? "" : "s"}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="bulk-duration">Minutos</Label>
            <Input id="bulk-duration" type="number" min={1} value={minutes} onChange={(e) => setMinutes(e.target.value)} autoFocus />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Aplicando..." : "Aplicar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
