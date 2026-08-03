import { Clapperboard, FolderKanban, PackageCheck, Users } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { GreetingHeader } from "@/components/dashboard/greeting-header";
import { StatTile } from "@/components/dashboard/stat-tile";
import { StatusDot } from "@/components/dashboard/status-dot";
import { SectionCard } from "@/components/dashboard/section-card";
import { DASHBOARD_SECTIONS } from "@/components/dashboard/nav-config";
import {
  DEMO_CLIENTS,
  DEMO_DELIVERIES,
  DEMO_PRODUCTIONS,
  DEMO_PROJECTS,
  DEMO_TEAM,
  getClient,
  getProject,
} from "@/lib/dashboard/demo-data";

/**
 * Nenhum array próprio aqui — a Home só lê `lib/dashboard/demo-data.ts`, a mesma fonte que
 * `/operacao/projetos`, `/operacao/producao` e `/operacao/entregas` usam. É por isso que os
 * números batem entre as telas: são a mesma contagem, não cópias que podem divergir.
 */
const PENDING_DELIVERIES = DEMO_DELIVERIES.filter((delivery) => delivery.tone === "pending");

const STAT_TILES = [
  { key: "clientes-ativos", label: "Clientes ativos", value: String(DEMO_CLIENTS.length), icon: Users },
  { key: "projetos-ativos", label: "Projetos ativos", value: String(DEMO_PROJECTS.length), icon: FolderKanban },
  { key: "conteudos-producao", label: "Conteúdos em produção", value: String(DEMO_PRODUCTIONS.length), icon: Clapperboard },
  { key: "entregas-pendentes", label: "Entregas pendentes", value: String(PENDING_DELIVERIES.length), icon: PackageCheck },
];

/**
 * Home da plataforma interna — dashboard principal, não mais landing page. Independente de
 * `/clients/<slug>` (entregas de cliente) e de `/admin` (painel legado); ver
 * `components/dashboard/` para o chrome e `nav-config.ts` pra onde cada seção leva.
 */
export default function Home() {
  return (
    <DashboardLayout>
      <main className="mx-auto flex max-w-[1400px] flex-col gap-10 px-6 py-16 lg:px-10">
        <GreetingHeader />

        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Resumo geral</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {STAT_TILES.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <StatTile
                  key={stat.key}
                  label={stat.label}
                  value={stat.value}
                  icon={<Icon className="size-4.5" />}
                  delay={index * 0.05}
                />
              );
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
    </DashboardLayout>
  );
}
