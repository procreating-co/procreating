"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { QuickParseClient } from "@/lib/tasks/quick-parse";

/**
 * Confirmação minimalista (§3/§4/§5 — "não escolher aleatoriamente... mostrar confirmação") —
 * só aparece quando o parser encontrou 2+ clientes reais batendo com a mesma palavra do texto.
 * Escolher aqui não é adivinhação: é a pessoa confirmando qual dos dois é o certo.
 */
export function ClientAmbiguityDialog({
  candidates,
  taskTitle,
  open,
  onOpenChange,
  onResolve,
}: {
  candidates: QuickParseClient[];
  taskTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolve: (clientId: string | null) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Qual cliente?</DialogTitle>
          <DialogDescription>&ldquo;{taskTitle}&rdquo; — mais de um cliente bate com o que você escreveu.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          {candidates.map((client) => (
            <Button key={client.id} type="button" variant="outline" className="justify-start" onClick={() => onResolve(client.id)}>
              {client.name}
            </Button>
          ))}
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onResolve(null)}>
            Nenhum — criar sem cliente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
