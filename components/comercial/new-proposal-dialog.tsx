"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProposalFromTemplateAction, listProposalTemplatesAction } from "@/lib/comercial/proposal-actions";
import type { ProposalTemplate } from "@/lib/supabase/types/database";

/**
 * "Nova Proposta" — substitui conceitualmente "Novo orçamento" no drawer do lead (`quotes`
 * mantida à parte, convivendo — decisão explícita, ver `docs/proposal-system-architecture.md`).
 * Modal ENXUTO de propósito (§23/§26 do plano): só título + molde. Depois de criar, o resto
 * acontece na página completa (`/comercial/propostas/[id]`), nunca aqui dentro.
 */
export function NewProposalDialog({
  leadId,
  ownerName,
  open,
  onOpenChange,
}: {
  leadId: string;
  ownerName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [templates, setTemplates] = useState<ProposalTemplate[]>([]);
  const [templateId, setTemplateId] = useState("");
  const [title, setTitle] = useState(`Proposta — ${ownerName}`);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setTitle(`Proposta — ${ownerName}`);
    setError(null);
    listProposalTemplatesAction().then((list) => {
      setTemplates(list);
      if (list[0]) setTemplateId(list[0].id);
    });
  }, [open, ownerName]);

  function handleCreate() {
    if (!templateId) {
      setError("Escolha um molde.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await createProposalFromTemplateAction({ leadId, clientId: null, templateId, title, ownerName });
      if (!result.ok || !result.proposalId) {
        setError(result.ok ? "Não foi possível criar." : result.error);
        return;
      }
      onOpenChange(false);
      router.push(`/comercial/propostas/${result.proposalId}`);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Nova proposta</DialogTitle>
          <DialogDescription>Cria a partir de um molde — o resto (conteúdo, investimento, envio) é editado na página completa.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="proposal-title">Título</Label>
            <Input id="proposal-title" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="proposal-template">Molde</Label>
            <select
              id="proposal-template"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="h-9 rounded-md border border-input bg-input-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.title}
                </option>
              ))}
            </select>
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleCreate} disabled={isPending}>
            {isPending ? "Criando..." : "Criar proposta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
