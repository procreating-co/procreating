import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FolderKanban, PackageCheck, Users } from "lucide-react";
import { StatTile } from "@/components/dashboard/stat-tile";
import { StatusDot } from "@/components/dashboard/status-dot";
import {
  DEMO_DELIVERIES,
  DEMO_PRODUCTIONS,
  DEMO_PROJECTS,
  getClient,
  getTeamMember,
} from "@/lib/dashboard/demo-data";

export const metadata: Metadata = {
  title: "Projetos — Procreating",
  robots: { index: false, follow: false },
};

/** Indicadores mockados — sem backend ainda, por isso o `StatTile` carrega a etiqueta "Demo". */
const STATS = [
  { key: "ativos", label: "Projetos ativos", value: String(DEMO_PROJECTS.length), icon: FolderKanban },
  { key: "entregas", label: "Entregas pendentes", value: String(DEMO_DELIVERIES.length), icon: PackageCheck },
  { key: "clientes", label: "Clientes envolvidos", value: String(new Set(DEMO_PROJECTS.map((p) => p.clientKey)).size), icon: Users },
];

export default function ProjetosPage() {
  return (
      <main className="mx-auto flex max-w-[1400px] flex-col gap-8 px-6 py-16 lg:px-10">
        <Link
          href="/operacao"
          className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Operação
        </Link>

        <div className="flex flex-col gap-2">
          <h1 className="font-display text-3xl">Projetos</h1>
          <p className="max-w-lg text-sm text-muted-foreground">Gestão dos projetos ativos da Procreating.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {STATS.map((stat, index) => {
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

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Projetos em andamento</h2>
            <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              Demo
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {DEMO_PROJECTS.map((project) => {
              const client = getClient(project.clientKey);
              const team = getTeamMember(project.teamKey);
              const productions = DEMO_PRODUCTIONS.filter((item) => item.projectKey === project.key);
              const deliveries = DEMO_DELIVERIES.filter((item) => item.projectKey === project.key);

              return (
                <Link
                  key={project.key}
                  href={`/operacao/projetos/${project.key}`}
                  className="group flex flex-col gap-5 rounded-xl border border-border/60 bg-card/40 p-5 transition-colors hover:border-border hover:bg-card/70"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-medium">{project.name}</h3>
                    <StatusDot tone={project.tone} label={project.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">Cliente: {client?.name}</p>

                  <div className="flex flex-col gap-2 border-t border-border/60 pt-4">
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Relacionamentos</span>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex flex-col gap-0.5">
                        <p className="text-xs text-muted-foreground">Produções</p>
                        <p className="font-medium">
                          {productions.length} conteúdo{productions.length === 1 ? "" : "s"}
                        </p>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <p className="text-xs text-muted-foreground">Entregas</p>
                        <p className="font-medium">
                          {deliveries.length} pendente{deliveries.length === 1 ? "" : "s"}
                        </p>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <p className="text-xs text-muted-foreground">Equipe</p>
                        <p className="font-medium">{team?.name}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
  );
}
