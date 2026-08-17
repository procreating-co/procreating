import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Handshake, PackageCheck, Target, TrendingUp, UserPlus, Wallet } from "lucide-react";
import { computeComercialMetrics, compareStrategies, computeRevenueByOwnerAndSource } from "@/lib/comercial/metrics";
import { computeOverallFunnel } from "@/lib/comercial/funnel";
import { resolvePeriod, isPeriodPreset, type PeriodPreset } from "@/lib/comercial/period";
import { listOpenLeads, listOpenLeadsForPipeline, listOpenLeadsPaginated, listPipelineStages, listProspectingLists, listStrategies, type LeadFilters } from "@/lib/comercial/queries";
import { listUsers } from "@/lib/admin/users/queries";
import { computeSimulationDefaults } from "@/lib/simulation/defaults";
import { getSession } from "@/lib/admin/auth";
import { canViewFinancials } from "@/lib/auth/permissions";
import { StatTile } from "@/components/dashboard/stat-tile";
import { PageHeader } from "@/components/dashboard/page-header";
import { PageTabs } from "@/components/dashboard/page-tabs";
import { SectionHeader } from "@/components/dashboard/section-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LeadsTable } from "@/components/comercial/leads-table";
import { LeadsPagination } from "@/components/comercial/leads-pagination";
import { PipelineBoard } from "@/components/comercial/pipeline-board";
import { StrategiesList } from "@/components/comercial/strategies-list";
import { CrmFilters } from "@/components/comercial/crm-filters";
import { ProspeccaoView } from "@/components/comercial/prospeccao-view";
import { ExecutionQueue } from "@/components/comercial/execution-queue";
import { computeExecutionQueue } from "@/lib/comercial/sequences";
import { GestureNav, type GestureTab } from "@/components/comercial/gesture-nav";
import { TabTransition } from "@/components/comercial/tab-transition";
import { SimulatorForm } from "@/components/marketing/simulator-form";
import { AnalyticsPeriodSelect } from "@/components/comercial/analytics-period-select";
import { FunnelChart } from "@/components/comercial/funnel-chart";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Comercial — Procreating",
  robots: { index: false, follow: false },
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const TABS = [
  { key: "overview", label: "Visão Geral" },
  { key: "crm", label: "CRM" },
  { key: "prospeccao", label: "Prospecção" },
  { key: "estrategias", label: "Estratégias" },
  { key: "planejamento", label: "Planejamento" },
];

/**
 * Comercial (Growth) — máquina única (não um conjunto de páginas, seção 1 do prompt de evolução
 * profunda). CRM (tabela) e Pipeline (Kanban) são a MESMA busca (`listOpenLeads`+
 * `listPipelineStages`+`listUsers`), só o componente de render muda — um `ViewToggle` dentro da
 * aba "CRM". Prospecção (motor de listas — CSV → dedup → lista → leads) é uma aba nova que
 * alimenta o CRM (clicar numa lista filtra o CRM por `?list=`, não abre uma página própria de
 * detalhe). Planejamento (era "Simuladores") é onde o planejador de crescimento mora — mesmo
 * princípio de "aglutinar", nada disso é uma rota própria. Navegação por gesto (`GestureNav`)
 * troca essas 5 abas com swipe de trackpad, sem quebrar scroll vertical nem o scroll horizontal
 * do Kanban.
 */
export default async function ComercialPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; view?: string; owner?: string; strategy?: string; list?: string; page?: string; period?: string }>;
}) {
  const { tab: tabParam, view: viewParam, owner: ownerParam, strategy: strategyParam, list: listParam, page: pageParam, period: periodParam } = await searchParams;
  const tab = tabParam ?? "overview";
  const view: "pipeline" | "lista" = viewParam === "lista" ? "lista" : "pipeline";
  const ownerId = ownerParam ?? "todos";
  const strategyId = strategyParam ?? "todos";
  const listId = listParam ?? "todos";
  const page = Math.max(1, Number(pageParam) || 1);

  let content: ReactNode;
  let wide = false;

  if (tab === "crm") {
    // Filtro DIRETO na query (não `.filter()` em memória) — obrigatório pra paginação/`truncated`
    // funcionarem certo, ver comentário em `listOpenLeadsPaginated` (lib/comercial/queries.ts).
    const filters: LeadFilters = {
      ownerId: ownerId !== "todos" ? ownerId : undefined,
      strategyId: strategyId !== "todos" ? strategyId : undefined,
      listId: listId !== "todos" ? listId : undefined,
    };
    const [stages, strategies, users, lists] = await Promise.all([listPipelineStages(), listStrategies(), listUsers(), listProspectingLists()]);
    wide = view === "pipeline";
    const filterBar = (
      <div className="flex flex-wrap items-center gap-2">
        <CrmFilters owners={users} strategies={strategies} lists={lists} ownerId={ownerId} strategyId={strategyId} listId={listId} />
        <ViewToggle view={view} ownerId={ownerId} strategyId={strategyId} listId={listId} />
      </div>
    );

    if (view === "pipeline") {
      const { leads, truncated } = await listOpenLeadsForPipeline(filters);
      content = (
        <div className="flex flex-col gap-4">
          <SectionHeader title="CRM" description='Arraste um card pra mudar de estágio. Soltar em "Fechado" abre o onboarding do cliente.' action={filterBar} />
          {truncated && (
            <p className="text-xs text-muted-foreground">Mostrando os 500 leads mais recentes deste filtro — use a Lista (paginada) pra ver todos.</p>
          )}
          <PipelineBoard leads={leads} stages={stages} users={users} />
        </div>
      );
    } else {
      const { leads, totalCount, pageSize } = await listOpenLeadsPaginated(filters, page);
      content = (
        <div className="flex flex-col gap-4">
          <SectionHeader title="CRM" description="Todos os leads em aberto — clique numa linha pra ver/editar o detalhe." action={filterBar} />
          <LeadsTable leads={leads} stages={stages} strategies={strategies} users={users} />
          <LeadsPagination page={page} pageSize={pageSize} totalCount={totalCount} ownerId={ownerId} strategyId={strategyId} listId={listId} />
        </div>
      );
    }
  } else if (tab === "prospeccao") {
    const [lists, strategies, openLeads] = await Promise.all([listProspectingLists(), listStrategies(), listOpenLeads()]);
    const queue = await computeExecutionQueue(openLeads);
    content = (
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <SectionHeader
            title="Fila de execução"
            description={queue.length > 0 ? `${queue.length} lead${queue.length === 1 ? "" : "s"} com ação pendente hoje.` : "Quem abordar hoje, com o script já pronto — configure a cadência na estratégia."}
          />
          <ExecutionQueue items={queue} />
        </div>
        <div className="flex flex-col gap-4">
          <SectionHeader title="Listas" description="Motor de listas — importe um CSV, o sistema deduplica e organiza em listas conectadas às estratégias." />
          <ProspeccaoView lists={lists} strategies={strategies} />
        </div>
      </div>
    );
  } else if (tab === "estrategias") {
    const strategies = await listStrategies();
    content = (
      <div className="flex flex-col gap-4">
        <SectionHeader title="Estratégias" description="Campanhas comerciais — público-alvo, oferta, canal e metas de prospecção." />
        <StrategiesList strategies={strategies} />
      </div>
    );
  } else if (tab === "planejamento") {
    const [defaults, session] = await Promise.all([computeSimulationDefaults(), getSession()]);
    const canView = session ? canViewFinancials(session.user.role) : false;
    content = (
      <div className="flex flex-col gap-4">
        <SectionHeader title="Planejamento" description="Quanto de lead, proposta e cliente é preciso pra bater uma meta de faturamento — três cenários lado a lado, recalculados a cada mudança." />
        <SimulatorForm defaults={defaults} canView={canView} />
      </div>
    );
  } else {
    const period = resolvePeriod(isPeriodPreset(periodParam) ? periodParam : "month");
    const [metrics, comparison, funnel, revenueBreakdown] = await Promise.all([
      computeComercialMetrics(period),
      compareStrategies(),
      computeOverallFunnel(period),
      computeRevenueByOwnerAndSource(),
    ]);
    content = (
      <>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatTile demo={false} label="Leads abertos" value={String(metrics.openLeads)} icon={<UserPlus className="size-4.5" />} tone="info" />
          <StatTile demo={false} label={`Novos (${period.label.toLowerCase()})`} value={String(metrics.newLeadsInPeriod)} icon={<Target className="size-4.5" />} tone="brand" />
          <StatTile demo={false} label="Em negociação" value={String(metrics.inNegotiation)} icon={<Handshake className="size-4.5" />} tone="warning" />
          <StatTile demo={false} label={`Fechados (${period.label.toLowerCase()})`} value={String(metrics.closedInPeriod)} icon={<PackageCheck className="size-4.5" />} tone="success" />
          <StatTile demo={false} label="Pipeline em aberto" value={currencyFormatter.format(metrics.pipelineValue)} icon={<Wallet className="size-4.5" />} tone="info" />
          <StatTile
            demo={false}
            label="Conversão lead → fechado"
            value={metrics.conversionRate != null ? `${(metrics.conversionRate * 100).toFixed(0)}%` : "—"}
            icon={<TrendingUp className="size-4.5" />}
            tone="success"
          />
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
                        <Link href={`/comercial/estrategias/${row.strategy.id}`} className="hover:underline">
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
                Dados insuficientes — menos da metade dos negócios fechados tem a origem (&quot;source&quot;) preenchida no cadastro do lead. Preencha esse
                campo ao criar/importar leads pra este quebra ficar confiável.
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
      </>
    );
  }

  // Mesma construção de href que `PageTabs` usa (primeira aba = URL limpa) — o gesto de swipe
  // precisa navegar exatamente pros mesmos lugares que clicar na aba levaria.
  const gestureTabs: GestureTab[] = TABS.map((t, index) => ({ key: t.key, href: index === 0 ? "/comercial" : `/comercial?tab=${t.key}` }));

  return (
    <main className={cn("mx-auto flex flex-col gap-6 px-6 pt-8 pb-16 lg:px-10", wide ? "max-w-[1600px]" : "max-w-[1400px]")}>
      <div className="flex flex-col gap-4">
        <PageHeader title="Comercial" description="Aquisição, prospecção, CRM e estratégias de crescimento." />
        <PageTabs tabs={TABS} activeKey={tab} />
      </div>
      <GestureNav tabs={gestureTabs} activeKey={tab}>
        <TabTransition key={tab}>{content}</TabTransition>
      </GestureNav>
    </main>
  );
}

function ViewToggle({ view, ownerId, strategyId, listId }: { view: "pipeline" | "lista"; ownerId: string; strategyId: string; listId: string }) {
  // Preserva owner/estratégia/lista ao trocar de view — hardcoded `?tab=crm` sem os outros params
  // faria o filtro sumir só de clicar em "Lista"/"Pipeline".
  const extra = new URLSearchParams();
  if (ownerId !== "todos") extra.set("owner", ownerId);
  if (strategyId !== "todos") extra.set("strategy", strategyId);
  if (listId !== "todos") extra.set("list", listId);
  const extraQuery = extra.toString() ? `&${extra.toString()}` : "";

  return (
    <div className="flex items-center gap-1 rounded-md border border-border/60 p-0.5 text-xs">
      <Link
        href={`/comercial?tab=crm${extraQuery}`}
        className={cn("rounded px-2 py-1 transition-colors", view === "pipeline" ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:text-foreground")}
      >
        Pipeline
      </Link>
      <Link
        href={`/comercial?tab=crm&view=lista${extraQuery}`}
        className={cn("rounded px-2 py-1 transition-colors", view === "lista" ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:text-foreground")}
      >
        Lista
      </Link>
    </div>
  );
}
