import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronRight, Clock, Download, ExternalLink, Eye, SquarePen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProjectStatusBadge } from "@/components/admin/dashboard/project-status-badge";
import { MetricCard } from "@/components/admin/dashboard/metric-card";
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

/**
 * Visualização completa (Etapa 3) — só leitura. "Editar" fica desabilitado de propósito: o
 * fluxo de edição ainda não existe (fora do escopo desta etapa, "nada de criação ainda").
 */
export default async function AdminProjetoDetalhePage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const project = getMockProjectById(id);
  if (!project) notFound();

  const client = getMockClientById(project.clientId);
  const template = getMockTemplateById(project.templateId);

  return (
    <main className="mx-auto max-w-[1000px] px-6 py-10 lg:px-10">
      <nav className="mb-4 flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-muted-foreground">
        <a href="/admin/projetos" className="hover:text-foreground hover:underline">
          Projetos
        </a>
        {client && (
          <>
            <ChevronRight className="size-3" />
            <a href={`/admin/clientes/${client.id}`} className="hover:text-foreground hover:underline">
              {client.name}
            </a>
          </>
        )}
      </nav>

      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">{project.name}</h1>
          <p className="mt-1.5 font-mono text-sm text-muted-foreground">/p/{project.slug}</p>
        </div>
        <ProjectStatusBadge status={project.status} />
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard icon={Eye} label="Acessos" value={formatNumber(project.views)} />
        <MetricCard icon={Download} label="Downloads" value={formatNumber(project.downloads)} />
        <MetricCard icon={Clock} label="Último acesso" value={formatDateTime(project.lastAccessAt)} />
      </section>

      <Card className="mt-6 border-border/60 bg-card/40">
        <CardHeader>
          <CardTitle>Sobre este projeto</CardTitle>
          <CardDescription>Atualizado em {formatDateTime(project.updatedAt)}</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <dt className="font-mono text-xs uppercase tracking-wide text-muted-foreground">Cliente</dt>
              <dd className="mt-1 text-sm">
                {client ? (
                  <a href={`/admin/clientes/${client.id}`} className="hover:underline">
                    {client.name}
                  </a>
                ) : (
                  "Cliente desconhecido"
                )}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-xs uppercase tracking-wide text-muted-foreground">Template</dt>
              <dd className="mt-1 text-sm">{template ? template.name : "—"}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {template && (
        <Card className="mt-6 border-border/60 bg-card/40">
          <CardHeader>
            <CardTitle>Estrutura</CardTitle>
            <CardDescription>{template.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="flex flex-wrap gap-2">
              {template.blocks.map((block, index) => (
                <li key={block} className="rounded-full border border-border/60 px-3 py-1 font-mono text-xs text-muted-foreground">
                  {index + 1}. {block}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

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
        <button
          type="button"
          disabled
          title="Em breve"
          className="inline-flex cursor-not-allowed items-center gap-2 rounded-md border border-border/60 px-4 py-2 text-sm text-muted-foreground/50"
        >
          <SquarePen className="size-4" />
          Editar
        </button>
      </div>
    </main>
  );
}
