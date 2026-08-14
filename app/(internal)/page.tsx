import { AlertTriangle, Banknote, Handshake, TrendingUp, Users, UsersRound, Wallet } from "lucide-react";
import { computeExecutiveDashboard } from "@/lib/dashboard/executive-metrics";
import { DashboardDateHeader } from "@/components/dashboard/dashboard-date-header";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ChartCard } from "@/components/dashboard/chart-card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { RevenueVsTargetChart } from "@/components/dashboard/revenue-vs-target-chart";
import { RevenueChart } from "@/components/financeiro/revenue-chart";
import { SalesPipelineChart } from "@/components/dashboard/sales-pipeline-chart";
import { EmptyInline } from "@/components/dashboard/empty-inline";
import { StatusBadge } from "@/components/dashboard/status-badge";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const compactCurrencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact", maximumFractionDigits: 1 });
const percentFormatter = (value: number) => `${value.toFixed(1)}%`;

/**
 * Dashboard executivo — reescrito por completo (redesign shadcn/SalesOps/Linear/Stripe,
 * monocromático). Responde "como a empresa está", não é mais uma coleção de cards com dado
 * mock — tudo aqui vem de `computeExecutiveDashboard()` (`lib/dashboard/executive-metrics.ts`),
 * e o que não tem dado real suficiente mostra isso explicitamente ("Not enough data"/"Not
 * tracked yet"), nunca um "0" inventado. Ver o plano aprovado (redesign completo) pra cada
 * decisão de definição financeira e o que ficou de fora de propósito (projetos internos/
 * capacidade de equipe — não existe tabela nenhuma disso ainda).
 */
export default async function Home() {
  const metrics = await computeExecutiveDashboard();

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-10 px-6 py-16 lg:px-10">
      <DashboardDateHeader goal={metrics.goal} />

      {/* KPI row */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          icon={<TrendingUp className="size-3.5" />}
          label="Revenue"
          value={compactCurrencyFormatter.format(metrics.kpis.revenue.value)}
          sparkline={metrics.kpis.revenue.sparkline}
          delta={metrics.kpis.revenue.deltaPct != null ? { value: percentFormatter(Math.abs(metrics.kpis.revenue.deltaPct)), direction: metrics.kpis.revenue.deltaPct >= 0 ? "up" : "down" } : undefined}
        />
        <MetricCard
          icon={<Wallet className="size-3.5" />}
          label="Net Profit"
          value={compactCurrencyFormatter.format(metrics.kpis.netProfit.value)}
          sparkline={metrics.kpis.netProfit.sparkline}
        />
        <MetricCard
          icon={<Banknote className="size-3.5" />}
          label="Cash Flow"
          value={compactCurrencyFormatter.format(metrics.kpis.cashFlow.value)}
          sparkline={metrics.kpis.cashFlow.sparkline}
        />
        <MetricCard icon={<Handshake className="size-3.5" />} label="Pipeline" value={compactCurrencyFormatter.format(metrics.kpis.pipeline.value)} />
        <MetricCard icon={<Users className="size-3.5" />} label="Active Clients" value={String(metrics.kpis.activeClients.value)} />
        <MetricCard icon={<UsersRound className="size-3.5" />} label="Team" value={String(metrics.kpis.team.value)} />
      </section>

      {/* Revenue vs. Target */}
      <ChartCard
        title="Revenue vs. Target"
        description={
          metrics.revenueVsTarget.goalAmount != null
            ? `${currencyFormatter.format(metrics.kpis.revenue.value)} / ${currencyFormatter.format(metrics.revenueVsTarget.goalAmount)} — ${percentFormatter((metrics.kpis.revenue.value / metrics.revenueVsTarget.goalAmount) * 100)} of monthly target`
            : undefined
        }
      >
        {metrics.revenueVsTarget.goalAmount != null ? (
          <RevenueVsTargetChart points={metrics.revenueVsTarget.points} />
        ) : (
          <EmptyInline icon={TrendingUp} label="Meta não definida — configure em Settings → General para ver este gráfico." />
        )}
      </ChartCard>

      {/* Financial Health */}
      <section className="flex flex-col gap-4">
        <SectionHeader title="Financial Health" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <FinancialBlock label="Revenue" value={currencyFormatter.format(metrics.financialHealth.revenue)} />
          <FinancialBlock label="Expenses" value={currencyFormatter.format(metrics.financialHealth.expenses)} />
          <FinancialBlock label="Net Profit" value={currencyFormatter.format(metrics.financialHealth.netProfit)} />
          <FinancialBlock label="Cash Flow" value={`${metrics.financialHealth.cashFlow >= 0 ? "+" : ""}${currencyFormatter.format(metrics.financialHealth.cashFlow)}`} />
        </div>
        <ChartCard title="Cash Flow — Last 6 Months">
          <RevenueChart data={metrics.financialHealth.monthlyEvolution} />
        </ChartCard>
      </section>

      {/* Sales Pipeline */}
      <section className="flex flex-col gap-4">
        <SectionHeader title="Sales Pipeline" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-border/60 bg-card p-5 lg:col-span-2">
            {metrics.salesPipeline.stages.some((stage) => stage.count > 0) ? (
              <SalesPipelineChart stages={metrics.salesPipeline.stages} />
            ) : (
              <EmptyInline icon={Handshake} label="No active opportunities — create a deal to start building your pipeline." />
            )}
          </div>
          <div className="flex flex-col gap-4">
            <FinancialBlock label="Conversion (Lead → Client)" value={metrics.salesPipeline.conversionRate != null ? percentFormatter(metrics.salesPipeline.conversionRate * 100) : "No data available"} />
            <FinancialBlock label="Average Deal" value={metrics.salesPipeline.averageDeal != null ? currencyFormatter.format(metrics.salesPipeline.averageDeal) : "No data available"} />
            <FinancialBlock label="Weighted Pipeline" value={metrics.salesPipeline.weightedPipeline != null ? currencyFormatter.format(metrics.salesPipeline.weightedPipeline) : "Not enough data"} />
          </div>
        </div>
      </section>

      {/* Customer Health */}
      <section className="flex flex-col gap-4">
        <SectionHeader title="Customer Health" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <FinancialBlock label="Active Clients" value={String(metrics.customerHealth.activeClients)} />
          <FinancialBlock label="Revenue Concentration (Top 5)" value={metrics.customerHealth.concentrationTop5Pct != null ? percentFormatter(metrics.customerHealth.concentrationTop5Pct) : "No data available"} />
          <FinancialBlock label="Churn (current)" value={metrics.customerHealth.churnPct != null ? percentFormatter(metrics.customerHealth.churnPct) : "No data available"} />
          <FinancialBlock label="Average Client Value" value={metrics.customerHealth.averageClientValue != null ? currencyFormatter.format(metrics.customerHealth.averageClientValue) : "No data available"} />
        </div>
      </section>

      {/* Operations + Team */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section className="flex flex-col gap-4">
          <SectionHeader title="Operations" />
          <div className="grid grid-cols-2 gap-4">
            <FinancialBlock label="Team" value={String(metrics.operations.headcount)} />
            <FinancialBlock label="Capacity" value="Not tracked yet" muted />
            <FinancialBlock label="On-time" value="Not tracked yet" muted />
            <FinancialBlock label="Projects at risk" value="Not tracked yet" muted />
          </div>
        </section>
        <section className="flex flex-col gap-4">
          <SectionHeader title="Team" />
          <div className="grid grid-cols-2 gap-4">
            <FinancialBlock label="Headcount" value={String(metrics.team.headcount)} />
            <FinancialBlock label="Utilization" value="Not tracked yet" muted />
            <FinancialBlock label="Overloaded" value="Not tracked yet" muted />
            <FinancialBlock label="Available" value="Not tracked yet" muted />
          </div>
        </section>
      </div>

      {/* Attention Required */}
      <section className="flex flex-col gap-4">
        <SectionHeader title="Attention Required" />
        {metrics.attention.length === 0 ? (
          <EmptyInline icon={AlertTriangle} label="Nada precisa de atenção agora." />
        ) : (
          <ul className="flex flex-col divide-y divide-border/60 rounded-xl border border-border/60 bg-card">
            {metrics.attention.map((item) => (
              <li key={item.label} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-xs text-muted-foreground">{item.detail}</span>
                </div>
                <StatusBadge tone={item.tone} label={item.tone === "success" ? "OK" : item.tone === "danger" ? "Critical" : "Warning"} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Business Pulse */}
      {metrics.pulse.length > 0 && (
        <section className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-5">
          <SectionHeader title="Business Pulse" description="Gerado a partir dos números reais acima — preparado para virar análise por IA no futuro." />
          <ul className="flex flex-col gap-2">
            {metrics.pulse.map((sentence) => (
              <li key={sentence} className="text-sm text-foreground">
                {sentence}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

function FinancialBlock({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border/60 bg-card p-4">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={muted ? "text-sm text-muted-foreground" : "text-xl font-semibold tabular-nums"}>{value}</span>
    </div>
  );
}
