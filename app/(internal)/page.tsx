import Link from "next/link";
import { Handshake, PackageCheck, TrendingUp, UserPlus, Users, Wallet } from "lucide-react";
import { GreetingHeader } from "@/components/dashboard/greeting-header";
import { StatTile } from "@/components/dashboard/stat-tile";
import { StatusDot } from "@/components/dashboard/status-dot";
import { SectionCard } from "@/components/dashboard/section-card";
import { DASHBOARD_SECTIONS } from "@/components/dashboard/nav-config";
import { computeComercialMetrics } from "@/lib/comercial/metrics";
import { computeFinanceiroMetrics } from "@/lib/financeiro/queries";
import { listClients, listPendingOnboardingTasks } from "@/lib/clientes/queries";
import {
  DEMO_DELIVERIES,
  DEMO_PROJECTS,
  DEMO_TEAM,
  getClient,
  getProject,
} from "@/lib/dashboard/demo-data";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/**
 * "Resumo operacional" (Projetos recentes/Próximas entregas/Equipe ativa) continua lendo
 * `lib/dashboard/demo-data.ts` — Operação ainda não foi migrada pra dado real (Fase 7 do
 * roadmap, fora do escopo desta rodada, que foi Comercial/Onboarding/Financeiro). Por isso
 * continua com a etiqueta "Demo" visível, sem fingir ser número real.
 */
const PENDING_DELIVERIES = DEMO_DELIVERIES.filter((delivery) => delivery.tone === "pending");

/**
 * Home da plataforma interna — dashboard principal, não mais landing page. Independente de
 * `/clients/<slug>` (entregas de cliente) e de `/admin` (painel legado); ver
 * `components/dashboard/` para o chrome e `nav-config.ts` pra onde cada seção leva. Protegida
 * por sessão real desde a Fase 1 (Foundation) — o gate e o `<DashboardLayout>` vêm de
 * `app/(internal)/layout.tsx`, não daqui.
 *
 * Fase 2-5 (Comercial/Onboarding/Financeiro): os tiles de "Resumo geral" pararam de ser mock —
 * vêm de `lib/comercial/metrics.ts` + `lib/financeiro/queries.ts` + `lib/clientes/queries.ts`.
 */
export default async function Home() {
  const [comercial, financeiro, clients, pendingTasks] = await Promise.all([
    computeComercialMetrics(),
    computeFinanceiroMetrics(),
    listClients(),
    listPendingOnboardingTasks(),
  ]);
  const activeClients = clients.filter((client) => client.status === "ativo").length;

  const statTiles = [
    { key: "receita-mes", label: "Receita este mês", value: currencyFormatter.format(financeiro.revenueThisMonth), icon: TrendingUp },
    { key: "pipeline-aberto", label: "Pipeline em aberto", value: currencyFormatter.format(comercial.pipelineValue), icon: Handshake },
    { key: "novos-leads", label: "Novos leads no mês", value: String(comercial.newLeadsThisMonth), icon: UserPlus },
    { key: "clientes-ativos", label: "Clientes ativos", value: String(activeClients), icon: Users },
    { key: "fechados-mes", label: "Negócios fechados no mês", value: String(comercial.closedThisMonth), icon: PackageCheck },
    { key: "mrr", label: "Receita recorrente (MRR)", value: currencyFormatter.format(financeiro.mrr), icon: Wallet },
  ];

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-10 px-6 py-16 lg:px-10">
      <GreetingHeader />

      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Resumo geral</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {statTiles.map((stat, index) => {
            const Icon = stat.icon;
            return <StatTile key={stat.key} demo={false} label={stat.label} value={stat.value} icon={<Icon className="size-4.5" />} delay={index * 0.05} />;
          })}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Resumo operacional</h2>
          <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
            Demo
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card/40 p-5">
            <h3 className="text-sm font-medium">Projetos recentes</h3>
            <ul className="flex flex-col gap-4">
              {DEMO_PROJECTS.map((project) => {
                const client = getClient(project.clientKey);
                return (
                  <li key={project.key} className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium">{project.name}</span>
                      <span className="truncate text-xs text-muted-foreground">{client?.name}</span>
                    </div>
                    <StatusDot tone={project.tone} label={project.status} />
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card/40 p-5">
            <h3 className="text-sm font-medium">Próximas entregas</h3>
            <ul className="flex flex-col gap-4">
              {PENDING_DELIVERIES.map((delivery) => {
                const project = getProject(delivery.projectKey);
                return (
                  <li key={delivery.key} className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium">{delivery.title}</span>
                      <span className="truncate text-xs text-muted-foreground">{project?.name}</span>
                    </div>
                    <StatusDot tone={delivery.tone} label={delivery.status} />
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card/40 p-5">
            <h3 className="text-sm font-medium">Equipe ativa</h3>
            <ul className="flex flex-col gap-4">
              {DEMO_TEAM.map((member) => (
                <li key={member.key} className="flex items-center gap-3">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground/10 font-mono text-[11px] uppercase text-muted-foreground">
                    {member.name.slice(0, 2)}
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium">{member.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{member.role}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Próximas tarefas importantes</h2>
        <div className="rounded-xl border border-border/60 bg-card/40 p-5">
          {pendingTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma tarefa de onboarding pendente.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {pendingTasks.map((task) => (
                <li key={task.id} className="flex items-center justify-between gap-3 text-sm">
                  <span>{task.title}</span>
                  <Link href={`/clientes/${task.clientId}`} className="text-xs text-muted-foreground hover:text-foreground hover:underline">
                    {task.clientName}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Acesso rápido</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {DASHBOARD_SECTIONS.map((section, index) => {
            const Icon = section.icon;
            return (
              <SectionCard
                key={section.key}
                href={section.href}
                label={section.label}
                description={section.description}
                icon={<Icon className="size-5" />}
                delay={index * 0.08}
              />
            );
          })}
        </div>
      </section>
    </main>
  );
}
