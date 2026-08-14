"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createLeadAction } from "@/lib/comercial/actions";
import type { LeadInput } from "@/lib/comercial/types";
import type { Strategy } from "@/lib/supabase/types/database";

const EMPTY_INPUT: LeadInput = {
  companyName: "",
  contactName: "",
  roleTitle: "",
  whatsapp: "",
  email: "",
  source: "",
  strategyId: null,
  potentialValue: null,
  notes: "",
};

/** `onCreated` — quando informado (menu de criação rápida, `quick-add-menu.tsx`), substitui o
 *  `router.refresh()` padrão: quem chamou decide o que fazer depois (ex.: navegar pro CRM, "ele
 *  ir automaticamente pra CRM" já é o comportamento natural de um lead novo, mas o usuário vendo
 *  a tela mudar pra lá reforça isso). Sem o prop (uso normal, dentro do próprio CRM), continua
 *  só atualizando os dados da página atual. */
export function LeadFormDialog({
  open,
  onOpenChange,
  strategies,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  strategies: Strategy[];
  onCreated?: () => void;
}) {
  const router = useRouter();
  const [input, setInput] = useState<LeadInput>(EMPTY_INPUT);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createLeadAction(input);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setInput(EMPTY_INPUT);
      onOpenChange(false);
      if (onCreated) onCreated();
      else router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>Novo lead</DialogTitle>
            <DialogDescription>Entra no estágio inicial do funil — mova pelo Pipeline conforme o contato avança.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="lead-company">Empresa</Label>
              <Input id="lead-company" value={input.companyName} onChange={(e) => setInput((p) => ({ ...p, companyName: e.target.value }))} required autoFocus />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="lead-new-contact">Contato</Label>
                <Input id="lead-new-contact" value={input.contactName} onChange={(e) => setInput((p) => ({ ...p, contactName: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="lead-new-role">Cargo</Label>
                <Input id="lead-new-role" value={input.roleTitle} onChange={(e) => setInput((p) => ({ ...p, roleTitle: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="lead-new-whatsapp">WhatsApp</Label>
                <Input id="lead-new-whatsapp" value={input.whatsapp} onChange={(e) => setInput((p) => ({ ...p, whatsapp: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="lead-new-email">E-mail</Label>
                <Input id="lead-new-email" type="email" value={input.email} onChange={(e) => setInput((p) => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="lead-new-source">Origem</Label>
                <Input id="lead-new-source" value={input.source} onChange={(e) => setInput((p) => ({ ...p, source: e.target.value }))} placeholder="Indicação, site..." />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="lead-new-value">Valor potencial (R$)</Label>
                <Input
                  id="lead-new-value"
                  type="number"
                  inputMode="decimal"
                  value={input.potentialValue ?? ""}
                  onChange={(e) => setInput((p) => ({ ...p, potentialValue: e.target.value.trim() === "" ? null : Number(e.target.value) }))}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="lead-new-strategy">Estratégia de origem</Label>
              <select
                id="lead-new-strategy"
                value={input.strategyId ?? ""}
                onChange={(e) => setInput((p) => ({ ...p, strategyId: e.target.value || null }))}
                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <option value="">Sem estratégia</option>
                {strategies.map((strategy) => (
                  <option key={strategy.id} value={strategy.id}>
                    {strategy.name}
                  </option>
                ))}
              </select>
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
              {isPending ? "Criando..." : "Criar lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
