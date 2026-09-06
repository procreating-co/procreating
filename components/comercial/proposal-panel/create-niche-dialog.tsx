"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createProposalTemplateAction } from "@/lib/comercial/proposal-actions";
import type { ProposalTemplate, ProposalType } from "@/lib/supabase/types/database";

/**
 * "Criar Nicho" (pedido explícito — "pra eu criar pages para arquitetos, advogados, etc.") — um
 * Nicho é só um molde (`proposal_template`) a mais do tipo Projeto, clonado do molde base
 * (`cloneFromTemplateId`, mesma estrutura hero+closing de partida). `onCreated` devolve o
 * template novo pra quem chama já selecionar ele na hora, sem esperar o refresh do servidor.
 */
export function CreateNicheDialog({
  open,
  onOpenChange,
  type,
  cloneFromTemplateId,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: ProposalType;
  cloneFromTemplateId: string;
  onCreated: (template: ProposalTemplate) => void;
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate() {
    if (!name.trim()) {
      setError("Dê um nome ao nicho (ex.: Arquitetos, Advogados).");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await createProposalTemplateAction({ title: name.trim(), type, cloneFromTemplateId });
      if (!result.ok || !result.template) {
        setError(result.ok ? "Não foi possível criar." : result.error);
        return;
      }
      setName("");
      onOpenChange(false);
      onCreated(result.template);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Criar nicho</DialogTitle>
          <DialogDescription>Um molde novo de Projeto, pronto pra usar em qualquer página desse nicho — a mesma estrutura de partida, editada depois por proposta.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="niche-name">Nome do nicho</Label>
          <Input id="niche-name" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleCreate()} placeholder="Ex.: Arquitetos" autoFocus />
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
          <Button type="button" onClick={handleCreate} disabled={isPending}>
            {isPending ? "Criando..." : "Criar nicho"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
