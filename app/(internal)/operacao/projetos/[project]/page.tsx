import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { StatusDot } from "@/components/dashboard/status-dot";
import { DEMO_DELIVERIES, DEMO_PRODUCTIONS, DEMO_PROJECTS, getClient, getTeamMember } from "@/lib/dashboard/demo-data";

export async function generateStaticParams() {
  return DEMO_PROJECTS.map((project) => ({ project: project.key }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ project: string }>;
}): Promise<Metadata> {
  const { project: projectKey } = await params;
  const project = DEMO_PROJECTS.find((item) => item.key === projectKey);
  if (!project) return {};

  return {
    title: `${project.name} — Procreating`,
    robots: { index: false, follow: false },
  };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ project: string }> }) {
  const { project: projectKey } = await params;
  const project = DEMO_PROJECTS.find((item) => item.key === projectKey);
  if (!project) notFound();

  const client = getClient(project.clientKey);
  const team = getTeamMember(project.teamKey);
  const productions = DEMO_PRODUCTIONS.filter((item) => item.projectKey === project.key);
  const deliveries = DEMO_DELIVERIES.filter((item) => item.projectKey === project.key);

  return (
      <main className="mx-auto flex max-w-[1400px] flex-col gap-8 px-6 pt-8 pb-16 lg:px-10">
        <Link
          href="/operacao/projetos"
          className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Projetos
        </Link>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl">{project.name}</h1>
            <StatusDot tone={project.tone} label={project.status} />
          </div>
          <p className="text-sm text-muted-foreground">Cliente: {client?.name}</p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Resumo</h2>
            <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              Demo
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-border/60 bg-card/40 p-5 sm:grid-cols-4">
            <div className="flex flex-col gap-0.5">
              <p className="text-xs text-muted-foreground">Cliente</p>
              <p className="text-sm font-medium">{client?.name}</p>
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-xs text-muted-foreground">Responsável</p>
              <p className="text-sm font-medium">{team?.name}</p>
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="text-sm font-medium">{project.status}</p>
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-xs text-muted-foreground">Prazo</p>
              <p className="text-sm font-medium">{project.deadline}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Produção relacionada</h2>
          <div className="flex flex-col gap-2">
            {productions.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/40 p-4"
              >
                <span className="text-sm font-medium">{item.title}</span>
                <StatusDot tone={item.tone} label={item.status} />
              </div>
            ))}
            {productions.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum conteúdo relacionado ainda.</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Entregas relacionadas</h2>
          <div className="flex flex-col gap-2">
            {deliveries.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/40 p-4"
              >
                <span className="text-sm font-medium">{item.title}</span>
                <StatusDot tone={item.tone} label={item.status} />
              </div>
            ))}
            {deliveries.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma entrega relacionada ainda.</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Equipe envolvida</h2>
          <div className="flex flex-col gap-2">
            {team && (
              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 p-4">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground/10 font-mono text-[11px] uppercase text-muted-foreground">
                  {team.name.slice(0, 2)}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{team.name}</span>
                  <span className="text-xs text-muted-foreground">{team.role}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
  );
}
