import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listRevenue } from "@/lib/financeiro/queries";
import { updateRevenueStatusAction } from "@/lib/financeiro/actions";
import { FinancialEntriesTable } from "@/components/financeiro/financial-entries-table";

export const metadata: Metadata = {
  title: "Receitas — Procreating",
  robots: { index: false, follow: false },
};

export default async function ReceitasPage() {
  const revenue = await listRevenue();
  const rows = revenue.map((row) => ({ id: row.id, label: row.description, category: null, amount: Number(row.amount), dueDate: row.due_date, status: row.status }));

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-8 px-6 py-16 lg:px-10">
      <Link href="/financeiro" className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-3.5" />
        Financeiro
      </Link>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl">Receitas</h1>
        <p className="max-w-lg text-sm text-muted-foreground">Todas as parcelas — geradas automaticamente a partir dos contratos no fechamento do onboarding.</p>
      </div>
      <FinancialEntriesTable rows={rows} onStatusChange={updateRevenueStatusAction} emptyLabel="Nenhum lançamento de receita ainda." />
    </main>
  );
}
