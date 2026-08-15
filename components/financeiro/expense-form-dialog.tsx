"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createExpenseAction, updateExpenseAction } from "@/lib/financeiro/actions";
import { todayISO } from "@/lib/date";
import type { ExpenseInput } from "@/lib/financeiro/types";

const EMPTY_INPUT: ExpenseInput = { category: "", description: "", amount: 0, dueDate: todayISO() };

/** `expense` presente (id + campos) → edição, mesmo padrão de `CostFormDialog`/`ContactFormDialog`:
 *  um único dialog cobre criar e editar, parent monta com `key={expense.id}` pra resetar o estado. */
export function ExpenseFormDialog({
  open,
  onOpenChange,
  expense,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: ExpenseInput & { id: string };
}) {
  const router = useRouter();
  const [input, setInput] = useState<ExpenseInput>(expense ?? EMPTY_INPUT);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = expense ? await updateExpenseAction(expense.id, input) : await createExpenseAction(input);
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
            <DialogTitle>{expense ? "Editar despesa" : "Nova despesa"}</DialogTitle>
            <DialogDescription>Cadastro manual — sem integração bancária ainda.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="expense-category">Categoria</Label>
              <Input id="expense-category" value={input.category} onChange={(e) => setInput((p) => ({ ...p, category: e.target.value }))} placeholder="Ferramentas, equipe, aluguel..." required autoFocus />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="expense-description">Descrição</Label>
              <Input id="expense-description" value={input.description} onChange={(e) => setInput((p) => ({ ...p, description: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="expense-amount">Valor (R$)</Label>
                <Input
                  id="expense-amount"
                  type="number"
                  inputMode="decimal"
                  value={input.amount || ""}
                  onChange={(e) => setInput((p) => ({ ...p, amount: Number(e.target.value) || 0 }))}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="expense-due">Vencimento</Label>
                <Input id="expense-due" type="date" value={input.dueDate} onChange={(e) => setInput((p) => ({ ...p, dueDate: e.target.value }))} required />
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
              {isPending ? "Salvando..." : expense ? "Salvar" : "Criar despesa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
