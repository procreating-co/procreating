import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listExpenses } from "@/lib/financeiro/queries";
import { updateExpenseStatusAction } from "@/lib/financeiro/actions";
import { FinancialEntriesTable } from "@/components/financeiro/financial-entries-table";

export const metadata: Metadata = {
  title: "Contas a pagar — Procreating",
  robots: { index: false, follow: false },
};

export default async function ContasAPagarPage() {
  const expenses = await listExpenses();
  const rows = expenses
    .filter((row) => row.status === "pendente" || row.status === "atrasado")
    .map((row) => ({ id: row.id, label: row.description, category: row.category, amount: Number(row.amount), dueDate: row.due_date, status: row.status }));

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-8 px-6 pt-8 pb-16 lg:px-10">
      <Link href="/financeiro" className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-3.5" />
        Financeiro
      </Link>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl">Contas a pagar</h1>
        <p className="max-w-lg text-sm text-muted-foreground">Despesas pendentes ou atrasadas.</p>
      </div>
      <FinancialEntriesTable rows={rows} onStatusChange={updateExpenseStatusAction} emptyLabel="Nada pendente ou atrasado — tudo em dia." />
    </main>
  );
}
