"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DetailList } from "@/components/dashboard/detail-list";
import { ExpenseFormDialog } from "@/components/financeiro/expense-form-dialog";
import { CostFormDialog } from "@/components/financeiro/cost-form-dialog";
import type { FinancialDetailEntry } from "@/lib/financeiro/types";

/**
 * Detalhe de "Despesas" ganha um jeito rápido de lançar uma despesa nova sem sair da Visão Geral
 * (pedido explícito: "deve dentro ter um + pra eu adicionar despesas, podendo ser pontuais ou
 * recorrentes"). Reaproveita os dois dialogs que já existem — nenhuma lógica de escrita nova:
 * pontual = `ExpenseFormDialog` (`Expense`, lançamento com vencimento certo, aba A Pagar);
 * recorrente = `CostFormDialog` (`Cost`, estrutura fixa/variável, aba Custos). Radix suporta
 * dialog dentro de dialog nativamente — o modal de detalhe (`CardWithDetail`) fica aberto atrás.
 */
export function ExpensesQuickAdd({ entries, emptyLabel }: { entries: FinancialDetailEntry[]; emptyLabel: string }) {
  const [addingExpense, setAddingExpense] = useState(false);
  const [addingCost, setAddingCost] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={() => setAddingExpense(true)}>
          <Plus className="size-3" />
          Pontual
        </Button>
        <Button type="button" variant="outline" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={() => setAddingCost(true)}>
          <Plus className="size-3" />
          Recorrente
        </Button>
      </div>
      <DetailList items={entries} emptyLabel={emptyLabel} />
      <ExpenseFormDialog open={addingExpense} onOpenChange={setAddingExpense} />
      <CostFormDialog open={addingCost} onOpenChange={setAddingCost} />
    </div>
  );
}
