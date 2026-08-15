"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusDot, type StatusTone } from "@/components/dashboard/status-dot";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatDateOnly } from "@/lib/date";
import type { FinancialEntryStatus } from "@/lib/supabase/types/database";
import { cn } from "@/lib/utils";

export type FinancialEntryRow = {
  id: string;
  label: string;
  category: string | null;
  amount: number;
  dueDate: string;
  status: FinancialEntryStatus;
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const STATUS_TONE: Record<FinancialEntryStatus, StatusTone> = {
  pendente: "pending",
  pago: "active",
  atrasado: "danger",
  cancelado: "neutral",
};

const STATUS_LABEL: Record<FinancialEntryStatus, string> = {
  pendente: "Pendente",
  pago: "Pago",
  atrasado: "Atrasado",
  cancelado: "Cancelado",
};

const STATUS_OPTIONS: FinancialEntryStatus[] = ["pendente", "pago", "atrasado", "cancelado"];

export type FinancialEntryRowActions = {
  onEdit: (row: FinancialEntryRow) => void;
  onDelete: (id: string) => Promise<{ ok: boolean; error?: string }>;
};

/** `actions` é opcional — Receitas continuam só com o toggle de status (parcelas vêm de contrato,
 *  editar/excluir ali é editar o contrato, não a linha). Despesas são cadastro manual, então
 *  ganham editar/excluir (via `ExpensesTable`, que passa `actions`). */
export function FinancialEntriesTable({
  rows,
  onStatusChange,
  emptyLabel,
  actions,
}: {
  rows: FinancialEntryRow[];
  onStatusChange: (id: string, status: FinancialEntryStatus) => Promise<{ ok: boolean; error?: string }>;
  emptyLabel: string;
  actions?: FinancialEntryRowActions;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingRow, setDeletingRow] = useState<FinancialEntryRow | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  if (rows.length === 0) {
    return <div className="rounded-xl border border-border/60 bg-card/20 px-6 py-16 text-center text-muted-foreground">{emptyLabel}</div>;
  }

  function handleDelete() {
    if (!deletingRow || !actions) return;
    startDeleteTransition(async () => {
      await actions.onDelete(deletingRow.id);
      setDeletingRow(null);
      router.refresh();
    });
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/60">
      <Table>
        <TableHeader>
          <TableRow className="border-border/60 hover:bg-transparent">
            <TableHead>Descrição</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Status</TableHead>
            {actions && <TableHead />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} className="border-border/60">
              <TableCell className="font-medium">
                {row.label}
                {row.category && <span className="ml-2 text-xs text-muted-foreground">{row.category}</span>}
              </TableCell>
              <TableCell className={cn("text-muted-foreground", row.status === "atrasado" && "text-red-300")}>{formatDateOnly(row.dueDate)}</TableCell>
              <TableCell className="text-muted-foreground">{currencyFormatter.format(row.amount)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <StatusDot tone={STATUS_TONE[row.status]} label={STATUS_LABEL[row.status]} />
                  <select
                    aria-label={`Status de ${row.label}`}
                    value={row.status}
                    disabled={isPending}
                    onChange={(e) => {
                      const status = e.target.value as FinancialEntryStatus;
                      startTransition(async () => {
                        await onStatusChange(row.id, status);
                        router.refresh();
                      });
                    }}
                    className="h-7 rounded-md border border-input bg-transparent px-1.5 text-xs outline-none focus-visible:border-ring"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABEL[status]}
                      </option>
                    ))}
                  </select>
                </div>
              </TableCell>
              {actions && (
                <TableCell>
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => actions.onEdit(row)}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={`Editar ${row.label}`}
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingRow(row)}
                      className="text-muted-foreground transition-colors hover:text-danger"
                      aria-label={`Excluir ${row.label}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {actions && (
        <ConfirmDialog
          open={deletingRow !== null}
          onOpenChange={(open) => !open && setDeletingRow(null)}
          title="Excluir despesa?"
          description={deletingRow ? `"${deletingRow.label}" some pra sempre — não dá pra desfazer.` : undefined}
          isPending={isDeleting}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
