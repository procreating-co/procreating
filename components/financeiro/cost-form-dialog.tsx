"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createCostAction } from "@/lib/financeiro/actions";
import type { CostInput } from "@/lib/financeiro/types";

const EMPTY_INPUT: CostInput = { name: "", amount: 0, category: "", recurrence: "fixo" };

export function CostFormDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [input, setInput] = useState<CostInput>(EMPTY_INPUT);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createCostAction(input);
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
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>Novo custo</DialogTitle>
            <DialogDescription>Estrutura de custo da empresa — não gera lançamento em Despesas automaticamente ainda.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="cost-name">Nome</Label>
              <Input id="cost-name" value={input.name} onChange={(e) => setInput((p) => ({ ...p, name: e.target.value }))} placeholder="Aluguel, ferramenta, pró-labore..." required autoFocus />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="cost-category">Categoria</Label>
              <Input id="cost-category" value={input.category} onChange={(e) => setInput((p) => ({ ...p, category: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="cost-amount">Valor (R$)</Label>
                <Input id="cost-amount" type="number" inputMode="decimal" value={input.amount || ""} onChange={(e) => setInput((p) => ({ ...p, amount: Number(e.target.value) || 0 }))} required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="cost-recurrence">Recorrência</Label>
                <select
                  id="cost-recurrence"
                  value={input.recurrence}
                  onChange={(e) => setInput((p) => ({ ...p, recurrence: e.target.value as CostInput["recurrence"] }))}
                  className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <option value="fixo">Fixo</option>
                  <option value="variavel">Variável</option>
                </select>
              </div>
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
              {isPending ? "Salvando..." : "Criar custo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
