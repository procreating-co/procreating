import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Handshake, PackageCheck, Target, TrendingUp, UserPlus, Wallet } from "lucide-react";
import { computeComercialMetrics, compareStrategies } from "@/lib/comercial/metrics";
import { listOpenLeads, listPipelineStages, listStrategies } from "@/lib/comercial/queries";
import { listUsers } from "@/lib/admin/users/queries";
import { computeSimulationDefaults } from "@/lib/simulation/defaults";
import { StatTile } from "@/components/dashboard/stat-tile";
import { PageHeader } from "@/components/dashboard/page-header";
import { PageTabs } from "@/components/dashboard/page-tabs";
import { SectionHeader } from "@/components/dashboard/section-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LeadsTable } from "@/components/comercial/leads-table";
import { PipelineBoard } from "@/components/comercial/pipeline-board";
import { StrategiesList } from "@/components/comercial/strategies-list";
import { SimulatorForm } from "@/components/marketing/simulator-form";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Comercial — Procreating",
  robots: { index: false, follow: false },
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const TABS = [
  { key: "overview", label: "Visão Geral" },
  { key: "crm", label: "CRM" },
  { key: "estrategias", label: "Estratégias" },
  { key: "simuladores", label: "Simuladores" },
];

/**
 * Comercial (Growth) — consolidado de 6 rotas pra 1 com abas internas (`PageTabs`). CRM (tabela)
 * e Pipeline (Kanban) eram a MESMA busca (`listOpenLeads`+`listPipelineStages`+`listUsers`), só o
 * componente de render mudava — viraram um `ViewToggle` dentro da mesma aba "CRM", não duas abas
 * pra cima do mesmo dado. Simuladores (calculadora autocontida, sem tabela própria) e Estratégias
 * (lista) migram pra cá também; a página de detalhe de estratégia continua com rota própria
 * (`/comercial/estrategias/[id]`) — é uma página de detalhe de verdade. Relatórios (`/reports`)
 * foi removido, não migrado — era um placeholder vazio desde sempre, zero funcionalidade real.
 */
export default async function ComercialPage({ searchParams }: { searchParams: Promise<{ tab?: string; view?: string }> }) {
  const { tab: tabParam, view: viewParam } = await searchParams;
  const tab = tabParam ?? "overview";
  const view: "pipeline" | "lista" = viewParam === "lista" ? "lista" : "pipeline";

  let content: ReactNode;
  let wide = false;

  if (tab === "crm") {
    const [leads, stages, strategies, users] = await Promise.all([listOpenLeads(), listPipelineStages(), listStrategies(), listUsers()]);
    wide = view === "pipeline";
    content = (
      <div className="flex flex-col gap-4">
        <SectionHeader
          title="CRM"
          description={view === "pipeline" ? 'Arraste um card pra mudar de estágio. Soltar em "Fechado" abre o onboarding do cliente.' : "Todos os leads em aberto — clique numa linha pra ver/editar o detalhe."}
          action={<ViewToggle view={view} />}
        />
        {view === "pipeline" ? <PipelineBoard leads={leads} stages={stages} users={users} /> : <LeadsTable leads={leads} stages={stages} strategies={strategies} users={users} />}
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
  } else if (tab === "simuladores") {
    const defaults = await computeSimulationDefaults();
    content = (
      <div className="flex flex-col gap-4">
        <SectionHeader title="Simulador" description="Quanto de lead, proposta e cliente é preciso pra bater uma meta de faturamento — três cenários lado a lado, recalculados a cada mudança." />
        <SimulatorForm defaults={defaults} />
      </div>
    );
  } else {
    const [metrics, comparison] = await Promise.all([computeComercialMetrics(), compareStrategies()]);
    content = (
      <>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatTile demo={false} label="Leads abertos" value={String(metrics.openLeads)} icon={<UserPlus className="size-4.5" />} />
          <StatTile demo={false} label="Novos este mês" value={String(metrics.newLeadsThisMonth)} icon={<Target className="size-4.5" />} />
          <StatTile demo={false} label="Em negociação" value={String(metrics.inNegotiation)} icon={<Handshake className="size-4.5" />} />
          <StatTile demo={false} label="Fechados este mês" value={String(metrics.closedThisMonth)} icon={<PackageCheck className="size-4.5" />} />
          <StatTile demo={false} label="Pipeline em aberto" value={currencyFormatter.format(metrics.pipelineValue)} icon={<Wallet className="size-4.5" />} />
          <StatTile
            demo={false}
            label="Conversão lead → fechado"
            value={metrics.conversionRate != null ? `${(metrics.conversionRate * 100).toFixed(0)}%` : "—"}
            icon={<TrendingUp className="size-4.5" />}
          />
        </div>

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
      </>
    );
  }

  return (
    <main className={cn("mx-auto flex flex-col gap-6 px-6 pt-8 pb-16 lg:px-10", wide ? "max-w-[1600px]" : "max-w-[1400px]")}>
      <div className="flex flex-col gap-4">
        <PageHeader title="Comercial" description="Aquisição, prospecção, CRM e estratégias de crescimento." />
        <PageTabs tabs={TABS} activeKey={tab} />
      </div>
      <div className="flex flex-col gap-8">{content}</div>
    </main>
  );
}

function ViewToggle({ view }: { view: "pipeline" | "lista" }) {
  return (
    <div className="flex items-center gap-1 rounded-md border border-border/60 p-0.5 text-xs">
      <Link href="/comercial?tab=crm" className={cn("rounded px-2 py-1 transition-colors", view === "pipeline" ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:text-foreground")}>
        Pipeline
      </Link>
      <Link
        href="/comercial?tab=crm&view=lista"
        className={cn("rounded px-2 py-1 transition-colors", view === "lista" ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:text-foreground")}
      >
        Lista
      </Link>
    </div>
  );
}
