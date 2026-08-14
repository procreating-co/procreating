import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyInline } from "@/components/dashboard/empty-inline";
import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  align?: "left" | "right";
  className?: string;
};

/** Wrapper leve sobre `ui/table.tsx` (não traz TanStack Table nem dependência nova) — colunas
 *  tipadas + empty state embutido via `EmptyInline`, mesmo padrão manual já usado em
 *  `financeiro`/`comercial`, só sem repetir o `<Table>`/`<TableHeader>`/... por página. */
export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  emptyIcon,
  emptyLabel,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  emptyIcon: LucideIcon;
  emptyLabel: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-border/60 bg-card">
        <EmptyInline icon={emptyIcon} label={emptyLabel} />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/60">
      <Table>
        <TableHeader>
          <TableRow className="border-border/60 hover:bg-transparent">
            {columns.map((column) => (
              <TableHead key={column.key} className={cn(column.align === "right" && "text-right", column.className)}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={getRowKey(row)} className="border-border/60">
              {columns.map((column) => (
                <TableCell key={column.key} className={cn(column.align === "right" && "text-right tabular-nums", column.className)}>
                  {column.render(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
