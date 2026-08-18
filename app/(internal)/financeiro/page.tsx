import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowDownCircle, ArrowRight, ArrowUpCircle, CalendarClock, Clock, PiggyBank, ShieldAlert, TrendingUp, Users, Wallet } from "lucide-react";
import { computeFinanceiroMetrics, listCosts, listExpenses, listRevenue } from "@/lib/financeiro/queries";
import { computeDistribution } from "@/lib/financeiro/rules";
import { updateRevenueStatusAction } from "@/lib/financeiro/actions";
import { requireFinancialAccess } from "@/lib/auth/permissions";
import { formatDateOnly } from "@/lib/date";
import { StatTile } from "@/components/dashboard/stat-tile";
import { RevenueChart } from "@/components/financeiro/revenue-chart";
import { SectionHeader } from "@/components/dashboard/section-header";
import { PageHeader } from "@/components/dashboard/page-header";
import { PageTabs } from "@/components/dashboard/page-tabs";
import { PeriodSelect } from "@/components/dashboard/period-select";
import { FinancialEntriesTable } from "@/components/financeiro/financial-entries-table";
import { ExpensesTable } from "@/components/financeiro/expenses-table";
import { DespesasToolbar } from "@/components/financeiro/despesas-toolbar";
import { CostsList } from "@/components/financeiro/costs-list";
import { EmptyState } from "@/components/dashboard/empty-state";
import { CardWithDetail } from "@/components/dashboard/card-with-detail";
import { ChartExpandDialog } from "@/components/dashboard/chart-expand-dialog";
import { ChartCard } from "@/components/dashboard/chart-card";
import { DetailList } from "@/components/dashboard/detail-list";
import { DataTable } from "@/components/dashboard/data-table";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Financeiro — Procreating",
  robots: { index: false, follow: false },
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const TABS = [
  { key: "overview", label: "Visão Geral" },
  { key: "receivables", label: "A Receber" },
  { key: "payables", label: "A Pagar" },
  { key: "costs", label: "Custos" },
  { key: "distribution", label: "Distribuição" },
];

/**
 * Financeiro — consolidado de 7 rotas pra 1 com abas internas (`PageTabs`). Receitas/Despesas e
 * Contas a Receber/Contas a Pagar eram a MESMA query com um filtro de status diferente — viraram
 * um `StatusToggle` dentro da mesma aba, não duas abas repetindo a mesma tabela. Custos e
 * Distribuição continuam à parte (entidades genuinamente diferentes, ver comentário em
 * `lib/supabase/types/database.ts` sobre `Cost` vs `Expense`).
 */
export default async function FinanceiroPage({ searchParams }: { searchParams: Promise<{ tab?: string; months?: string; status?: string }> }) {
  // RBAC mínimo (Passo 1 item 2) — owner/admin/finance apenas. Página inteira, todas as abas
  // (a mesma sessão que abriria qualquer aba consultaria a mesma tabela `revenue`/`expenses`).
  const access = await requireFinancialAccess();
  if (!access.ok) {
    return (
      <main className="mx-auto flex max-w-[1400px] flex-col px-6 pt-8 pb-16 lg:px-10">
        <EmptyState icon={ShieldAlert} title="Sem acesso" description={access.error} />
      </main>
    );
  }

  const { tab: tabParam, months: monthsParam, status: statusParam } = await searchParams;
  const tab = tabParam ?? "overview";
  const statusFilter: "pendentes" | "todas" = statusParam === "todas" ? "todas" : "pendentes";

  let content: ReactNode;

  if (tab === "receivables") {
    const revenue = await listRevenue();
    const filtered = statusFilter === "todas" ? revenue : revenue.filter((row) => row.status === "pendente" || row.status === "atrasado");
    const rows = filtered.map((row) => ({ id: row.id, label: row.description, category: null, amount: Number(row.amount), dueDate: row.due_date, status: row.status }));
    content = (
      <section className="flex flex-col gap-4">
        {/* Minimalismo — descrição só quando explica algo não-óbvio (parcelas são geradas
         *  automaticamente, não lançadas na mão); o filtro Pendentes/Todas já fala por si no
         *  toggle ao lado, não precisa de uma segunda frase repetindo o estado. */}
        <SectionHeader
          title="A Receber"
          description={statusFilter === "todas" ? "Geradas automaticamente a partir dos contratos, no fechamento do onboarding." : undefined}
          action={<StatusToggle tab="receivables" status={statusFilter} />}
        />
        <FinancialEntriesTable rows={rows} onStatusChange={updateRevenueStatusAction} emptyLabel={statusFilter === "todas" ? "Nenhum lançamento de receita ainda." : "Nada pendente ou atrasado — tudo em dia."} />
      </section>
    );
  } else if (tab === "payables") {
    const expenses = await listExpenses();
    const filtered = statusFilter === "todas" ? expenses : expenses.filter((row) => row.status === "pendente" || row.status === "atrasado");
    const rows = filtered.map((row) => ({ id: row.id, label: row.description, category: row.category, amount: Number(row.amount), dueDate: row.due_date, status: row.status }));
    content = (
      <section className="flex flex-col gap-4">
        <SectionHeader
          title="A Pagar"
          description={statusFilter === "todas" ? "Cadastro manual — sem integração bancária ainda." : undefined}
          action={
            <div className="flex items-center gap-3">
              <StatusToggle tab="payables" status={statusFilter} />
              <DespesasToolbar />
            </div>
          }
        />
        <ExpensesTable rows={rows} emptyLabel={statusFilter === "todas" ? "Nenhuma despesa cadastrada ainda." : "Nada pendente ou atrasado — tudo em dia."} />
      </section>
    );
  } else if (tab === "costs") {
    const costs = await listCosts();
    const monthlyTotal = costs.reduce((sum, cost) => sum + Number(cost.amount), 0);
    content = (
      <section className="flex flex-col gap-4">
        <SectionHeader title="Custos" description="Estrutura fixa/variável da empresa — ainda não gera lançamento automático em Despesas." />
        {costs.length > 0 && (
          <p className="-mt-2 text-sm">
            <span className="text-muted-foreground">Run-rate mensal: </span>
            <span className="font-medium tabular-nums">{currencyFormatter.format(monthlyTotal)}</span>
          </p>
        )}
        <CostsList costs={costs} />
      </section>
    );
  } else if (tab === "distribution") {
    const metrics = await computeFinanceiroMetrics();
    const distribution = await computeDistribution(metrics.revenueThisMonth);
    content = (
      <section className="flex flex-col gap-4">
        <SectionHeader
          title="Distribuição"
          description={
            <>
              Faturamento deste mês → operacional → distribuível → por sócio, calculado a partir da regra em{" "}
              <Link href="/configuracoes/regras-financeiras" className="underline underline-offset-4 hover:text-foreground">
                Regras financeiras
              </Link>
              .
            </>
          }
        />
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/60 bg-card/40 p-6">
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-muted-foreground">Faturamento (mês)</p>
            <p className="text-2xl font-semibold tabular-nums">{currencyFormatter.format(distribution.revenue)}</p>
          </div>
          <ArrowRight className="size-4 text-muted-foreground" />
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-muted-foreground">Operacional ({distribution.operationalPercentage}%)</p>
            <p className="text-2xl font-semibold tabular-nums">{currencyFormatter.format(distribution.operationalAmount)}</p>
          </div>
          <ArrowRight className="size-4 text-muted-foreground" />
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-muted-foreground">Distribuível</p>
            <p className="text-2xl font-semibold tabular-nums text-brand">{currencyFormatter.format(distribution.distributable)}</p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Por sócio</h3>
          {distribution.partners.length === 0 ? (
            <div className="rounded-xl border border-border/60 bg-card/20 px-6 py-16 text-center text-muted-foreground">Nenhum sócio (role: owner) cadastrado ainda.</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {distribution.partners.map((partner) => (
                <div key={partner.userId} className="flex flex-col gap-1 rounded-xl border border-border/60 bg-card/40 p-5">
                  <p className="text-sm font-medium">{partner.name}</p>
                  <p className="text-2xl font-semibold tabular-nums">{currencyFormatter.format(partner.amount)}</p>
                  <p className="text-xs text-muted-foreground">{partner.percentage.toFixed(1)}% do distribuível</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  } else {
    const months = Number(monthsParam) || 6;
    const metrics = await computeFinanceiroMetrics(months);
    // Mesma regra 20/80 já usada na aba Distribuição (`computeDistribution`) — pedido explícito
    // pra trazer "Caixa Operacional" e "Salário dos Sócios" pra Visão Geral também, não só lá.
    const distribution = await computeDistribution(metrics.revenueThisMonth);
    const partnerSalaryEach = distribution.distributable / 2;
    content = (
      <>
        {/* Todo bloco é clicável (`CardWithDetail`) — abre a lista real das entradas por trás do
         *  número, mesmo padrão já usado no Dashboard (pedido explícito: "todos os blocos devem
         *  ser clicáveis pra ver mais informações das entradas"). Nenhum número novo: as listas
         *  vêm prontas de `computeFinanceiroMetrics` (mesma soma que já vira o valor do bloco). */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <CardWithDetail
            title="MRR (recorrente ativo)"
            description="Contratos recorrentes ativos, um por cliente."
            detail={<DetailList items={metrics.mrrEntries} emptyLabel="Nenhum contrato recorrente ativo ainda." />}
          >
            <StatTile demo={false} label="MRR (recorrente ativo)" value={currencyFormatter.format(metrics.mrr)} icon={<TrendingUp className="size-4.5" />} tone="brand" />
          </CardWithDetail>
          <CardWithDetail
            title="Receita este mês"
            description="Todo lançamento com vencimento este mês — pago, pendente ou atrasado."
            detail={<DetailList items={metrics.revenueThisMonthEntries} emptyLabel="Nenhuma receita com vencimento este mês." />}
          >
            <StatTile demo={false} label="Receita este mês" value={currencyFormatter.format(metrics.revenueThisMonth)} icon={<ArrowUpCircle className="size-4.5" />} tone="success" />
          </CardWithDetail>
          <CardWithDetail title="Despesas este mês" detail={<DetailList items={metrics.expensesThisMonthEntries} emptyLabel="Nenhuma despesa com vencimento este mês." />}>
            <StatTile demo={false} label="Despesas este mês" value={currencyFormatter.format(metrics.expensesThisMonth)} icon={<ArrowDownCircle className="size-4.5" />} tone="info" />
          </CardWithDetail>
          <CardWithDetail
            title={`A receber (até ${metrics.receivablesRecurringYear})`}
            description="Só clientes com contrato recorrente ativo — pendente, ainda não vencido nem pago."
            detail={<DetailList items={metrics.receivablesRecurringEntries} emptyLabel="Nada pendente de cliente recorrente até lá." />}
          >
            <StatTile
              demo={false}
              label={`A receber (até ${metrics.receivablesRecurringYear})`}
              value={currencyFormatter.format(metrics.receivablesRecurringThroughNextYear)}
              icon={<Clock className="size-4.5" />}
              tone="warning"
            />
          </CardWithDetail>
          <CardWithDetail title="A receber (atrasado)" detail={<DetailList items={metrics.receivablesOverdueEntries} emptyLabel="Nada atrasado no momento." />}>
            <StatTile demo={false} label="A receber (atrasado)" value={currencyFormatter.format(metrics.receivablesOverdue)} icon={<AlertTriangle className="size-4.5" />} tone="danger" />
          </CardWithDetail>
          <CardWithDetail
            title={`Vence nos próximos ${metrics.upcomingReceivables.windowDays} dias`}
            description="Só pendentes — o que já está atrasado tem alerta próprio."
            detail={
              <DetailList
                items={metrics.upcomingReceivables.entries.map((entry) => ({ label: entry.description, value: currencyFormatter.format(entry.amount), meta: `Vence ${formatDateOnly(entry.dueDate)}` }))}
                emptyLabel="Nada vencendo nessa janela."
              />
            }
          >
            <StatTile
              demo={false}
              label={`Vence nos próximos ${metrics.upcomingReceivables.windowDays} dias`}
              value={currencyFormatter.format(metrics.upcomingReceivables.total)}
              icon={<CalendarClock className="size-4.5" />}
              tone="warning"
            />
          </CardWithDetail>
          <CardWithDetail title="A pagar (pendente + atrasado)" detail={<DetailList items={metrics.payablesEntries} emptyLabel="Nada a pagar em aberto." />}>
            <StatTile demo={false} label="A pagar (pendente + atrasado)" value={currencyFormatter.format(metrics.payablesPending + metrics.payablesOverdue)} icon={<Wallet className="size-4.5" />} tone="warning" />
          </CardWithDetail>
          <CardWithDetail
            title="Caixa Operacional"
            description={
              <>
                {distribution.operationalPercentage}% da receita bruta deste mês — mesma regra de{" "}
                <Link href="/configuracoes/regras-financeiras" className="underline underline-offset-4 hover:text-foreground">
                  Regras financeiras
                </Link>
                .
              </>
            }
            detail={
              <DetailList
                items={[
                  { label: "Receita bruta (mês)", value: currencyFormatter.format(distribution.revenue) },
                  { label: `Operacional (${distribution.operationalPercentage}%)`, value: currencyFormatter.format(distribution.operationalAmount) },
                ]}
                emptyLabel="Sem dado suficiente."
              />
            }
          >
            <StatTile demo={false} label="Caixa Operacional" value={currencyFormatter.format(distribution.operationalAmount)} icon={<PiggyBank className="size-4.5" />} tone="info" />
          </CardWithDetail>
          <CardWithDetail
            title="Salário dos Sócios"
            description="Distribuível (receita − operacional) dividido por 2 — divisão fixa, diferente da regra configurável (por sócio) da aba Distribuição."
            detail={
              <DetailList
                items={[
                  { label: `Distribuível (${100 - distribution.operationalPercentage}%)`, value: currencyFormatter.format(distribution.distributable) },
                  { label: "Por sócio (÷ 2)", value: currencyFormatter.format(partnerSalaryEach) },
                ]}
                emptyLabel="Sem dado suficiente."
              />
            }
          >
            <StatTile demo={false} label="Salário dos Sócios (cada)" value={currencyFormatter.format(partnerSalaryEach)} icon={<Users className="size-4.5" />} tone="brand" />
          </CardWithDetail>
        </div>

        <ChartExpandDialog
          title={`Evolução (últimos ${months} meses)`}
          expanded={
            <div className="flex flex-col gap-5">
              <RevenueChart data={metrics.monthlyEvolution} height={360} />
              <DataTable
                columns={[
                  { key: "month", header: "Mês", render: (row) => row.month },
                  { key: "revenue", header: "Receita", align: "right", render: (row) => currencyFormatter.format(row.revenue) },
                  { key: "expenses", header: "Despesas", align: "right", render: (row) => currencyFormatter.format(row.expenses) },
                  { key: "net", header: "Líquido", align: "right", render: (row) => currencyFormatter.format(row.revenue - row.expenses) },
                ]}
                rows={metrics.monthlyEvolution}
                getRowKey={(row) => row.month}
                emptyIcon={Wallet}
                emptyLabel="Sem dado suficiente."
              />
            </div>
          }
        >
          <ChartCard title={`Evolução (últimos ${months} meses)`} action={<PeriodSelect />}>
            <RevenueChart data={metrics.monthlyEvolution} />
          </ChartCard>
        </ChartExpandDialog>

        <section className="flex flex-col gap-4">
          <SectionHeader title="Pipeline — em negociação" description="Nunca somado ao MRR nem a 'a receber' — só vira receita se o negócio for ganho." />
          {metrics.pipelineOpportunities.length === 0 ? (
            <div className="rounded-xl border border-border/60 bg-card/20 px-6 py-10 text-center text-muted-foreground">Nenhuma negociação em aberto no momento.</div>
          ) : (
            <div className="flex flex-col gap-3 rounded-xl border border-dashed border-brand/40 bg-brand/5 p-5">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-sm text-muted-foreground">MRR potencial adicional se fechar</p>
                <p className="text-2xl font-semibold tabular-nums text-brand">{currencyFormatter.format(metrics.pipelinePotentialMrr)}</p>
              </div>
              <div className="flex flex-col divide-y divide-border/60">
                {metrics.pipelineOpportunities.map((opportunity) => (
                  <div key={opportunity.label} className="flex items-center justify-between gap-4 py-2 text-sm">
                    <span>{opportunity.label}</span>
                    <span className="tabular-nums text-muted-foreground">{currencyFormatter.format(opportunity.potentialMonthlyValue)}/mês</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </>
    );
  }

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-6 px-6 pt-8 pb-16 lg:px-10">
      <div className="flex flex-col gap-4">
        <PageHeader title="Financeiro" description="Receita recorrente, despesas e fluxo de caixa — sem cobrança automática nem integração bancária ainda." />
        <PageTabs tabs={TABS} activeKey={tab} />
      </div>
      <div className="flex flex-col gap-8">{content}</div>
    </main>
  );
}

function StatusToggle({ tab, status }: { tab: string; status: "pendentes" | "todas" }) {
  return (
    <div className="flex items-center gap-1 rounded-md border border-border/60 p-0.5 text-xs">
      <Link href={`/financeiro?tab=${tab}`} className={cn("rounded px-2 py-1 transition-colors", status === "pendentes" ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:text-foreground")}>
        Pendentes
      </Link>
      <Link
        href={`/financeiro?tab=${tab}&status=todas`}
        className={cn("rounded px-2 py-1 transition-colors", status === "todas" ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:text-foreground")}
      >
        Todas
      </Link>
    </div>
  );
}
