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
import { PeriodSelect } from "@/components/dashboard/period-select";
import { CardWithDetail } from "@/components/dashboard/card-with-detail";
import { ChartExpandDialog } from "@/components/dashboard/chart-expand-dialog";
import { DetailList } from "@/components/dashboard/detail-list";
import { DataTable } from "@/components/dashboard/data-table";
import type { DetailEntry } from "@/lib/dashboard/executive-metrics";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const compactCurrencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact", maximumFractionDigits: 1 });
const percentFormatter = (value: number) => `${value.toFixed(1)}%`;

/**
 * Dashboard executivo — reescrito por completo (redesign shadcn/SalesOps/Linear/Stripe,
 * monocromático). Responde "como a empresa está", não é mais uma coleção de cards com dado
 * mock — tudo aqui vem de `computeExecutiveDashboard()` (`lib/dashboard/executive-metrics.ts`),
 * e o que não tem dado real suficiente mostra isso explicitamente ("Not enough data"/"Not
 * tracked yet"), nunca um "0" inventado.
 *
 * Todo card é clicável (`CardWithDetail`) — abre um modal com a lista real por trás do número
 * (pedido explícito). Todo gráfico é clicável (`ChartExpandDialog`) — abre ampliado, com uma
 * tabela de apoio quando fizer sentido.
 */
export default async function Home({ searchParams }: { searchParams: Promise<{ months?: string }> }) {
  const { months: monthsParam } = await searchParams;
  const cashFlowMonths = Number(monthsParam) || 6;
  const metrics = await computeExecutiveDashboard(cashFlowMonths);
  const d = metrics.details;

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-10 px-6 py-16 lg:px-10">
      <DashboardDateHeader goal={metrics.goal} />

      {/* KPI row */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <CardWithDetail title="Revenue" description="Receita realizada este mês (paga)." detail={<DetailList items={d.revenueEntries} emptyLabel="Nenhuma receita paga este mês ainda." />}>
          <MetricCard
            icon={<TrendingUp className="size-3.5" />}
            label="Revenue"
            value={compactCurrencyFormatter.format(metrics.kpis.revenue.value)}
            sparkline={metrics.kpis.revenue.sparkline}
            delta={metrics.kpis.revenue.deltaPct != null ? { value: percentFormatter(Math.abs(metrics.kpis.revenue.deltaPct)), direction: metrics.kpis.revenue.deltaPct >= 0 ? "up" : "down" } : undefined}
          />
        </CardWithDetail>
        <CardWithDetail
          title="Net Profit"
          description="Receita − despesas − custos, este mês."
          detail={
            <DetailList
              items={[
                { label: "Revenue", value: currencyFormatter.format(metrics.financialHealth.revenue) },
                { label: "Expenses", value: `− ${currencyFormatter.format(metrics.financialHealth.expenses)}` },
                { label: "Net Profit", value: currencyFormatter.format(metrics.financialHealth.netProfit) },
              ]}
              emptyLabel="Sem dado suficiente."
            />
          }
        >
          <MetricCard icon={<Wallet className="size-3.5" />} label="Net Profit" value={compactCurrencyFormatter.format(metrics.kpis.netProfit.value)} sparkline={metrics.kpis.netProfit.sparkline} />
        </CardWithDetail>
        <CardWithDetail
          title="Cash Flow"
          description="Entradas − saídas realizadas este mês."
          detail={
            <DetailList
              items={[
                { label: "Entradas", value: currencyFormatter.format(metrics.financialHealth.revenue) },
                { label: "Saídas", value: `− ${currencyFormatter.format(metrics.financialHealth.expenses)}` },
                { label: "Cash Flow", value: `${metrics.financialHealth.cashFlow >= 0 ? "+" : ""}${currencyFormatter.format(metrics.financialHealth.cashFlow)}` },
              ]}
              emptyLabel="Sem dado suficiente."
            />
          }
        >
          <MetricCard icon={<Banknote className="size-3.5" />} label="Cash Flow" value={compactCurrencyFormatter.format(metrics.kpis.cashFlow.value)} sparkline={metrics.kpis.cashFlow.sparkline} />
        </CardWithDetail>
        <CardWithDetail title="Pipeline" description="Leads abertos, por valor potencial." detail={<DetailList items={d.openLeads} emptyLabel="Nenhum lead aberto." />}>
          <MetricCard icon={<Handshake className="size-3.5" />} label="Pipeline" value={compactCurrencyFormatter.format(metrics.kpis.pipeline.value)} />
        </CardWithDetail>
        <CardWithDetail title="Active Clients" description="Clientes com status ativo." detail={<DetailList items={d.activeClients} emptyLabel="Nenhum cliente ativo ainda." />}>
          <MetricCard icon={<Users className="size-3.5" />} label="Active Clients" value={String(metrics.kpis.activeClients.value)} />
        </CardWithDetail>
        <CardWithDetail title="Team" description="Quem tem acesso ao Procreating OS." detail={<DetailList items={d.teamMembers} emptyLabel="Nenhum usuário cadastrado." />}>
          <MetricCard icon={<UsersRound className="size-3.5" />} label="Team" value={String(metrics.kpis.team.value)} />
        </CardWithDetail>
      </section>

      {/* Revenue vs. Target */}
      <ChartExpandDialog
        title="Revenue vs. Target"
        description="Realizado (área) vs. ritmo esperado (linha pontilhada) — dia a dia do mês corrente."
        expanded={
          metrics.revenueVsTarget.goalAmount != null ? (
            <RevenueVsTargetChart points={metrics.revenueVsTarget.points} height={420} />
          ) : (
            <EmptyInline icon={TrendingUp} label="Meta não definida — configure em Settings → General." />
          )
        }
      >
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
      </ChartExpandDialog>

      {/* Financial Health */}
      <section className="flex flex-col gap-4">
        <SectionHeader title="Financial Health" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <CardWithDetail title="Revenue" description="Receita realizada este mês (paga)." detail={<DetailList items={d.revenueEntries} emptyLabel="Nenhuma receita paga este mês ainda." />}>
            <FinancialBlock label="Revenue" value={currencyFormatter.format(metrics.financialHealth.revenue)} />
          </CardWithDetail>
          <CardWithDetail title="Expenses" description="Despesas pagas este mês." detail={<DetailList items={d.expenseEntries} emptyLabel="Nenhuma despesa paga este mês ainda." />}>
            <FinancialBlock label="Expenses" value={currencyFormatter.format(metrics.financialHealth.expenses)} />
          </CardWithDetail>
          <CardWithDetail
            title="Net Profit"
            description="Receita − despesas − custos, este mês."
            detail={
              <DetailList
                items={[
                  { label: "Revenue", value: currencyFormatter.format(metrics.financialHealth.revenue) },
                  { label: "Expenses", value: `− ${currencyFormatter.format(metrics.financialHealth.expenses)}` },
                  { label: "Net Profit", value: currencyFormatter.format(metrics.financialHealth.netProfit) },
                ]}
                emptyLabel="Sem dado suficiente."
              />
            }
          >
            <FinancialBlock label="Net Profit" value={currencyFormatter.format(metrics.financialHealth.netProfit)} />
          </CardWithDetail>
          <CardWithDetail
            title="Cash Flow"
            description="Entradas − saídas realizadas este mês."
            detail={
              <DetailList
                items={[
                  { label: "Entradas", value: currencyFormatter.format(metrics.financialHealth.revenue) },
                  { label: "Saídas", value: `− ${currencyFormatter.format(metrics.financialHealth.expenses)}` },
                ]}
                emptyLabel="Sem dado suficiente."
              />
            }
          >
            <FinancialBlock label="Cash Flow" value={`${metrics.financialHealth.cashFlow >= 0 ? "+" : ""}${currencyFormatter.format(metrics.financialHealth.cashFlow)}`} />
          </CardWithDetail>
        </div>
        <ChartExpandDialog
          title={`Cash Flow — Last ${cashFlowMonths} Months`}
          expanded={
            <div className="flex flex-col gap-5">
              <RevenueChart data={metrics.financialHealth.monthlyEvolution} height={360} />
              <DataTable
                columns={[
                  { key: "month", header: "Mês", render: (row) => row.month },
                  { key: "revenue", header: "Receita", align: "right", render: (row) => currencyFormatter.format(row.revenue) },
                  { key: "expenses", header: "Despesas", align: "right", render: (row) => currencyFormatter.format(row.expenses) },
                  { key: "net", header: "Líquido", align: "right", render: (row) => currencyFormatter.format(row.revenue - row.expenses) },
                ]}
                rows={metrics.financialHealth.monthlyEvolution}
                getRowKey={(row) => row.month}
                emptyIcon={Wallet}
                emptyLabel="Sem dado suficiente."
              />
            </div>
          }
        >
          <ChartCard title={`Cash Flow — Last ${cashFlowMonths} Months`} action={<PeriodSelect />}>
            <RevenueChart data={metrics.financialHealth.monthlyEvolution} />
          </ChartCard>
        </ChartExpandDialog>
      </section>

      {/* Sales Pipeline */}
      <section className="flex flex-col gap-4">
        <SectionHeader title="Sales Pipeline" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ChartExpandDialog
            title="Sales Pipeline"
            description="Valor de pipeline aberto por estágio."
            className="lg:col-span-2"
            expanded={
              metrics.salesPipeline.stages.some((stage) => stage.count > 0) ? (
                <div className="flex flex-col gap-5">
                  <SalesPipelineChart stages={metrics.salesPipeline.stages} height={340} />
                  <DataTable
                    columns={[
                      { key: "stage", header: "Estágio", render: (row) => row.label },
                      { key: "count", header: "Leads", align: "right", render: (row) => String(row.count) },
                      { key: "value", header: "Valor", align: "right", render: (row) => currencyFormatter.format(row.value) },
                    ]}
                    rows={metrics.salesPipeline.stages}
                    getRowKey={(row) => row.label}
                    emptyIcon={Handshake}
                    emptyLabel="Sem leads abertos."
                  />
                </div>
              ) : (
                <EmptyInline icon={Handshake} label="No active opportunities — create a deal to start building your pipeline." />
              )
            }
          >
            <div className="rounded-xl border border-border/60 bg-card p-5">
              {metrics.salesPipeline.stages.some((stage) => stage.count > 0) ? (
                <SalesPipelineChart stages={metrics.salesPipeline.stages} />
              ) : (
                <EmptyInline icon={Handshake} label="No active opportunities — create a deal to start building your pipeline." />
              )}
            </div>
          </ChartExpandDialog>
          <div className="flex flex-col gap-4">
            <CardWithDetail
              title="Conversion (Lead → Client)"
              description="Percentual de todos os leads já cadastrados que viraram cliente."
              detail={
                <DetailList
                  items={[
                    { label: "Leads em aberto", value: String(metrics.kpis.pipeline.openCount) },
                    { label: "Clientes convertidos", value: String(d.activeClients.length + d.churnedClients.length) },
                  ]}
                  emptyLabel="Sem dado suficiente."
                />
              }
            >
              <FinancialBlock label="Conversion (Lead → Client)" value={metrics.salesPipeline.conversionRate != null ? percentFormatter(metrics.salesPipeline.conversionRate * 100) : "No data available"} />
            </CardWithDetail>
            <CardWithDetail title="Average Deal" description="Ticket médio dos negócios fechados." detail={<DetailList items={d.wonDeals} emptyLabel="Nenhum negócio fechado com valor registrado ainda." />}>
              <FinancialBlock label="Average Deal" value={metrics.salesPipeline.averageDeal != null ? currencyFormatter.format(metrics.salesPipeline.averageDeal) : "No data available"} />
            </CardWithDetail>
            <CardWithDetail
              title="Weighted Pipeline"
              description="Soma do pipeline aberto × probabilidade de cada estágio."
              detail={
                metrics.salesPipeline.weightedPipeline != null ? (
                  <DetailList items={d.openLeads} emptyLabel="Nenhum lead aberto." />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Ainda não existe probabilidade configurada pra todo estágio do pipeline — sem isso, o cálculo ponderado ficaria incompleto. Configure em Settings → CRM quando essa tela existir.
                  </p>
                )
              }
            >
              <FinancialBlock label="Weighted Pipeline" value={metrics.salesPipeline.weightedPipeline != null ? currencyFormatter.format(metrics.salesPipeline.weightedPipeline) : "Not enough data"} />
            </CardWithDetail>
          </div>
        </div>
      </section>

      {/* Customer Health */}
      <section className="flex flex-col gap-4">
        <SectionHeader title="Customer Health" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <CardWithDetail title="Active Clients" description="Clientes com status ativo." detail={<DetailList items={d.activeClients} emptyLabel="Nenhum cliente ativo ainda." />}>
            <FinancialBlock label="Active Clients" value={String(metrics.customerHealth.activeClients)} />
          </CardWithDetail>
          <CardWithDetail title="Revenue Concentration" description="Top 5 clientes por receita de contrato ativo." detail={<DetailList items={d.topClients} emptyLabel="Sem contrato ativo suficiente." />}>
            <FinancialBlock label="Revenue Concentration (Top 5)" value={metrics.customerHealth.concentrationTop5Pct != null ? percentFormatter(metrics.customerHealth.concentrationTop5Pct) : "No data available"} />
          </CardWithDetail>
          <CardWithDetail title="Churn (current)" description="Clientes com status churn, no momento." detail={<DetailList items={d.churnedClients} emptyLabel="Nenhum cliente em churn." />}>
            <FinancialBlock label="Churn (current)" value={metrics.customerHealth.churnPct != null ? percentFormatter(metrics.customerHealth.churnPct) : "No data available"} />
          </CardWithDetail>
          <CardWithDetail title="Average Client Value" description="Receita de contrato ativo, por cliente." detail={<DetailList items={d.topClients} emptyLabel="Sem contrato ativo suficiente." />}>
            <FinancialBlock label="Average Client Value" value={metrics.customerHealth.averageClientValue != null ? currencyFormatter.format(metrics.customerHealth.averageClientValue) : "No data available"} />
          </CardWithDetail>
        </div>
      </section>

      {/* Operations + Team */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section className="flex flex-col gap-4">
          <SectionHeader title="Operations" />
          <div className="grid grid-cols-2 gap-4">
            <CardWithDetail title="Team" description="Quem tem acesso ao Procreating OS." detail={<DetailList items={d.teamMembers} emptyLabel="Nenhum usuário cadastrado." />}>
              <FinancialBlock label="Team" value={String(metrics.operations.headcount)} />
            </CardWithDetail>
            <NotTrackedCard label="Capacity" />
            <NotTrackedCard label="On-time" />
            <NotTrackedCard label="Projects at risk" />
          </div>
        </section>
        <section className="flex flex-col gap-4">
          <SectionHeader title="Team" />
          <div className="grid grid-cols-2 gap-4">
            <CardWithDetail title="Headcount" description="Quem tem acesso ao Procreating OS." detail={<DetailList items={d.teamMembers} emptyLabel="Nenhum usuário cadastrado." />}>
              <FinancialBlock label="Headcount" value={String(metrics.team.headcount)} />
            </CardWithDetail>
            <NotTrackedCard label="Utilization" />
            <NotTrackedCard label="Overloaded" />
            <NotTrackedCard label="Available" />
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
              <AttentionRow key={item.label} item={item} overdueRevenue={d.overdueRevenue} overdueExpenses={d.overdueExpenses} />
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
    <div className="flex h-full flex-col gap-1 rounded-xl border border-border/60 bg-card p-4">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={muted ? "text-sm text-muted-foreground" : "text-xl font-semibold tabular-nums"}>{value}</span>
    </div>
  );
}

/** Card pros números que ainda não têm dado nenhum por trás (capacity/on-time/etc. — não existe
 *  tabela de projeto interno/alocação ainda). Clicável igual aos outros, só que o modal explica
 *  honestamente por que não tem número, em vez de fingir. */
function NotTrackedCard({ label }: { label: string }) {
  return (
    <CardWithDetail title={label} detail={<p className="text-sm text-muted-foreground">Ainda não existe uma tabela de projeto interno/alocação de equipe no sistema — esse número não pode ser calculado de dado real ainda. Fica de fora até essa parte do produto existir, em vez de mostrar um valor inventado.</p>}>
      <FinancialBlock label={label} value="Not tracked yet" muted />
    </CardWithDetail>
  );
}

function AttentionRow({ item, overdueRevenue, overdueExpenses }: { item: { label: string; detail: string; tone: "danger" | "warning" | "success" }; overdueRevenue: DetailEntry[]; overdueExpenses: DetailEntry[] }) {
  const isRevenue = item.label.includes("invoice");
  const isExpense = item.label.includes("bill");
  const items = isRevenue ? overdueRevenue : isExpense ? overdueExpenses : [];

  const content = (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">{item.label}</span>
        <span className="text-xs text-muted-foreground">{item.detail}</span>
      </div>
      <StatusBadge tone={item.tone} label={item.tone === "success" ? "OK" : item.tone === "danger" ? "Critical" : "Warning"} />
    </div>
  );

  if (items.length === 0) return <li>{content}</li>;

  return (
    <li>
      <CardWithDetail title={item.label} description={item.detail} detail={<DetailList items={items} emptyLabel="Nenhum item." />} className="rounded-none hover:-translate-y-0 hover:bg-foreground/[0.03]">
        {content}
      </CardWithDetail>
    </li>
  );
}
