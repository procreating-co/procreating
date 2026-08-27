"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { applyTaskStrategyAction } from "@/lib/tasks/strategy-actions";
import { todayISO } from "@/lib/date";
import type { QuickParseClient } from "@/lib/tasks/quick-parse";
import type { TaskStrategy, User } from "@/lib/supabase/types/database";

/** Aplicar molde (§13) — vira um `task_group` + tarefas reais. Cliente/responsável/data são
 *  ÚNICOS, escolhidos aqui pela pessoa — nunca um valor diferente por item inventado. */
export function ApplyStrategyDialog({
  strategy,
  teamMembers,
  clients,
  open,
  onOpenChange,
}: {
  strategy: TaskStrategy;
  teamMembers: User[];
  clients: QuickParseClient[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [clientId, setClientId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState(todayISO());
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function apply() {
    setError(null);
    startTransition(async () => {
      const result = await applyTaskStrategyAction(strategy.id, clientId || null, assigneeId || null, dueDate || null);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Aplicar &ldquo;{strategy.title}&rdquo;</DialogTitle>
          <DialogDescription>Cria um grupo de tarefas novo a partir deste molde.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="apply-client">Cliente (opcional)</Label>
            <select
              id="apply-client"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="h-9 rounded-md border border-input bg-input-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="">—</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="apply-assignee">Responsável padrão (opcional)</Label>
            <select
              id="apply-assignee"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="h-9 rounded-md border border-input bg-input-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="">—</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="apply-due">Prazo (opcional, mesma data pra todas)</Label>
            <input
              id="apply-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="h-9 rounded-md border border-input bg-input-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>
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
          <Button type="button" disabled={isPending} onClick={apply}>
            {isPending ? "Aplicando..." : "Aplicar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
