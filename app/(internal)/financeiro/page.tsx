import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDownCircle, ArrowUpCircle, Clock, DollarSign, PiggyBank, Settings2, ShieldAlert, TrendingUp } from "lucide-react";
import { computeFinanceiroMetrics } from "@/lib/financeiro/queries";
import { computeDistribution } from "@/lib/financeiro/rules";
import { requireFinancialPageAccess } from "@/lib/auth/permissions";
import { maskAmount, maskCurrencyText } from "@/lib/financeiro/mask";
import { StatTile } from "@/components/dashboard/stat-tile";
import { Button } from "@/components/ui/button";
import { RevenueChart } from "@/components/financeiro/revenue-chart";
import { RevenueExpectedList } from "@/components/financeiro/revenue-expected-list";
import { PageHeader } from "@/components/dashboard/page-header";
import { PeriodSelect } from "@/components/dashboard/period-select";
import { EmptyState } from "@/components/dashboard/empty-state";
import { CardWithDetail } from "@/components/dashboard/card-with-detail";
import { ChartExpandDialog } from "@/components/dashboard/chart-expand-dialog";
import { ChartCard } from "@/components/dashboard/chart-card";
import { DetailList } from "@/components/dashboard/detail-list";
import { ExpensesQuickAdd } from "@/components/financeiro/expenses-quick-add";
import { EvolutionDetail } from "@/components/financeiro/evolution-detail";
import type { FinancialDetailEntry } from "@/lib/financeiro/types";

export const metadata: Metadata = {
  title: "Financeiro — Procreating",
  robots: { index: false, follow: false },
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

/** `dev_tester` (leitura mascarada, `requireFinancialPageAccess`) — mesmo padrão já usado na
 *  Home: todo R$ vira o valor real × 3 (`maskCurrencyText`, pedido explícito — antes virava
 *  "R$ ••••"), contagens/percentuais continuam visíveis e intocadas. */
function maskEntries(entries: FinancialDetailEntry[], canView: boolean): FinancialDetailEntry[] {
  if (canView) return entries;
  return entries.map((entry) => (entry.value ? { ...entry, value: maskCurrencyText(entry.value, true) } : entry));
}

/**
 * Financeiro — pedido explícito: tudo abaixo do gráfico de Evolução saiu (Atenção agora, A
 * Receber, A Pagar, Custos, Distribuição, e os 3 cards de anomalia que ficavam entre o gráfico e
 * essas seções — Pipeline em negociação, Receita sem contrato vinculado, Possível despesa
 * duplicada). A página agora é só: Meta do mês → KPIs → Evolução.
 *
 * "Receita Recorrente Mensal" virou "Receita Esperada" (pedido explícito) — deixou de ser só
 * contratos recorrentes (`mrrEntries`) e virou todo lançamento de `revenue` com vencimento este
 * mês, recorrente OU projeto pontual, com o clique de marcar pago direto na linha
 * (`RevenueExpectedList`). Só depois desse clique o valor entra em "Receita do Mês" — mudança de
 * significado que também vale pra Meta do mês (Home), assistente de IA e Pró-labore, todos
 * consumidores do mesmo `revenueThisMonth` (decisão confirmada explicitamente, ver
 * `lib/financeiro/queries.ts`).
 */
export default async function FinanceiroPage({ searchParams }: { searchParams: Promise<{ months?: string }> }) {
  // RBAC — owner/admin/finance véem tudo; dev_tester entra com valores mascarados
  // (`requireFinancialPageAccess`, diferente do gate de escrita que as Server Actions usam);
  // qualquer outro papel continua bloqueado.
  const access = await requireFinancialPageAccess();
  if (!access.ok) {
    return (
      <main className="mx-auto flex max-w-[1400px] flex-col px-6 pt-8 pb-16 lg:px-10">
        <EmptyState icon={ShieldAlert} title="Sem acesso" description={access.error} />
      </main>
    );
  }
  const canView = !access.masked;
  const money = (value: number) => currencyFormatter.format(maskAmount(value, !canView));

  const { months: monthsParam } = await searchParams;
  const months = Number(monthsParam) || 6;

  const metrics = await computeFinanceiroMetrics(months);
  // Mesma regra 20/80 já usada na Distribuição (agora fora da página) — ainda alimenta Caixa
  // Operacional/Pró-labore aqui em cima.
  const distribution = await computeDistribution(metrics.revenueThisMonth);
  const partnerSalaryEach = distribution.distributable / 2;

  // Evolução (gráfico) — mesma regra do resto da página: `dev_tester` (`!canView` aqui só
  // acontece pra ele, `access.ok=false` já barrou qualquer outro papel acima) vê os pontos × 3.
  const monthlyEvolutionForView = canView
    ? metrics.monthlyEvolution
    : metrics.monthlyEvolution.map((point) => ({
        ...point,
        revenue: maskAmount(point.revenue, true),
        expenses: maskAmount(point.expenses, true),
        revenueByClient: point.revenueByClient.map((entry) => ({ ...entry, amount: maskAmount(entry.amount, true) })),
      }));

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-10 px-6 pt-8 pb-16 lg:px-10">
      <PageHeader title="Financeiro" />

      {/* Meta do mês inline — mesmo cálculo que já alimenta "Receita vs Meta" na Home, só que aqui
       *  é uma barra simples. Omitida quando ninguém definiu meta ainda, nunca "0%" inventado. */}
      {metrics.goal && (
        <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card/40 p-5">
          <div className="flex items-baseline justify-between gap-4 text-sm">
            <span className="text-muted-foreground">
              Meta do mês — {money(metrics.goal.realized)} de {money(metrics.goal.amount)}
            </span>
            <span className="font-medium tabular-nums">{metrics.goal.percentage.toFixed(0)}%</span>
          </div>
          <div className="relative h-2 overflow-hidden rounded-full bg-muted">
            <div className="absolute inset-y-0 left-0 rounded-full bg-brand transition-all" style={{ width: `${Math.min(100, Math.max(0, metrics.goal.percentage))}%` }} />
            <div className="absolute inset-y-0 w-0.5 bg-foreground/40" style={{ left: `${Math.min(100, Math.max(0, metrics.goal.expectedPacePercentage))}%` }} />
          </div>
          <p className="text-xs text-muted-foreground">Ritmo esperado hoje: {metrics.goal.expectedPacePercentage.toFixed(0)}% do mês</p>
        </div>
      )}

      {/* KPIs + Evolução — todo bloco é clicável (`CardWithDetail`), abre a lista real das
       *  entradas por trás do número, mesmo padrão já usado no Dashboard. */}
      <section className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <CardWithDetail
            title="Receita do Mês"
            description="Só o que já foi marcado como pago — veja 'Receita Esperada' pra tudo que ainda vence este mês."
            detail={<DetailList items={maskEntries(metrics.revenueThisMonthEntries, canView)} emptyLabel="Nenhuma receita com vencimento este mês." />}
          >
            <StatTile demo={false} label="Receita do Mês" value={money(metrics.revenueThisMonth)} icon={<ArrowUpCircle className="size-4.5" />} tone="success" />
          </CardWithDetail>
          <CardWithDetail
            title="Receita Esperada"
            description="Tudo que vence este mês, recorrente ou projeto — clique no status pra marcar como pago."
            detail={<RevenueExpectedList entries={metrics.revenueExpectedEntries} canView={canView} />}
          >
            <StatTile demo={false} label="Receita Esperada" value={money(metrics.revenueExpectedThisMonth)} icon={<TrendingUp className="size-4.5" />} tone="brand" />
          </CardWithDetail>
          <CardWithDetail
            title="Pró-labore"
            description="Distribuível (receita − operacional) dividido por 2 — divisão fixa."
            detail={
              <DetailList
                items={[
                  { label: `Distribuível (${100 - distribution.operationalPercentage}%)`, value: money(distribution.distributable) },
                  { label: "Por sócio (÷ 2)", value: money(partnerSalaryEach) },
                ]}
                emptyLabel="Sem dado suficiente."
              />
            }
          >
            <StatTile demo={false} label="Pró-labore (cada sócio)" value={money(partnerSalaryEach)} icon={<DollarSign className="size-4.5" />} tone="success" />
          </CardWithDetail>
          <CardWithDetail
            title="Caixa Operacional"
            description={`${distribution.operationalPercentage}% da receita bruta deste mês.`}
            detail={
              <div className="flex flex-col gap-3">
                <DetailList
                  items={[
                    { label: "Receita bruta (mês)", value: money(distribution.revenue) },
                    { label: `Operacional (${distribution.operationalPercentage}%)`, value: money(distribution.operationalAmount) },
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
            <StatTile demo={false} label="Caixa Operacional" value={money(distribution.operationalAmount)} icon={<PiggyBank className="size-4.5" />} tone="info" />
          </CardWithDetail>
          <CardWithDetail
            title="Despesas"
            detail={<ExpensesQuickAdd entries={maskEntries(metrics.expensesThisMonthEntries, canView)} emptyLabel="Nenhuma despesa com vencimento este mês." canAdd={canView} />}
          >
            <StatTile demo={false} label="Despesas" value={money(metrics.expensesThisMonth)} icon={<ArrowDownCircle className="size-4.5" />} tone="info" />
          </CardWithDetail>
          <CardWithDetail
            title={`A receber (em ${metrics.receivablesRecurringYear})`}
            description="Por cliente recorrente — quanto ele ainda vai pagar até o fim do ano."
            detail={<DetailList items={maskEntries(metrics.receivablesRecurringEntries, canView)} emptyLabel="Nada pendente de cliente recorrente até o fim do ano." />}
          >
            <StatTile
              demo={false}
              label={`A receber (em ${metrics.receivablesRecurringYear})`}
              value={money(metrics.receivablesRecurringThroughNextYear)}
              icon={<Clock className="size-4.5" />}
              tone="warning"
            />
          </CardWithDetail>
        </div>

        <ChartExpandDialog
          title={`Evolução (últimos ${months} meses)`}
          description="Clique num mês na tabela pra ver de onde saiu o faturamento — quais clientes, quanto cada um."
          expanded={<EvolutionDetail data={monthlyEvolutionForView} />}
        >
          <ChartCard title={`Evolução (últimos ${months} meses)`} action={<PeriodSelect />}>
            <RevenueChart data={monthlyEvolutionForView} />
          </ChartCard>
        </ChartExpandDialog>
      </section>
    </main>
  );
}
