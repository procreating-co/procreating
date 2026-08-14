"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createProductionProjectAction, type ProductionProjectInput } from "@/lib/operacao/actions";
import { PRODUCTION_PROJECT_STATUSES, PRODUCTION_PROJECT_STATUS_LABEL } from "@/lib/operacao/types";
import type { Client, User } from "@/lib/supabase/types/database";

const EMPTY_INPUT: ProductionProjectInput = { name: "", clientId: "", assignedTo: null, status: "planejamento", deadline: null };

/** Mesmo padrão de `components/comercial/lead-form-dialog.tsx` — formulário simples num Dialog,
 *  sem duplicar `Dialog`/`Input`/`Label` já existentes. */
export function ProjectFormDialog({ open, onOpenChange, clients, users }: { open: boolean; onOpenChange: (open: boolean) => void; clients: Client[]; users: User[] }) {
  const router = useRouter();
  const [input, setInput] = useState<ProductionProjectInput>(EMPTY_INPUT);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createProductionProjectAction(input);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setInput(EMPTY_INPUT);
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>Novo projeto</DialogTitle>
            <DialogDescription>Projeto de produção interna (vídeo, conteúdo, landing page...) pra um cliente já fechado.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="project-name">Nome</Label>
              <Input id="project-name" value={input.name} onChange={(e) => setInput((p) => ({ ...p, name: e.target.value }))} required autoFocus />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="project-client">Cliente</Label>
              <select
                id="project-client"
                value={input.clientId}
                onChange={(e) => setInput((p) => ({ ...p, clientId: e.target.value }))}
                required
                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <option value="">Selecione um cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="project-assignee">Responsável</Label>
                <select
                  id="project-assignee"
                  value={input.assignedTo ?? ""}
                  onChange={(e) => setInput((p) => ({ ...p, assignedTo: e.target.value || null }))}
                  className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <option value="">Sem responsável</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="project-status">Status</Label>
                <select
                  id="project-status"
                  value={input.status}
                  onChange={(e) => setInput((p) => ({ ...p, status: e.target.value as ProductionProjectInput["status"] }))}
                  className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  {PRODUCTION_PROJECT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {PRODUCTION_PROJECT_STATUS_LABEL[status]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="project-deadline">Prazo</Label>
              <Input id="project-deadline" type="date" value={input.deadline ?? ""} onChange={(e) => setInput((p) => ({ ...p, deadline: e.target.value || null }))} />
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
            <Button type="submit" disabled={isPending}>
              {isPending ? "Criando..." : "Criar projeto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
