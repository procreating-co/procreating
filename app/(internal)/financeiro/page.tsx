import type { Metadata } from "next";
import { AlertTriangle, ArrowDownCircle, ArrowUpCircle, Clock, TrendingUp, Wallet } from "lucide-react";
import { computeFinanceiroMetrics } from "@/lib/financeiro/queries";
import { StatTile } from "@/components/dashboard/stat-tile";
import { RevenueChart } from "@/components/financeiro/revenue-chart";
import { SectionHeader } from "@/components/dashboard/section-header";
import { PageHeader } from "@/components/dashboard/page-header";
import { PeriodSelect } from "@/components/dashboard/period-select";

export const metadata: Metadata = {
  title: "Financeiro — Procreating",
  robots: { index: false, follow: false },
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default async function FinanceiroPage({ searchParams }: { searchParams: Promise<{ months?: string }> }) {
  const { months: monthsParam } = await searchParams;
  const months = Number(monthsParam) || 6;
  const metrics = await computeFinanceiroMetrics(months);

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-8 px-6 pt-8 pb-16 lg:px-10">
      <PageHeader title="Financeiro" description="Receita recorrente, despesas e fluxo de caixa — sem cobrança automática nem integração bancária ainda." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatTile demo={false} label="MRR (recorrente ativo)" value={currencyFormatter.format(metrics.mrr)} icon={<TrendingUp className="size-4.5" />} />
        <StatTile demo={false} label="Receita este mês" value={currencyFormatter.format(metrics.revenueThisMonth)} icon={<ArrowUpCircle className="size-4.5" />} />
        <StatTile demo={false} label="Despesas este mês" value={currencyFormatter.format(metrics.expensesThisMonth)} icon={<ArrowDownCircle className="size-4.5" />} />
        <StatTile demo={false} label="A receber (pendente)" value={currencyFormatter.format(metrics.receivablesPending)} icon={<Clock className="size-4.5" />} />
        <StatTile demo={false} label="A receber (atrasado)" value={currencyFormatter.format(metrics.receivablesOverdue)} icon={<AlertTriangle className="size-4.5" />} />
        <StatTile demo={false} label="A pagar (pendente + atrasado)" value={currencyFormatter.format(metrics.payablesPending + metrics.payablesOverdue)} icon={<Wallet className="size-4.5" />} />
      </div>

      <section className="flex flex-col gap-4">
        <SectionHeader title={`Evolução (últimos ${months} meses)`} action={<PeriodSelect />} />
        <div className="rounded-xl border border-border/60 bg-card/40 p-5">
          <RevenueChart data={metrics.monthlyEvolution} />
        </div>
      </section>
    </main>
  );
}
