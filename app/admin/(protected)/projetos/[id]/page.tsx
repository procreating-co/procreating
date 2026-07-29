import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronRight, Clock, Download, ExternalLink, Eye, Link2, SquarePen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProjectStatusBadge } from "@/components/admin/dashboard/project-status-badge";
import { MetricCard } from "@/components/admin/dashboard/metric-card";
import { getMockProjectById } from "@/lib/admin/projects/mock-data";
import { getMockClientById } from "@/lib/admin/clients/mock-data";
import { getMockTemplateById } from "@/lib/admin/templates/mock-data";
import { getMockPreviewsByProject, isPreviewUsable } from "@/lib/admin/previews/mock-data";
import { generatePreviewAction, revokePreviewAction } from "@/app/admin/(protected)/projetos/[id]/preview-actions";
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
  const previews = getMockPreviewsByProject(project.id);

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

      <Card className="mt-6 border-border/60 bg-card/40">
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>
            Links de pré-visualização — mock, válidos por 14 dias, revogáveis a qualquer momento. Não é o site público
            de verdade.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {previews.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum link de preview gerado ainda.</p>
          ) : (
            <ul className="mb-4 flex flex-col gap-2">
              {previews.map((preview) => {
                const usable = isPreviewUsable(preview);
                return (
                  <li
                    key={preview.token}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-mono text-xs">/admin/preview/{preview.token}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {usable ? "Ativo" : preview.status === "revoked" ? "Revogado" : "Expirado"} · gerado por{" "}
                        {preview.createdBy} em {formatDateTime(preview.createdAt)} · expira em{" "}
                        {formatDateTime(preview.expiresAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      {usable && (
                        <a
                          href={`/admin/preview/${preview.token}`}
                          className="inline-flex items-center gap-1.5 rounded-md border border-border/60 px-3 py-1.5 text-xs transition-colors hover:bg-foreground/5"
                        >
                          <Link2 className="size-3.5" />
                          Abrir
                        </a>
                      )}
                      {preview.status === "active" && (
                        <form action={revokePreviewAction.bind(null, preview.token, project.id)}>
                          <button
                            type="submit"
                            className="rounded-md border border-border/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          >
                            Revogar
                          </button>
                        </form>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <form action={generatePreviewAction.bind(null, project.id)}>
            <Button type="submit" variant="outline" size="sm" className="gap-2">
              <Link2 className="size-4" />
              Gerar link de Preview
            </Button>
          </form>
        </CardContent>
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
