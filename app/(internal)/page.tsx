import { AlertTriangle, Banknote, EyeOff, Handshake, Repeat, TrendingUp, Users, Wallet } from "lucide-react";
import { computeExecutiveDashboard } from "@/lib/dashboard/executive-metrics";
import { getSession } from "@/lib/admin/auth";
import { canViewFinancials } from "@/lib/auth/permissions";
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
import type { MetricTone } from "@/lib/dashboard/metric-tone";
import { cn } from "@/lib/utils";
import type { DetailEntry } from "@/lib/dashboard/executive-metrics";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const percentFormatter = (value: number) => `${value.toFixed(1)}%`;

/**
 * Dashboard executivo — reescrito por completo (redesign shadcn/SalesOps/Linear/Stripe,
 * monocromático). Responde "como a empresa está", não é mais uma coleção de cards com dado
 * mock — tudo aqui vem de `computeExecutiveDashboard()` (`lib/dashboard/executive-metrics.ts`),
 * e o que não tem dado real suficiente mostra isso explicitamente ("Dados insuficientes"/"Ainda
 * não monitorado"), nunca um "0" inventado.
 *
 * Todo card é clicável (`CardWithDetail`) — abre um modal com a lista real por trás do número
 * (pedido explícito). Todo gráfico é clicável (`ChartExpandDialog`) — abre ampliado, com uma
 * tabela de apoio quando fizer sentido.
 *
 * Rótulos em português (revertido de uma fase anterior em inglês — ver `nav-config.ts`).
 */
/** RBAC — decisão de produto (não redireciona, mascara): papel sem `can_view_financials` continua
 *  vendo a Home inteira (contexto/layout preservado), só os NÚMEROS financeiros viram "R$ ••••" —
 *  cards, tabelas e o conteúdo dos modais de detalhe (`DetailList`). Gráficos que codificam valor
 *  visualmente (altura de barra/linha) não têm como ser "mascarados" ponto a ponto sem virar
 *  ilegível, então viram um placeholder no lugar do gráfico — mesma ideia, sem dado visual
 *  reconstruível. Contagens/percentuais (clientes ativos, conversão, churn, headcount) não são
 *  "dado financeiro" no sentido estrito já usado por `canViewFinancials` — continuam visíveis. */
const MASKED_CURRENCY = "R$ ••••";

function maskEntries(entries: DetailEntry[], canView: boolean): DetailEntry[] {
  if (canView) return entries;
  return entries.map((entry) => (entry.value ? { ...entry, value: MASKED_CURRENCY } : entry));
}

export default async function Home({ searchParams }: { searchParams: Promise<{ months?: string }> }) {
  const { months: monthsParam } = await searchParams;
  const cashFlowMonths = Number(monthsParam) || 6;
  const [metrics, session] = await Promise.all([computeExecutiveDashboard(cashFlowMonths), getSession()]);
  const canView = session ? canViewFinancials(session.user.role) : false;
  // Pedido explícito: sempre o valor completo (R$14.640), nunca abreviado (R$14,6 mil) —
  // `compactMoney` existia só pra isso e foi removido, não só desativado.
  const money = (value: number) => (canView ? currencyFormatter.format(value) : MASKED_CURRENCY);
  const d = metrics.details;

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-10 px-6 pt-8 pb-16 lg:px-10">
      <DashboardDateHeader goal={metrics.goal} canView={canView} />

      {/* Linha de KPIs — pedido explícito: "os blocos devem ser Receita, Receita Recorrente,
       *  Lucro Líquido, Salário". Pipeline/Fluxo de Caixa/Clientes Recorrentes/Projetos saíram
       *  desta linha especificamente (os cálculos continuam existindo e aparecem em outras
       *  seções da página, não foram apagados). */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {/* Pedido explícito — todo bloco no tamanho padrão: `MetricCard` cresce quando recebe
         *  `sparkline` (só Receita/Lucro Líquido tinham); os 4 ficam com a mesma forma simples
         *  agora (ícone + label + valor), nenhum cresce sozinho por ter um extra que os outros
         *  não têm. */}
        <CardWithDetail title="Receita" description="Receita deste mês — mesmo número do Financeiro." detail={<DetailList items={maskEntries(d.revenueEntries, canView)} emptyLabel="Nenhuma receita com vencimento este mês ainda." />}>
          <MetricCard
            icon={<TrendingUp className="size-3.5" />}
            label="Receita"
            value={money(metrics.kpis.revenue.value)}
            tone={metrics.kpis.revenue.deltaPct == null ? "info" : metrics.kpis.revenue.deltaPct >= 0 ? "success" : "danger"}
          />
        </CardWithDetail>
        <CardWithDetail
          title="Receita Recorrente"
          description="MRR — mesmo número do Financeiro."
          detail={<DetailList items={maskEntries(d.mrrEntries, canView)} emptyLabel="Nenhum contrato recorrente ativo ainda." />}
        >
          <MetricCard icon={<Repeat className="size-3.5" />} label="Receita Recorrente" value={money(metrics.kpis.recurringRevenue.value)} tone="brand" />
        </CardWithDetail>
        <CardWithDetail
          title="Lucro Líquido"
          description="Receita − despesas − custos, este mês."
          detail={
            <DetailList
              items={[
                { label: "Receita", value: money(metrics.financialHealth.revenue) },
                { label: "Despesas", value: `− ${money(metrics.financialHealth.expenses)}` },
                { label: "Lucro Líquido", value: money(metrics.financialHealth.netProfit) },
              ]}
              emptyLabel="Sem dado suficiente."
            />
          }
        >
          <MetricCard icon={<Wallet className="size-3.5" />} label="Lucro Líquido" value={money(metrics.kpis.netProfit.value)} tone={metrics.kpis.netProfit.value >= 0 ? "success" : "danger"} />
        </CardWithDetail>
        <CardWithDetail
          title="Pró-labore"
          description="Distribuível (receita − operacional) dividido por 2 — mesma conta do bloco Pró-labore no Financeiro."
          detail={
            <DetailList
              items={[
                { label: "Receita (mês)", value: money(metrics.financialHealth.revenue) },
                { label: "Por sócio (÷ 2)", value: money(metrics.kpis.partnerSalary.value) },
              ]}
              emptyLabel="Sem dado suficiente."
            />
          }
        >
          <MetricCard icon={<Banknote className="size-3.5" />} label="Pró-labore (cada sócio)" value={money(metrics.kpis.partnerSalary.value)} tone="success" />
        </CardWithDetail>
      </section>

      {/* Receita vs. Meta */}
      <ChartExpandDialog
        title="Receita vs. Meta"
        description="Faturado (área) vs. ritmo esperado (linha pontilhada) — dia a dia do mês corrente."
        expanded={
          !canView ? (
            <EmptyInline icon={EyeOff} label="Gráfico oculto — este número financeiro exige acesso." />
          ) : metrics.revenueVsTarget.goalAmount != null ? (
            <RevenueVsTargetChart points={metrics.revenueVsTarget.points} height={420} />
          ) : (
            <EmptyInline icon={TrendingUp} label="Meta não definida — configure em Configurações → Geral." />
          )
        }
      >
        <ChartCard
          title="Receita vs. Meta"
          description={
            metrics.revenueVsTarget.goalAmount != null
              ? `${money(metrics.kpis.revenue.value)} / ${money(metrics.revenueVsTarget.goalAmount)} — ${percentFormatter((metrics.kpis.revenue.value / metrics.revenueVsTarget.goalAmount) * 100)} da meta mensal`
              : undefined
          }
        >
          {!canView ? (
            <EmptyInline icon={EyeOff} label="Gráfico oculto — este número financeiro exige acesso." />
          ) : metrics.revenueVsTarget.goalAmount != null ? (
            <RevenueVsTargetChart points={metrics.revenueVsTarget.points} />
          ) : (
            <EmptyInline icon={TrendingUp} label="Meta não definida — configure em Configurações → Geral para ver este gráfico." />
          )}
        </ChartCard>
      </ChartExpandDialog>

      {/* Saúde Financeira */}
      <section className="flex flex-col gap-4">
        <SectionHeader title="Saúde Financeira" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <CardWithDetail title="Receita" description="Receita deste mês — mesmo número do Financeiro." detail={<DetailList items={maskEntries(d.revenueEntries, canView)} emptyLabel="Nenhuma receita com vencimento este mês ainda." />}>
            <FinancialBlock label="Receita" value={money(metrics.financialHealth.revenue)} />
          </CardWithDetail>
          <CardWithDetail title="Despesas" description="Despesas deste mês — mesmo número do Financeiro." detail={<DetailList items={maskEntries(d.expenseEntries, canView)} emptyLabel="Nenhuma despesa com vencimento este mês ainda." />}>
            <FinancialBlock label="Despesas" value={money(metrics.financialHealth.expenses)} />
          </CardWithDetail>
          <CardWithDetail
            title="Lucro Líquido"
            description="Receita − despesas − custos, este mês."
            detail={
              <DetailList
                items={[
                  { label: "Receita", value: money(metrics.financialHealth.revenue) },
                  { label: "Despesas", value: `− ${money(metrics.financialHealth.expenses)}` },
                  { label: "Lucro Líquido", value: money(metrics.financialHealth.netProfit) },
                ]}
                emptyLabel="Sem dado suficiente."
              />
            }
          >
            <FinancialBlock label="Lucro Líquido" value={money(metrics.financialHealth.netProfit)} tone={metrics.financialHealth.netProfit >= 0 ? "success" : "danger"} />
          </CardWithDetail>
          <CardWithDetail
            title="Fluxo de Caixa"
            description="Entradas − saídas deste mês."
            detail={
              <DetailList
                items={[
                  { label: "Entradas", value: money(metrics.financialHealth.revenue) },
                  { label: "Saídas", value: `− ${money(metrics.financialHealth.expenses)}` },
                ]}
                emptyLabel="Sem dado suficiente."
              />
            }
          >
            <FinancialBlock
              label="Fluxo de Caixa"
              value={`${metrics.financialHealth.cashFlow >= 0 ? "+" : ""}${money(metrics.financialHealth.cashFlow)}`}
              tone={metrics.financialHealth.cashFlow >= 0 ? "success" : "danger"}
            />
          </CardWithDetail>
        </div>
        <ChartExpandDialog
          title={`Fluxo de Caixa — Últimos ${cashFlowMonths} Meses`}
          expanded={
            <div className="flex flex-col gap-5">
              {canView ? <RevenueChart data={metrics.financialHealth.monthlyEvolution} height={360} /> : <EmptyInline icon={EyeOff} label="Gráfico oculto — este número financeiro exige acesso." />}
              <DataTable
                columns={[
                  { key: "month", header: "Mês", render: (row) => row.month },
                  { key: "revenue", header: "Receita", align: "right", render: (row) => money(row.revenue) },
                  { key: "expenses", header: "Despesas", align: "right", render: (row) => money(row.expenses) },
                  { key: "net", header: "Líquido", align: "right", render: (row) => money(row.revenue - row.expenses) },
                ]}
                rows={metrics.financialHealth.monthlyEvolution}
                getRowKey={(row) => row.month}
                emptyIcon={Wallet}
                emptyLabel="Sem dado suficiente."
              />
            </div>
          }
        >
          <ChartCard title={`Fluxo de Caixa — Últimos ${cashFlowMonths} Meses`} action={<PeriodSelect />}>
            {canView ? <RevenueChart data={metrics.financialHealth.monthlyEvolution} /> : <EmptyInline icon={EyeOff} label="Gráfico oculto — este número financeiro exige acesso." />}
          </ChartCard>
        </ChartExpandDialog>
      </section>

      {/* Funil de Vendas */}
      <section className="flex flex-col gap-4">
        <SectionHeader title="Funil de Vendas" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ChartExpandDialog
            title="Funil de Vendas"
            description="Valor de pipeline aberto por estágio."
            className="lg:col-span-2"
            expanded={
              metrics.salesPipeline.stages.some((stage) => stage.count > 0) ? (
                <div className="flex flex-col gap-5">
                  {canView ? <SalesPipelineChart stages={metrics.salesPipeline.stages} height={340} /> : <EmptyInline icon={EyeOff} label="Gráfico oculto — este número financeiro exige acesso." />}
                  <DataTable
                    columns={[
                      { key: "stage", header: "Estágio", render: (row) => row.label },
                      { key: "count", header: "Leads", align: "right", render: (row) => String(row.count) },
                      { key: "value", header: "Valor", align: "right", render: (row) => money(row.value) },
                    ]}
                    rows={metrics.salesPipeline.stages}
                    getRowKey={(row) => row.label}
                    emptyIcon={Handshake}
                    emptyLabel="Sem leads abertos."
                  />
                </div>
              ) : (
                <EmptyInline icon={Handshake} label="Nenhuma oportunidade ativa — crie um negócio pra começar a construir seu pipeline." />
              )
            }
          >
            <div className="rounded-xl border border-border/60 bg-card p-5">
              {metrics.salesPipeline.stages.some((stage) => stage.count > 0) ? (
                canView ? <SalesPipelineChart stages={metrics.salesPipeline.stages} /> : <EmptyInline icon={EyeOff} label="Gráfico oculto — este número financeiro exige acesso." />
              ) : (
                <EmptyInline icon={Handshake} label="Nenhuma oportunidade ativa — crie um negócio pra começar a construir seu pipeline." />
              )}
            </div>
          </ChartExpandDialog>
          <div className="flex flex-col gap-4">
            <CardWithDetail
              title="Conversão (Lead → Cliente)"
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
              <FinancialBlock
                label="Conversão (Lead → Cliente)"
                value={metrics.salesPipeline.conversionRate != null ? percentFormatter(metrics.salesPipeline.conversionRate * 100) : "Sem dados disponíveis"}
                tone={metrics.salesPipeline.conversionRate != null ? "success" : "neutral"}
              />
            </CardWithDetail>
            <CardWithDetail title="Ticket Médio" detail={<DetailList items={maskEntries(d.wonDeals, canView)} emptyLabel="Nenhum negócio fechado com valor registrado ainda." />}>
              <FinancialBlock label="Ticket Médio" value={metrics.salesPipeline.averageDeal != null ? money(metrics.salesPipeline.averageDeal) : "Sem dados disponíveis"} />
            </CardWithDetail>
            <CardWithDetail
              title="Pipeline Ponderado"
              description="Soma do pipeline aberto × probabilidade de cada estágio."
              detail={
                metrics.salesPipeline.weightedPipeline != null ? (
                  <DetailList items={maskEntries(d.openLeads, canView)} emptyLabel="Nenhum lead aberto." />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Ainda não existe probabilidade configurada pra todo estágio do pipeline — sem isso, o cálculo ponderado ficaria incompleto. Configure em Configurações → CRM quando essa tela existir.
                  </p>
                )
              }
            >
              <FinancialBlock
                label="Pipeline Ponderado"
                value={metrics.salesPipeline.weightedPipeline != null ? money(metrics.salesPipeline.weightedPipeline) : "Dados insuficientes"}
                tone={metrics.salesPipeline.weightedPipeline != null ? "info" : "neutral"}
              />
            </CardWithDetail>
          </div>
        </div>
      </section>

      {/* Saúde de Clientes */}
      <section className="flex flex-col gap-4">
        <SectionHeader title="Saúde de Clientes" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <CardWithDetail title="Clientes Ativos" detail={<DetailList items={d.activeClients} emptyLabel="Nenhum cliente ativo ainda." />}>
            <FinancialBlock label="Clientes Ativos" value={String(metrics.customerHealth.activeClients)} tone="success" />
          </CardWithDetail>
          <CardWithDetail title="Concentração de Receita" description="Top 5 clientes por receita de contrato ativo." detail={<DetailList items={maskEntries(d.topClients, canView)} emptyLabel="Sem contrato ativo suficiente." />}>
            <FinancialBlock label="Concentração de Receita (Top 5)" value={metrics.customerHealth.concentrationTop5Pct != null ? percentFormatter(metrics.customerHealth.concentrationTop5Pct) : "Sem dados disponíveis"} />
          </CardWithDetail>
          <CardWithDetail title="Churn (atual)" detail={<DetailList items={d.churnedClients} emptyLabel="Nenhum cliente em churn." />}>
            <FinancialBlock
              label="Churn (atual)"
              value={metrics.customerHealth.churnPct != null ? percentFormatter(metrics.customerHealth.churnPct) : "Sem dados disponíveis"}
              tone={metrics.customerHealth.churnPct == null ? "neutral" : metrics.customerHealth.churnPct > 0 ? "danger" : "success"}
            />
          </CardWithDetail>
          <CardWithDetail title="Valor Médio por Cliente" detail={<DetailList items={maskEntries(d.topClients, canView)} emptyLabel="Sem contrato ativo suficiente." />}>
            <FinancialBlock label="Valor Médio por Cliente" value={metrics.customerHealth.averageClientValue != null ? money(metrics.customerHealth.averageClientValue) : "Sem dados disponíveis"} />
          </CardWithDetail>
        </div>
      </section>

      {/* Operação + Equipe */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section className="flex flex-col gap-4">
          <SectionHeader title="Operação" />
          <div className="grid grid-cols-2 gap-4">
            <CardWithDetail title="Equipe" detail={<DetailList items={d.teamMembers} emptyLabel="Nenhum usuário cadastrado." />}>
              <FinancialBlock label="Equipe" value={String(metrics.operations.headcount)} />
            </CardWithDetail>
            <NotTrackedCard label="Capacidade" />
            <NotTrackedCard label="No Prazo" />
            <NotTrackedCard label="Projetos em Risco" />
          </div>
        </section>
        <section className="flex flex-col gap-4">
          <SectionHeader title="Equipe" />
          <div className="grid grid-cols-2 gap-4">
            <CardWithDetail title="Headcount" detail={<DetailList items={d.teamMembers} emptyLabel="Nenhum usuário cadastrado." />}>
              <FinancialBlock label="Headcount" value={String(metrics.team.headcount)} />
            </CardWithDetail>
            <NotTrackedCard label="Utilização" />
            <NotTrackedCard label="Sobrecarregados" />
            <NotTrackedCard label="Disponíveis" />
          </div>
        </section>
      </div>

      {/* Atenção Necessária */}
      <section className="flex flex-col gap-4">
        <SectionHeader title="Atenção Necessária" />
        {metrics.attention.length === 0 ? (
          <EmptyInline icon={AlertTriangle} label="Nada precisa de atenção agora." />
        ) : (
          <ul className="flex flex-col divide-y divide-border/60 rounded-xl border border-border/60 bg-card">
            {metrics.attention.map((item) => (
              <AttentionRow key={item.label} item={item} canView={canView} overdueRevenue={maskEntries(d.overdueRevenue, canView)} overdueExpenses={maskEntries(d.overdueExpenses, canView)} upcomingRevenue={maskEntries(d.upcomingRevenue, canView)} />
            ))}
          </ul>
        )}
      </section>

      {/* Pulso do Negócio */}
      {metrics.pulse.length > 0 && (
        <section className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-5">
          {/* Minimalismo — a nota de roadmap ("preparado pra virar IA no futuro") era dev-facing,
           *  não pertence a texto de produto; "gerado a partir dos números acima" é óbvio de
           *  onde essas frases vêm, uma seção antes na mesma tela. */}
          <SectionHeader title="Pulso do Negócio" />
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

const FINANCIAL_BLOCK_BORDER_CLASS: Record<MetricTone, string> = {
  brand: "border-l-brand",
  success: "border-l-success",
  warning: "border-l-warning",
  danger: "border-l-danger",
  info: "border-l-info",
  neutral: "border-l-transparent",
};

const FINANCIAL_BLOCK_TEXT_CLASS: Record<MetricTone, string> = {
  brand: "text-brand",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  info: "text-info",
  neutral: "",
};

/** `tone` (opcional) — borda esquerda + cor do valor pelo mesmo token semântico que
 *  `MetricCard`/`StatTile` usam (`lib/dashboard/metric-tone.ts`) — só nos blocos onde o número
 *  já tem um significado claro de bom/ruim/neutro (Lucro Líquido negativo, Churn > 0...), nunca
 *  decorativo. Sem `tone`, comportamento idêntico a antes (texto neutro). */
function FinancialBlock({ label, value, muted = false, tone = "neutral" }: { label: string; value: string; muted?: boolean; tone?: MetricTone }) {
  return (
    <div className={cn("flex h-full flex-col gap-1 rounded-xl border border-l-2 border-border/60 bg-card p-4", FINANCIAL_BLOCK_BORDER_CLASS[tone])}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn(muted ? "text-sm text-muted-foreground" : "text-xl font-semibold tabular-nums", !muted && FINANCIAL_BLOCK_TEXT_CLASS[tone])}>{value}</span>
    </div>
  );
}

/** Card pros números que ainda não têm dado nenhum por trás (capacidade/prazo/etc. — não existe
 *  tabela de projeto interno/alocação ainda). Clicável igual aos outros, só que o modal explica
 *  honestamente por que não tem número, em vez de fingir. */
function NotTrackedCard({ label }: { label: string }) {
  return (
    <CardWithDetail title={label} detail={<p className="text-sm text-muted-foreground">Ainda não existe uma tabela de projeto interno/alocação de equipe no sistema — esse número não pode ser calculado de dado real ainda. Fica de fora até essa parte do produto existir, em vez de mostrar um valor inventado.</p>}>
      <FinancialBlock label={label} value="Ainda não monitorado" muted />
    </CardWithDetail>
  );
}

function AttentionRow({
  item,
  overdueRevenue,
  overdueExpenses,
  upcomingRevenue,
  canView,
}: {
  item: { label: string; detail: string; tone: "danger" | "warning" | "success"; kind?: "overdue_revenue" | "overdue_expenses" | "upcoming_revenue" | "cash_flow" };
  overdueRevenue: DetailEntry[];
  overdueExpenses: DetailEntry[];
  upcomingRevenue: DetailEntry[];
  canView: boolean;
}) {
  const items =
    item.kind === "overdue_revenue" ? overdueRevenue : item.kind === "overdue_expenses" ? overdueExpenses : item.kind === "upcoming_revenue" ? upcomingRevenue : [];

  // Todo item de "Atenção Necessária" hoje é financeiro (overdue_revenue/overdue_expenses/
  // upcoming_revenue/cash_flow — ver lib/dashboard/executive-metrics.ts) — `item.detail` traz um
  // valor em R$ embutido na frase (ex.: "R$ 3.200,00 em aberto"), mascarado por inteiro aqui.
  const detail = canView ? item.detail : "Valor oculto para seu papel.";

  const content = (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">{item.label}</span>
        <span className="text-xs text-muted-foreground">{detail}</span>
      </div>
      <StatusBadge tone={item.tone} label={item.tone === "success" ? "OK" : item.tone === "danger" ? "Crítico" : "Atenção"} />
    </div>
  );

  if (items.length === 0) return <li>{content}</li>;

  return (
    <li>
      <CardWithDetail title={item.label} description={detail} detail={<DetailList items={items} emptyLabel="Nenhum item." />} className="rounded-none hover:-translate-y-0 hover:bg-foreground/[0.03]">
        {content}
      </CardWithDetail>
    </li>
  );
}
