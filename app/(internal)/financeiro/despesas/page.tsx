import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listExpenses } from "@/lib/financeiro/queries";
import { updateExpenseStatusAction } from "@/lib/financeiro/actions";
import { FinancialEntriesTable } from "@/components/financeiro/financial-entries-table";
import { DespesasToolbar } from "@/components/financeiro/despesas-toolbar";

export const metadata: Metadata = {
  title: "Despesas — Procreating",
  robots: { index: false, follow: false },
};

export default async function DespesasPage() {
  const expenses = await listExpenses();
  const rows = expenses.map((row) => ({ id: row.id, label: row.description, category: row.category, amount: Number(row.amount), dueDate: row.due_date, status: row.status }));

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-8 px-6 pt-8 pb-16 lg:px-10">
      <Link href="/financeiro" className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-3.5" />
        Financeiro
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-3xl">Despesas</h1>
          <p className="max-w-lg text-sm text-muted-foreground">Cadastro manual, por categoria — sem integração bancária ainda.</p>
        </div>
        <DespesasToolbar />
      </div>
      <FinancialEntriesTable rows={rows} onStatusChange={updateExpenseStatusAction} emptyLabel="Nenhuma despesa cadastrada ainda." />
    </main>
  );
}
