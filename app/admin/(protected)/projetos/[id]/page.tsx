import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ProjectStatusBadge } from "@/components/admin/dashboard/project-status-badge";
import { getMockProjectById } from "@/lib/admin/projects/mock-data";
import { getMockClientById } from "@/lib/admin/clients/mock-data";
import { getMockTemplateById } from "@/lib/admin/templates/mock-data";
import { formatDateTime, formatNumber } from "@/lib/admin/format";

type Params = { id: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  const project = getMockProjectById(id);
  return { title: project ? `${project.name} | Painel Procreating` : "Projeto não encontrado" };
}

export default async function AdminProjetoDetalhePage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const project = getMockProjectById(id);
  if (!project) notFound();

  const client = getMockClientById(project.clientId);
  const template = getMockTemplateById(project.templateId);

  return (
    <main className="mx-auto max-w-[1000px] px-6 py-10 lg:px-10">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
            {client ? client.name : "Cliente desconhecido"}
          </p>
          <h1 className="mt-1 font-display text-3xl">{project.name}</h1>
        </div>
        <ProjectStatusBadge status={project.status} />
      </header>

      <Card className="grid grid-cols-2 gap-6 border-border/60 bg-card/40 p-6 sm:grid-cols-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">Template</p>
          <p className="mt-1 text-sm">{template ? template.name : "—"}</p>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">Acessos</p>
          <p className="mt-1 text-sm tabular-nums">{formatNumber(project.views)}</p>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">Downloads</p>
          <p className="mt-1 text-sm tabular-nums">{formatNumber(project.downloads)}</p>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">Atualizado em</p>
          <p className="mt-1 text-sm">{formatDateTime(project.updatedAt)}</p>
        </div>
      </Card>

      <div className="mt-6 flex gap-2">
        <a
          href={`/p/${project.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md border border-border/60 px-4 py-2 text-sm transition-colors hover:bg-foreground/5"
        >
          <ExternalLink className="size-4" />
          Abrir site público
        </a>
      </div>
    </main>
  );
}
