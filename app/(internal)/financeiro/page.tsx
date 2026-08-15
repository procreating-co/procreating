import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowDownCircle, ArrowRight, ArrowUpCircle, Clock, TrendingUp, Wallet } from "lucide-react";
import { computeFinanceiroMetrics, listCosts, listExpenses, listRevenue } from "@/lib/financeiro/queries";
import { computeDistribution } from "@/lib/financeiro/rules";
import { updateExpenseStatusAction, updateRevenueStatusAction } from "@/lib/financeiro/actions";
import { StatTile } from "@/components/dashboard/stat-tile";
import { RevenueChart } from "@/components/financeiro/revenue-chart";
import { SectionHeader } from "@/components/dashboard/section-header";
import { PageHeader } from "@/components/dashboard/page-header";
import { PageTabs } from "@/components/dashboard/page-tabs";
import { PeriodSelect } from "@/components/dashboard/period-select";
import { FinancialEntriesTable } from "@/components/financeiro/financial-entries-table";
import { DespesasToolbar } from "@/components/financeiro/despesas-toolbar";
import { CostsList } from "@/components/financeiro/costs-list";
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
        <SectionHeader
          title="A Receber"
          description={statusFilter === "todas" ? "Todas as parcelas — geradas automaticamente a partir dos contratos no fechamento do onboarding." : "Parcelas pendentes ou atrasadas."}
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
          description={statusFilter === "todas" ? "Cadastro manual, por categoria — sem integração bancária ainda." : "Despesas pendentes ou atrasadas."}
          action={
            <div className="flex items-center gap-3">
              <StatusToggle tab="payables" status={statusFilter} />
              <DespesasToolbar />
            </div>
          }
        />
        <FinancialEntriesTable rows={rows} onStatusChange={updateExpenseStatusAction} emptyLabel={statusFilter === "todas" ? "Nenhuma despesa cadastrada ainda." : "Nada pendente ou atrasado — tudo em dia."} />
      </section>
    );
  } else if (tab === "costs") {
    const costs = await listCosts();
    const monthlyTotal = costs.reduce((sum, cost) => sum + Number(cost.amount), 0);
    content = (
      <section className="flex flex-col gap-4">
        <SectionHeader title="Custos" description="Estrutura de custo fixo e variável da empresa — aluguel, ferramentas, pró-labore. Ainda não gera lançamento automático em Despesas." />
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
    content = (
      <>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatTile demo={false} label="MRR (recorrente ativo)" value={currencyFormatter.format(metrics.mrr)} icon={<TrendingUp className="size-4.5" />} tone="brand" />
          <StatTile demo={false} label="Receita este mês" value={currencyFormatter.format(metrics.revenueThisMonth)} icon={<ArrowUpCircle className="size-4.5" />} tone="success" />
          <StatTile demo={false} label="Despesas este mês" value={currencyFormatter.format(metrics.expensesThisMonth)} icon={<ArrowDownCircle className="size-4.5" />} tone="info" />
          <StatTile demo={false} label="A receber (pendente)" value={currencyFormatter.format(metrics.receivablesPending)} icon={<Clock className="size-4.5" />} tone="warning" />
          <StatTile demo={false} label="A receber (atrasado)" value={currencyFormatter.format(metrics.receivablesOverdue)} icon={<AlertTriangle className="size-4.5" />} tone="danger" />
          <StatTile demo={false} label="A pagar (pendente + atrasado)" value={currencyFormatter.format(metrics.payablesPending + metrics.payablesOverdue)} icon={<Wallet className="size-4.5" />} tone="warning" />
        </div>

        <section className="flex flex-col gap-4">
          <SectionHeader title={`Evolução (últimos ${months} meses)`} action={<PeriodSelect />} />
          <div className="rounded-xl border border-border/60 bg-card/40 p-5">
            <RevenueChart data={metrics.monthlyEvolution} />
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <SectionHeader
            title="Pipeline — em negociação"
            description="Oportunidades ainda não fechadas. Nunca somado ao MRR nem a 'a receber' acima — só vira receita quando o negócio for de fato ganho."
          />
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
