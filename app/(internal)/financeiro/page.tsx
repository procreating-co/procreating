import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowDownCircle, ArrowRight, ArrowUpCircle, CalendarClock, Clock, DollarSign, PiggyBank, Settings2, ShieldAlert, TrendingUp, Wallet } from "lucide-react";
import { computeFinanceiroMetrics, listCosts, listExpenses, listRevenue } from "@/lib/financeiro/queries";
import { computeDistribution } from "@/lib/financeiro/rules";
import { updateRevenueStatusAction } from "@/lib/financeiro/actions";
import { requireFinancialAccess } from "@/lib/auth/permissions";
import { formatDateOnly } from "@/lib/date";
import { StatTile } from "@/components/dashboard/stat-tile";
import { Button } from "@/components/ui/button";
import { RevenueChart } from "@/components/financeiro/revenue-chart";
import { SectionHeader } from "@/components/dashboard/section-header";
import { PageHeader } from "@/components/dashboard/page-header";
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
import { ExpensesQuickAdd } from "@/components/financeiro/expenses-quick-add";
import { EvolutionDetail } from "@/components/financeiro/evolution-detail";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Financeiro — Procreating",
  robots: { index: false, follow: false },
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/**
 * Financeiro — página única, sem abas (redesign, Bloco 1). Antes disso, 5 abas decidiam o
 * conteúdo por `?tab=`; agora tudo empilha na mesma página, nesta ordem: KPIs+Evolução → A
 * Receber → A Pagar → Custos → Distribuição. Os toggles Pendentes/Todas continuam — nunca foram
 * abas de verdade, são filtros locais de cada seção — só os query params mudaram de nome
 * (`?tab=receivables&status=todas` → `?receivablesStatus=todas`) porque as duas seções agora
 * coexistem na mesma URL ao mesmo tempo, precisam de chaves distintas. Nenhuma query mudou de
 * lógica neste bloco — só deixou de rodar condicionalmente por aba e passou a rodar sempre.
 */
export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ months?: string; receivablesStatus?: string; payablesStatus?: string }>;
}) {
  // RBAC mínimo (Passo 1 item 2) — owner/admin/finance apenas. Página inteira.
  const access = await requireFinancialAccess();
  if (!access.ok) {
    return (
      <main className="mx-auto flex max-w-[1400px] flex-col px-6 pt-8 pb-16 lg:px-10">
        <EmptyState icon={ShieldAlert} title="Sem acesso" description={access.error} />
      </main>
    );
  }

  const { months: monthsParam, receivablesStatus: receivablesStatusParam, payablesStatus: payablesStatusParam } = await searchParams;
  const months = Number(monthsParam) || 6;
  const receivablesStatusFilter: "pendentes" | "todas" = receivablesStatusParam === "todas" ? "todas" : "pendentes";
  const payablesStatusFilter: "pendentes" | "todas" = payablesStatusParam === "todas" ? "todas" : "pendentes";

  const [metrics, revenue, expenses, costs] = await Promise.all([computeFinanceiroMetrics(months), listRevenue(), listExpenses(), listCosts()]);
  // Mesma regra 20/80 já usada na Distribuição (`computeDistribution`) — também alimenta Caixa
  // Operacional/Salário logo abaixo dos KPIs.
  const distribution = await computeDistribution(metrics.revenueThisMonth);
  const partnerSalaryEach = distribution.distributable / 2;

  const filteredReceivables = receivablesStatusFilter === "todas" ? revenue : revenue.filter((row) => row.status === "pendente" || row.status === "atrasado");
  const receivablesRows = filteredReceivables.map((row) => ({ id: row.id, label: row.description, category: null, amount: Number(row.amount), dueDate: row.due_date, status: row.status }));

  const filteredPayables = payablesStatusFilter === "todas" ? expenses : expenses.filter((row) => row.status === "pendente" || row.status === "atrasado");
  const payablesRows = filteredPayables.map((row) => ({ id: row.id, label: row.description, category: row.category, amount: Number(row.amount), dueDate: row.due_date, status: row.status }));

  const costsMonthlyTotal = costs.reduce((sum, cost) => sum + Number(cost.amount), 0);

  const receivablesOtherParams = new URLSearchParams();
  if (payablesStatusParam === "todas") receivablesOtherParams.set("payablesStatus", "todas");
  if (monthsParam) receivablesOtherParams.set("months", monthsParam);
  const payablesOtherParams = new URLSearchParams();
  if (receivablesStatusParam === "todas") payablesOtherParams.set("receivablesStatus", "todas");
  if (monthsParam) payablesOtherParams.set("months", monthsParam);

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-10 px-6 pt-8 pb-16 lg:px-10">
      <PageHeader title="Financeiro" />

      {/* KPIs + Evolução — fica como estava, só saiu de trás de uma aba. Todo bloco é clicável
       *  (`CardWithDetail`) — abre a lista real das entradas por trás do número, mesmo padrão já
       *  usado no Dashboard. Nenhum número novo: as listas vêm prontas de
       *  `computeFinanceiroMetrics` (mesma soma que já vira o valor do bloco). */}
      <section className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <CardWithDetail
            title="Receita do Mês"
            description="Todo lançamento com vencimento este mês — pago, pendente ou atrasado."
            detail={<DetailList items={metrics.revenueThisMonthEntries} emptyLabel="Nenhuma receita com vencimento este mês." />}
          >
            <StatTile demo={false} label="Receita do Mês" value={currencyFormatter.format(metrics.revenueThisMonth)} icon={<ArrowUpCircle className="size-4.5" />} tone="success" />
          </CardWithDetail>
          <CardWithDetail
            title="Receita Recorrente Mensal"
            description="Contratos recorrentes ativos, um por cliente."
            detail={<DetailList items={metrics.mrrEntries} emptyLabel="Nenhum contrato recorrente ativo ainda." />}
          >
            <StatTile demo={false} label="Receita Recorrente Mensal" value={currencyFormatter.format(metrics.mrr)} icon={<TrendingUp className="size-4.5" />} tone="brand" />
          </CardWithDetail>
          <CardWithDetail
            title="Salário"
            description="Distribuível (receita − operacional) dividido por 2 — divisão fixa, diferente da regra configurável (por sócio) da Distribuição."
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
            <StatTile demo={false} label="Salário (cada sócio)" value={currencyFormatter.format(partnerSalaryEach)} icon={<DollarSign className="size-4.5" />} tone="success" />
          </CardWithDetail>
          <CardWithDetail
            title="Caixa Operacional"
            description={`${distribution.operationalPercentage}% da receita bruta deste mês.`}
            detail={
              <div className="flex flex-col gap-3">
                <DetailList
                  items={[
                    { label: "Receita bruta (mês)", value: currencyFormatter.format(distribution.revenue) },
                    { label: `Operacional (${distribution.operationalPercentage}%)`, value: currencyFormatter.format(distribution.operationalAmount) },
                  ]}
                  emptyLabel="Sem dado suficiente."
                />
                <Button asChild variant="outline" size="sm" className="w-fit gap-1.5">
                  <Link href="/configuracoes/regras-financeiras">
                    <Settings2 className="size-3.5" />
                    Editar percentual em Regras financeiras
                  </Link>
                </Button>
              </div>
            }
          >
            <StatTile demo={false} label="Caixa Operacional" value={currencyFormatter.format(distribution.operationalAmount)} icon={<PiggyBank className="size-4.5" />} tone="info" />
          </CardWithDetail>
          <CardWithDetail title="Despesas" detail={<ExpensesQuickAdd entries={metrics.expensesThisMonthEntries} emptyLabel="Nenhuma despesa com vencimento este mês." />}>
            <StatTile demo={false} label="Despesas" value={currencyFormatter.format(metrics.expensesThisMonth)} icon={<ArrowDownCircle className="size-4.5" />} tone="info" />
          </CardWithDetail>
          <CardWithDetail
            title={`A receber (até ${metrics.receivablesRecurringYear})`}
            description="Todo cliente com contrato recorrente ativo, projetado mês a mês — usa a cobrança real quando já existe, projeta o valor do contrato quando ainda não existe."
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
        </div>

        <ChartExpandDialog
          title={`Evolução (últimos ${months} meses)`}
          description="Clique num mês na tabela pra ver de onde saiu o faturamento — quais clientes, quanto cada um."
          expanded={<EvolutionDetail data={metrics.monthlyEvolution} />}
        >
          <ChartCard title={`Evolução (últimos ${months} meses)`} action={<PeriodSelect />}>
            <RevenueChart data={metrics.monthlyEvolution} />
          </ChartCard>
        </ChartExpandDialog>

        {metrics.pipelineOpportunities.length > 0 && (
          <div className="flex flex-col gap-3 rounded-xl border border-dashed border-brand/40 bg-brand/5 p-5">
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-sm text-muted-foreground">Pipeline em negociação — MRR potencial se fechar (nunca somado ao MRR nem a "a receber")</p>
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

      <section id="a-receber" className="flex scroll-mt-20 flex-col gap-4">
        {/* Minimalismo — descrição só quando explica algo não-óbvio (parcelas são geradas
         *  automaticamente, não lançadas na mão); o filtro Pendentes/Todas já fala por si no
         *  toggle ao lado, não precisa de uma segunda frase repetindo o estado. */}
        <SectionHeader
          title="A Receber"
          description={receivablesStatusFilter === "todas" ? "Geradas automaticamente a partir dos contratos, no fechamento do onboarding." : undefined}
          action={<StatusToggle paramKey="receivablesStatus" status={receivablesStatusFilter} otherParams={receivablesOtherParams} />}
        />
        <FinancialEntriesTable
          rows={receivablesRows}
          onStatusChange={updateRevenueStatusAction}
          emptyLabel={receivablesStatusFilter === "todas" ? "Nenhum lançamento de receita ainda." : "Nada pendente ou atrasado — tudo em dia."}
        />
      </section>

      <section id="a-pagar" className="flex scroll-mt-20 flex-col gap-4">
        <SectionHeader
          title="A Pagar"
          description={payablesStatusFilter === "todas" ? "Cadastro manual — sem integração bancária ainda." : undefined}
          action={
            <div className="flex items-center gap-3">
              <StatusToggle paramKey="payablesStatus" status={payablesStatusFilter} otherParams={payablesOtherParams} />
              <DespesasToolbar />
            </div>
          }
        />
        <ExpensesTable rows={payablesRows} emptyLabel={payablesStatusFilter === "todas" ? "Nenhuma despesa cadastrada ainda." : "Nada pendente ou atrasado — tudo em dia."} />
      </section>

      <section id="custos" className="flex scroll-mt-20 flex-col gap-4">
        <SectionHeader title="Custos" description="Estrutura fixa/variável da empresa — ainda não gera lançamento automático em Despesas." />
        {costs.length > 0 && (
          <p className="-mt-2 text-sm">
            <span className="text-muted-foreground">Run-rate mensal: </span>
            <span className="font-medium tabular-nums">{currencyFormatter.format(costsMonthlyTotal)}</span>
          </p>
        )}
        <CostsList costs={costs} />
      </section>

      <section id="distribuicao" className="flex scroll-mt-20 flex-col gap-4">
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
        {/* Clique-pra-detalhe (`CardWithDetail`) — mesmo padrão do resto do Financeiro. Os 3
         *  segmentos (Faturamento → Operacional → Distribuível) são uma conta só em cadeia, não 3
         *  métricas independentes — um clique só, com a cadeia completa no modal, em vez de
         *  fragmentar em 3 cards (mesmo espírito do detalhe de "Lucro Líquido" na Home). */}
        <CardWithDetail
          title="Faturamento → Operacional → Distribuível"
          detail={
            <DetailList
              items={[
                { label: "Faturamento (mês)", value: currencyFormatter.format(distribution.revenue) },
                { label: `Operacional (${distribution.operationalPercentage}%)`, value: `− ${currencyFormatter.format(distribution.operationalAmount)}` },
                { label: "Distribuível", value: currencyFormatter.format(distribution.distributable) },
              ]}
              emptyLabel="Sem dado suficiente."
            />
          }
        >
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/60 bg-card/40 p-6 text-left">
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
        </CardWithDetail>
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Por sócio</h3>
          {distribution.partners.length === 0 ? (
            <div className="rounded-xl border border-border/60 bg-card/20 px-6 py-16 text-center text-muted-foreground">Nenhum sócio (role: owner) cadastrado ainda.</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {distribution.partners.map((partner) => (
                <CardWithDetail
                  key={partner.userId}
                  title={partner.name}
                  description={
                    partner.isOverride
                      ? "Percentual configurado manualmente em Regras financeiras."
                      : "Divisão igual automática — sem percentual próprio configurado."
                  }
                  detail={
                    <DetailList
                      items={[
                        { label: "Distribuível", value: currencyFormatter.format(distribution.distributable) },
                        { label: `Percentual (${partner.isOverride ? "manual" : "automático"})`, value: `${partner.percentage.toFixed(1)}%` },
                        { label: partner.name, value: currencyFormatter.format(partner.amount) },
                      ]}
                      emptyLabel="Sem dado suficiente."
                    />
                  }
                >
                  <div className="flex flex-col gap-1 rounded-xl border border-border/60 bg-card/40 p-5 text-left">
                    <p className="text-sm font-medium">{partner.name}</p>
                    <p className="text-2xl font-semibold tabular-nums">{currencyFormatter.format(partner.amount)}</p>
                    <p className="text-xs text-muted-foreground">{partner.percentage.toFixed(1)}% do distribuível</p>
                  </div>
                </CardWithDetail>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

/** As duas seções (A Receber/A Pagar) coexistem na mesma URL agora — alternar uma NÃO pode
 *  resetar o filtro da outra, então o href de cada opção precisa preservar todo o resto da
 *  query string, só trocando a própria chave. */
function StatusToggle({ paramKey, status, otherParams }: { paramKey: "receivablesStatus" | "payablesStatus"; status: "pendentes" | "todas"; otherParams: URLSearchParams }) {
  const pendingParams = new URLSearchParams(otherParams);
  pendingParams.delete(paramKey);
  const todasParams = new URLSearchParams(otherParams);
  todasParams.set(paramKey, "todas");

  const pendingQuery = pendingParams.toString();
  const todasQuery = todasParams.toString();

  return (
    <div className="flex items-center gap-1 rounded-md border border-border/60 p-0.5 text-xs">
      <Link
        href={pendingQuery ? `/financeiro?${pendingQuery}` : "/financeiro"}
        className={cn("rounded px-2 py-1 transition-colors", status === "pendentes" ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:text-foreground")}
      >
        Pendentes
      </Link>
      <Link href={`/financeiro?${todasQuery}`} className={cn("rounded px-2 py-1 transition-colors", status === "todas" ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:text-foreground")}>
        Todas
      </Link>
    </div>
  );
}
