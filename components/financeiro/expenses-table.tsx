"use client";

import { useState } from "react";
import { FinancialEntriesTable, type FinancialEntryRow } from "@/components/financeiro/financial-entries-table";
import { ExpenseFormDialog } from "@/components/financeiro/expense-form-dialog";
import { deleteExpenseAction, updateExpenseStatusAction } from "@/lib/financeiro/actions";

/** Fina camada sobre `FinancialEntriesTable` só pra despesas — dona do estado de "qual linha
 *  estou editando" e do dialog de edição (`ExpenseFormDialog` reaproveitado, mesmo componente da
 *  criação). Receitas continuam usando `FinancialEntriesTable` direto, sem `actions`. */
export function ExpensesTable({ rows, emptyLabel, canView = true }: { rows: FinancialEntryRow[]; emptyLabel: string; canView?: boolean }) {
  const [editingRow, setEditingRow] = useState<FinancialEntryRow | null>(null);

  return (
    <>
      <FinancialEntriesTable
        rows={rows}
        onStatusChange={updateExpenseStatusAction}
        emptyLabel={emptyLabel}
        actions={{ onEdit: setEditingRow, onDelete: deleteExpenseAction }}
        canView={canView}
      />
      {editingRow && (
        <ExpenseFormDialog
          key={editingRow.id}
          open
          onOpenChange={(open) => !open && setEditingRow(null)}
          expense={{ id: editingRow.id, category: editingRow.category ?? "", description: editingRow.label, amount: editingRow.amount, dueDate: editingRow.dueDate }}
        />
      )}
    </>
  );
}
