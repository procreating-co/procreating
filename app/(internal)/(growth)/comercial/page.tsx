import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Handshake, PackageCheck, Target, TrendingUp, UserPlus, Wallet } from "lucide-react";
import { computeComercialMetrics, compareStrategies, computeRevenueByOwnerAndSource } from "@/lib/comercial/metrics";
import { computeOverallFunnel, computeStrategyFunnel } from "@/lib/comercial/funnel";
import { resolvePeriod, isPeriodPreset } from "@/lib/comercial/period";
import {
  getStrategy,
  listOpenLeads,
  listOpenLeadsForPipeline,
  listOpenLeadsPaginated,
  listPipelineStages,
  listProspectingLists,
  listStrategies,
  type LeadFilters,
} from "@/lib/comercial/queries";
import { listSequenceSteps } from "@/lib/comercial/sequences";
import { listUsers } from "@/lib/admin/users/queries";
import { computeSimulationDefaults } from "@/lib/simulation/defaults";
import { getSession } from "@/lib/admin/auth";
import { canViewFinancials } from "@/lib/auth/permissions";
import { StatTile } from "@/components/dashboard/stat-tile";
import { PageHeader } from "@/components/dashboard/page-header";
import { SectionHeader } from "@/components/dashboard/section-header";
import { CardWithDetail } from "@/components/dashboard/card-with-detail";
import { DetailList } from "@/components/dashboard/detail-list";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LeadsTable } from "@/components/comercial/leads-table";
import { LeadsPagination } from "@/components/comercial/leads-pagination";
import { PipelineBoard } from "@/components/comercial/pipeline-board";
import { CrmFilters } from "@/components/comercial/crm-filters";
import { ListsPanelSheet } from "@/components/comercial/lists-panel-sheet";
import { StrategiesPanelSheet } from "@/components/comercial/strategies-panel-sheet";
import { StrategyDetailDrawer, type StrategyDetailData } from "@/components/comercial/strategy-detail-drawer";
import { ExecutionQueue } from "@/components/comercial/execution-queue";
import { computeExecutionQueue } from "@/lib/comercial/sequences";
import { SimulatorForm } from "@/components/marketing/simulator-form";
import { AnalyticsPeriodSelect } from "@/components/comercial/analytics-period-select";
import { FunnelChart } from "@/components/comercial/funnel-chart";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Comercial — Procreating",
  robots: { index: false, follow: false },
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

/**
 * Comercial (Growth) — página única, pedido explícito ("CRM e etc numa única page"). Era 3 abas
 * (Visão Geral/CRM/Planejamento, ver `git log` — antes disso já tinha sido reduzido de 5 abas
 * pra 3, Prospecção/Estratégias viraram painéis dentro do CRM). Virou uma rolagem só, sem
 * `PageTabs`/`GestureNav`/`TabTransition` — mesmo padrão já aplicado em `/clientes` (página única,
 * sem abas). Visão Geral, CRM e Planejamento renderizam empilhados, sempre os 3 juntos; cada
 * seção mantém seus próprios filtros/paginação na URL (`?owner=`/`?strategy=`/`?list=`/`?view=`/
 * `?page=` pro CRM, `?period=` pra Visão Geral — nomes distintos, sem colisão entre seções).
 *
 * Links antigos não quebram: `?tab=`/`?panel=lists`/`?panel=strategies` continuam funcionando —
 * `?tab=prospeccao`/`?tab=estrategias` redirecionam pro painel certo (`ListsPanelSheet`/
 * `StrategiesPanelSheet`, que já abrem via `?panel=`, sem depender de aba nenhuma). Qualquer outro
 * `?tab=` é só ignorado agora (não existe mais o que aba nenhuma selecionar).
 * `/comercial/estrategias/[id]` continua um `redirect()` pra `?strategyDetail=<id>` (drawer).
 */
export default async function ComercialPage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    panel?: string;
    view?: string;
    owner?: string;
    strategy?: string;
    list?: string;
    page?: string;
    period?: string;
    strategyDetail?: string;
  }>;
}) {
  const { tab: tabParam, view: viewParam, owner: ownerParam, strategy: strategyParam, list: listParam, page: pageParam, period: periodParam, strategyDetail: strategyDetailParam } =
    await searchParams;

  // `?tab=prospeccao`/`?tab=estrategias` eram páginas/abas inteiras — viraram painel. Redirect de
  // verdade (não só alias silencioso) pra injetar `?panel=` na URL canônica, que é o que os dois
  // `Sheet` leem via `useSearchParams()` pra abrir sozinhos.
  if (tabParam === "prospeccao" || tabParam === "estrategias") {
    redirect(`/comercial?panel=${tabParam === "prospeccao" ? "lists" : "strategies"}`);
  }

  const view: "pipeline" | "lista" = viewParam === "lista" ? "lista" : "pipeline";
  const ownerId = ownerParam ?? "todos";
  const strategyId = strategyParam ?? "todos";
  const listId = listParam ?? "todos";
  const page = Math.max(1, Number(pageParam) || 1);
  const period = resolvePeriod(isPeriodPreset(periodParam) ? periodParam : "month");

  // Filtro DIRETO na query (não `.filter()` em memória) — obrigatório pra paginação/`truncated`
  // funcionarem certo, ver comentário em `listOpenLeadsPaginated` (lib/comercial/queries.ts).
  const filters: LeadFilters = {
    ownerId: ownerId !== "todos" ? ownerId : undefined,
    strategyId: strategyId !== "todos" ? strategyId : undefined,
    listId: listId !== "todos" ? listId : undefined,
  };

  const [stages, strategies, users, lists, openLeads, metrics, comparison, funnel, revenueBreakdown, simDefaults, session] = await Promise.all([
    listPipelineStages(),
    listStrategies(),
    listUsers(),
    listProspectingLists(),
    listOpenLeads(),
    computeComercialMetrics(period),
    compareStrategies(),
    computeOverallFunnel(period),
    computeRevenueByOwnerAndSource(),
    computeSimulationDefaults(),
    getSession(),
  ]);
  const canView = session ? canViewFinancials(session.user.role) : false;
  const queue = await computeExecutionQueue(openLeads);

  let pipelineOrList;
  if (view === "pipeline") {
    const { leads, truncated } = await listOpenLeadsForPipeline(filters);
    pipelineOrList = (
      <>
        {truncated && <p className="text-xs text-muted-foreground">Mostrando os 500 leads mais recentes deste filtro — use a Lista (paginada) pra ver todos.</p>}
        <PipelineBoard leads={leads} stages={stages} users={users} />
      </>
    );
  } else {
    const { leads, totalCount, pageSize } = await listOpenLeadsPaginated(filters, page);
    pipelineOrList = (
      <>
        <LeadsTable leads={leads} stages={stages} strategies={strategies} users={users} />
        <LeadsPagination page={page} pageSize={pageSize} totalCount={totalCount} ownerId={ownerId} strategyId={strategyId} listId={listId} />
      </>
    );
  }

  const filterBar = (
    <div className="flex flex-wrap items-center gap-2">
      <CrmFilters owners={users} strategies={strategies} lists={lists} ownerId={ownerId} strategyId={strategyId} listId={listId} />
      <ViewToggle view={view} ownerId={ownerId} strategyId={strategyId} listId={listId} />
      <div className="ml-auto flex items-center gap-2">
        <ListsPanelSheet lists={lists} strategies={strategies} />
        <StrategiesPanelSheet strategies={strategies} />
      </div>
    </div>
  );

  // §2/§4/§20 passo 5 — `?strategyDetail=<id>` abre o drawer de detalhe por cima da página.
  let strategyDetailData: StrategyDetailData | null = null;
  if (strategyDetailParam) {
    const [strategy, strategyFunnel, sequenceSteps] = await Promise.all([
      getStrategy(strategyDetailParam),
      computeStrategyFunnel(strategyDetailParam),
      listSequenceSteps(strategyDetailParam),
    ]);
    if (strategy) strategyDetailData = { strategy, funnel: strategyFunnel, sequenceSteps };
  }

  return (
    <main className="mx-auto flex max-w-[1600px] flex-col gap-10 px-6 pt-8 pb-16 lg:px-10">
      <PageHeader title="Comercial" description="Aquisição, prospecção, CRM e estratégias de crescimento." />

      {/* VISÃO GERAL */}
      <div className="flex flex-col gap-6">
        <SectionHeader title="Visão Geral" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <CardWithDetail title="Leads abertos" detail={<DetailList items={metrics.openLeadsEntries} emptyLabel="Nenhum lead aberto no momento." />}>
            <StatTile demo={false} label="Leads abertos" value={String(metrics.openLeads)} icon={<UserPlus className="size-4.5" />} tone="info" />
          </CardWithDetail>
          <CardWithDetail title={`Novos (${period.label.toLowerCase()})`} detail={<DetailList items={metrics.newLeadsEntries} emptyLabel="Nenhum lead novo neste período." />}>
            <StatTile demo={false} label={`Novos (${period.label.toLowerCase()})`} value={String(metrics.newLeadsInPeriod)} icon={<Target className="size-4.5" />} tone="brand" />
          </CardWithDetail>
          <CardWithDetail title="Em negociação" detail={<DetailList items={metrics.inNegotiationEntries} emptyLabel="Nenhum lead em negociação." />}>
            <StatTile demo={false} label="Em negociação" value={String(metrics.inNegotiation)} icon={<Handshake className="size-4.5" />} tone="warning" />
          </CardWithDetail>
          <CardWithDetail title={`Fechados (${period.label.toLowerCase()})`} detail={<DetailList items={metrics.closedInPeriodEntries} emptyLabel="Nenhum negócio fechado neste período." />}>
            <StatTile demo={false} label={`Fechados (${period.label.toLowerCase()})`} value={String(metrics.closedInPeriod)} icon={<PackageCheck className="size-4.5" />} tone="success" />
          </CardWithDetail>
          <CardWithDetail
            title="Pipeline em aberto"
            description="Mesmos leads abertos — soma do valor potencial em vez da contagem."
            detail={<DetailList items={metrics.openLeadsEntries} emptyLabel="Nenhum lead aberto no momento." />}
          >
            <StatTile demo={false} label="Pipeline em aberto" value={currencyFormatter.format(metrics.pipelineValue)} icon={<Wallet className="size-4.5" />} tone="info" />
          </CardWithDetail>
          <CardWithDetail
            title="Conversão lead → fechado"
            description="Dos leads criados neste período, quantos já fecharam."
            detail={<DetailList items={metrics.conversionBreakdown} emptyLabel="Sem leads criados neste período." />}
          >
            <StatTile
              demo={false}
              label="Conversão lead → fechado"
              value={metrics.conversionRate != null ? `${(metrics.conversionRate * 100).toFixed(0)}%` : "—"}
              icon={<TrendingUp className="size-4.5" />}
              tone="success"
            />
          </CardWithDetail>
        </div>

        <section className="flex flex-col gap-4">
          <SectionHeader
            title="Funil de conversão"
            description={`${funnel.totalLeads} lead${funnel.totalLeads === 1 ? "" : "s"} criado${funnel.totalLeads === 1 ? "" : "s"} no período — taxa de conversão real por estágio.`}
            action={<AnalyticsPeriodSelect current={isPeriodPreset(periodParam) ? periodParam : "month"} />}
          />
          <FunnelChart steps={funnel.steps} />
        </section>

        <section className="flex flex-col gap-4">
          <SectionHeader title="Comparação entre estratégias" />
          {comparison.length === 0 ? (
            <div className="rounded-xl border border-border/60 bg-card/20 px-6 py-16 text-center text-muted-foreground">Nenhuma estratégia cadastrada ainda.</div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead>Estratégia</TableHead>
                    <TableHead>Leads</TableHead>
                    <TableHead>Fechados</TableHead>
                    <TableHead>Ticket médio</TableHead>
                    <TableHead>Receita total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparison.map((row) => (
                    <TableRow key={row.strategy.id} className="border-border/60">
                      <TableCell className="font-medium">
                        <Link href={`/comercial?strategyDetail=${row.strategy.id}`} className="hover:underline">
                          {row.strategy.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{row.totalLeads}</TableCell>
                      <TableCell className="text-muted-foreground">{row.wonLeads}</TableCell>
                      <TableCell className="text-muted-foreground">{row.averageTicket != null ? currencyFormatter.format(row.averageTicket) : "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{currencyFormatter.format(row.totalRevenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <section className="flex flex-col gap-4">
            <SectionHeader title="Receita por responsável" />
            {revenueBreakdown.byOwner.length === 0 ? (
              <div className="rounded-xl border border-border/60 bg-card/20 px-6 py-16 text-center text-muted-foreground">Nenhum negócio fechado ainda.</div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border/60">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/60 hover:bg-transparent">
                      <TableHead>Responsável</TableHead>
                      <TableHead>Fechados</TableHead>
                      <TableHead>Receita total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revenueBreakdown.byOwner.map((row) => (
                      <TableRow key={row.ownerId ?? "sem-responsavel"} className="border-border/60">
                        <TableCell className="font-medium">{row.ownerName}</TableCell>
                        <TableCell className="text-muted-foreground">{row.wonLeads}</TableCell>
                        <TableCell className="text-muted-foreground">{currencyFormatter.format(row.totalRevenue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </section>

          <section className="flex flex-col gap-4">
            <SectionHeader title="Receita por origem" />
            {!revenueBreakdown.bySource.fromRealData ? (
              <div className="rounded-xl border border-border/60 bg-card/20 px-6 py-16 text-center text-muted-foreground">
                Dados insuficientes — menos da metade dos negócios fechados tem a origem (&quot;source&quot;) preenchida no cadastro do lead. Preencha esse campo ao
                criar/importar leads pra este quebra ficar confiável.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border/60">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/60 hover:bg-transparent">
                      <TableHead>Origem</TableHead>
                      <TableHead>Fechados</TableHead>
                      <TableHead>Receita total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revenueBreakdown.bySource.rows.map((row) => (
                      <TableRow key={row.source} className="border-border/60">
                        <TableCell className="font-medium">{row.source}</TableCell>
                        <TableCell className="text-muted-foreground">{row.wonLeads}</TableCell>
                        <TableCell className="text-muted-foreground">{currencyFormatter.format(row.totalRevenue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* CRM */}
      <div className="flex flex-col gap-4">
        <SectionHeader title="Fila de execução" description={queue.length > 0 ? `${queue.length} lead${queue.length === 1 ? "" : "s"} com ação pendente hoje.` : undefined} />
        <ExecutionQueue items={queue} />
      </div>
      <div className="flex flex-col gap-4">
        <SectionHeader title="CRM" action={filterBar} />
        {pipelineOrList}
      </div>

      {/* PLANEJAMENTO */}
      <div className="flex flex-col gap-4">
        <SectionHeader title="Planejamento" description="Cenários de meta de faturamento, recalculados ao digitar — sem botão de calcular." />
        <SimulatorForm defaults={simDefaults} canView={canView} />
      </div>

      <StrategyDetailDrawer data={strategyDetailData} />
    </main>
  );
}

function ViewToggle({ view, ownerId, strategyId, listId }: { view: "pipeline" | "lista"; ownerId: string; strategyId: string; listId: string }) {
  const extra = new URLSearchParams();
  if (ownerId !== "todos") extra.set("owner", ownerId);
  if (strategyId !== "todos") extra.set("strategy", strategyId);
  if (listId !== "todos") extra.set("list", listId);
  const base = extra.toString();

  return (
    <div className="flex items-center gap-1 rounded-md border border-border/60 p-0.5 text-xs">
      <Link
        href={base ? `/comercial?${base}` : "/comercial"}
        className={cn("rounded px-2 py-1 transition-colors", view === "pipeline" ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:text-foreground")}
      >
        Pipeline
      </Link>
      <Link
        href={`/comercial?${base ? `${base}&` : ""}view=lista`}
        className={cn("rounded px-2 py-1 transition-colors", view === "lista" ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:text-foreground")}
      >
        Lista
      </Link>
    </div>
  );
}
