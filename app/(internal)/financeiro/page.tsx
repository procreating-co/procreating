import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowDownCircle, ArrowRight, ArrowUpCircle, CalendarClock, Clock, DollarSign, LineChart, PiggyBank, Settings2, ShieldAlert, TrendingUp, Wallet } from "lucide-react";
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
import { EmptyInline } from "@/components/dashboard/empty-inline";
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

  // Faixa de atenção (Bloco 2) — junta atrasados de A Receber e A Pagar, dado que
  // `computeFinanceiroMetrics` já calcula (nenhuma query nova).
  const financialAttention: { label: string; amount: string; href: string }[] = [];
  if (metrics.receivablesOverdueEntries.length > 0) {
    const count = metrics.receivablesOverdueEntries.length;
    financialAttention.push({
      label: `${count} conta${count === 1 ? "" : "s"} a receber atrasada${count === 1 ? "" : "s"}`,
      amount: currencyFormatter.format(metrics.receivablesOverdue),
      href: "#a-receber",
    });
  }
  if (metrics.payablesOverdueEntries.length > 0) {
    const count = metrics.payablesOverdueEntries.length;
    financialAttention.push({
      label: `${count} conta${count === 1 ? "" : "s"} a pagar atrasada${count === 1 ? "" : "s"}`,
      amount: currencyFormatter.format(metrics.payablesOverdue),
      href: "#a-pagar",
    });
  }
  // Bloco 4 item 1 — contrato recorrente vencendo sem renovação automática, dentro de
  // CONTRACT_RENEWAL_ALERT_DAYS. Sem seção própria nesta página pra linkar — manda pra Clientes,
  // onde o contrato de fato é gerenciado.
  if (metrics.contractsExpiringEntries.length > 0) {
    const count = metrics.contractsExpiringEntries.length;
    financialAttention.push({
      label: `${count} contrato${count === 1 ? "" : "s"} recorrente${count === 1 ? "" : "s"} vencendo sem renovação automática`,
      amount: "",
      href: "/clientes",
    });
  }

  const receivablesOtherParams = new URLSearchParams();
  if (payablesStatusParam === "todas") receivablesOtherParams.set("payablesStatus", "todas");
  if (monthsParam) receivablesOtherParams.set("months", monthsParam);
  const payablesOtherParams = new URLSearchParams();
  if (receivablesStatusParam === "todas") payablesOtherParams.set("receivablesStatus", "todas");
  if (monthsParam) payablesOtherParams.set("months", monthsParam);

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-10 px-6 pt-8 pb-16 lg:px-10">
      <PageHeader title="Financeiro" />

      {/* Meta do mês inline (Bloco 4 item 2) — mesmo cálculo que já alimenta "Receita vs Meta" na
       *  Home, só que aqui é uma barra simples, não um gráfico dia-a-dia (pedido explícito:
       *  "inline"). Omitida quando ninguém definiu meta ainda, nunca "0%" inventado. */}
      {metrics.goal && (
        <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card/40 p-5">
          <div className="flex items-baseline justify-between gap-4 text-sm">
            <span className="text-muted-foreground">
              Meta do mês — {currencyFormatter.format(metrics.goal.realized)} de {currencyFormatter.format(metrics.goal.amount)}
            </span>
            <span className="font-medium tabular-nums">{metrics.goal.percentage.toFixed(0)}%</span>
          </div>
          <div className="relative h-2 overflow-hidden rounded-full bg-muted">
            <div className="absolute inset-y-0 left-0 rounded-full bg-brand transition-all" style={{ width: `${Math.min(100, Math.max(0, metrics.goal.percentage))}%` }} />
            {/* Marcador do ritmo esperado — "onde deveria estar hoje, no calendário" (mesmo dado
             *  de `expectedPacePercentage` que a Home já calcula). */}
            <div className="absolute inset-y-0 w-0.5 bg-foreground/40" style={{ left: `${Math.min(100, Math.max(0, metrics.goal.expectedPacePercentage))}%` }} />
          </div>
          <p className="text-xs text-muted-foreground">Ritmo esperado hoje: {metrics.goal.expectedPacePercentage.toFixed(0)}% do mês</p>
        </div>
      )}

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

        {/* Fluxo de caixa projetado (Bloco 3 do redesign) — 3 números, não um gráfico novo:
         *  receita pendente menos despesa pendente vencendo dentro de cada janela cumulativa
         *  (0-30/0-60/0-90 dias a partir de hoje). Tom por sinal — negativo é alerta de verdade
         *  (mais a pagar do que a receber nessa janela), não decorativo. */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <CardWithDetail
            title="Fluxo projetado — 30 dias"
            description="Receita pendente menos despesa pendente vencendo nos próximos 30 dias."
            detail={<DetailList items={metrics.projectedCashFlow30Entries} emptyLabel="Nada pendente vencendo nessa janela." />}
          >
            <StatTile
              demo={false}
              label="Fluxo projetado — 30 dias"
              value={currencyFormatter.format(metrics.projectedCashFlow30)}
              icon={<LineChart className="size-4.5" />}
              tone={metrics.projectedCashFlow30 >= 0 ? "success" : "danger"}
            />
          </CardWithDetail>
          <CardWithDetail
            title="Fluxo projetado — 60 dias"
            description="Receita pendente menos despesa pendente vencendo nos próximos 60 dias."
            detail={<DetailList items={metrics.projectedCashFlow60Entries} emptyLabel="Nada pendente vencendo nessa janela." />}
          >
            <StatTile
              demo={false}
              label="Fluxo projetado — 60 dias"
              value={currencyFormatter.format(metrics.projectedCashFlow60)}
              icon={<LineChart className="size-4.5" />}
              tone={metrics.projectedCashFlow60 >= 0 ? "success" : "danger"}
            />
          </CardWithDetail>
          <CardWithDetail
            title="Fluxo projetado — 90 dias"
            description="Receita pendente menos despesa pendente vencendo nos próximos 90 dias."
            detail={<DetailList items={metrics.projectedCashFlow90Entries} emptyLabel="Nada pendente vencendo nessa janela." />}
          >
            <StatTile
              demo={false}
              label="Fluxo projetado — 90 dias"
              value={currencyFormatter.format(metrics.projectedCashFlow90)}
              icon={<LineChart className="size-4.5" />}
              tone={metrics.projectedCashFlow90 >= 0 ? "success" : "danger"}
            />
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

        {/* Bloco 4 item 3 — receita sem contrato vinculado, anomalia de cadastro (não urgência
         *  como atraso, mas não pode sumir). Tom neutro de propósito — diferente do
         *  dashed-brand acima (oportunidade) e do vermelho da Faixa de atenção (urgente). */}
        {metrics.revenueWithoutContractEntries.length > 0 && (
          <CardWithDetail
            title="Receita sem contrato vinculado"
            description="Lançamento manual sem passar pelo onboarding, ou contrato removido depois — vale conferir."
            detail={<DetailList items={metrics.revenueWithoutContractEntries} emptyLabel="Nenhuma." />}
          >
            <div className="flex items-center justify-between gap-4 rounded-xl border border-dashed border-border bg-card/40 p-5 text-left">
              <span className="text-sm text-muted-foreground">
                {metrics.revenueWithoutContractEntries.length} lançamento{metrics.revenueWithoutContractEntries.length === 1 ? "" : "s"} de receita sem contrato vinculado
              </span>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
            </div>
          </CardWithDetail>
        )}
      </section>

      {/* Faixa de atenção (Bloco 2 do redesign) — mesmo padrão visual/componente de "Atenção
       *  agora" do Workspace (`app/(internal)/workspace/page.tsx`), reaproveitado, não duplicado
       *  num componente paralelo. Junta atrasados de A Receber e A Pagar num só lugar, clicável
       *  (rola pra seção correspondente), sem esperar o fim do mês pra alguém notar. */}
      <section className="flex flex-col gap-4">
        <SectionHeader title="Atenção agora" />
        {financialAttention.length === 0 ? (
          <EmptyInline icon={AlertTriangle} label="Nada precisa de atenção agora." />
        ) : (
          <ul className="flex flex-col divide-y divide-border/60 rounded-xl border border-border/60 bg-card">
            {financialAttention.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="flex items-center justify-between gap-3 px-5 py-3.5 text-sm transition-colors hover:bg-foreground/[0.03]">
                  <span>{item.label}</span>
                  <span className="flex items-center gap-2 shrink-0">
                    {item.amount && <span className="tabular-nums text-danger">{item.amount}</span>}
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
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
