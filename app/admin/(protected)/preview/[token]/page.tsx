import type { Metadata } from "next";
import { AlertTriangle, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getMockPreviewByToken, isPreviewUsable } from "@/lib/admin/previews/mock-data";
import { getMockProjectById } from "@/lib/admin/projects/mock-data";
import { getMockClientById } from "@/lib/admin/clients/mock-data";
import { getMockTemplateById } from "@/lib/admin/templates/mock-data";
import { formatDateTime } from "@/lib/admin/format";

type Params = { token: string };

export const metadata: Metadata = { title: "Preview | Painel Procreating" };

/**
 * Etapa 6 (Preview, mock) — NÃO é o Render Engine real (docs/project-creation.md, seção 2 da
 * revisão 5 — ainda não implementado, trabalho de Core Platform). Isto só demonstra o fluxo
 * (token → validação → visualização) com um resumo do projeto, não a renderização de verdade
 * dos blocos (Hero/Galeria/etc.) — isso exige o Render Engine, fora do escopo desta etapa.
 * Vive sob `/admin` de propósito: ainda não existe token de acesso público real (ver seção 18,
 * Segurança — Preview Tokens comparados em tempo constante — não construído ainda).
 */
export default async function AdminPreviewPage({ params }: { params: Promise<Params> }) {
  const { token } = await params;
  const preview = getMockPreviewByToken(token);

  if (!preview) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-3 px-6 text-center">
        <AlertTriangle className="size-8 text-muted-foreground" />
        <h1 className="font-display text-2xl">Link de preview não encontrado</h1>
        <p className="text-sm text-muted-foreground">Este token não corresponde a nenhum preview gerado.</p>
      </main>
    );
  }

  if (!isPreviewUsable(preview)) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-3 px-6 text-center">
        <AlertTriangle className="size-8 text-muted-foreground" />
        <h1 className="font-display text-2xl">Link {preview.status === "revoked" ? "revogado" : "expirado"}</h1>
        <p className="text-sm text-muted-foreground">
          {preview.status === "revoked"
            ? "Este link de preview foi revogado."
            : `Este link expirou em ${formatDateTime(preview.expiresAt)}.`}{" "}
          Gere um novo na página do projeto.
        </p>
      </main>
    );
  }

  const project = getMockProjectById(preview.projectId);
  if (!project) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-3 px-6 text-center">
        <AlertTriangle className="size-8 text-muted-foreground" />
        <h1 className="font-display text-2xl">Projeto não encontrado</h1>
      </main>
    );
  }

  const client = getMockClientById(project.clientId);
  const template = getMockTemplateById(project.templateId);

  return (
    <main className="mx-auto max-w-[800px] px-6 py-10 lg:px-10">
      <div className="mb-8 flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
        <Eye className="size-4 shrink-0" />
        <span>
          Modo Preview — pré-visualização de &quot;{project.name}&quot;, expira em {formatDateTime(preview.expiresAt)}.
          Não é o site publicado.
        </span>
      </div>

      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">{client?.name ?? "Cliente desconhecido"}</p>
        <h1 className="mt-1 font-display text-3xl">{project.name}</h1>
      </header>

      {template && (
        <Card className="border-border/60 bg-card/40">
          <CardHeader>
            <CardTitle>{template.name}</CardTitle>
            <CardDescription>{template.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-muted-foreground">
              Estrutura que seria renderizada (a renderização de verdade dos blocos chega com o Render Engine, ainda
              não implementado):
            </p>
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
    </main>
  );
}
