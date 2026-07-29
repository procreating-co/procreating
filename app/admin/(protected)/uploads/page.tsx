import type { Metadata } from "next";
import { File as FileIcon, Trash2 } from "lucide-react";
import { ProjectSelect } from "@/components/admin/uploads/project-select";
import { UploadForm } from "@/components/admin/uploads/upload-form";
import { deleteFileAction } from "@/app/admin/(protected)/uploads/actions";
import { listFiles } from "@/lib/storage";
import { mockProjects } from "@/lib/admin/projects/mock-data";
import { formatBytes, formatDateTime } from "@/lib/admin/format";

export const metadata: Metadata = { title: "Uploads | Painel Procreating" };

const CATEGORY_LABELS: Record<string, string> = {
  videos: "Vídeos",
  photos: "Fotos",
  logo: "Logo",
  "og-image": "OG Image",
};

export default async function AdminUploadsPage({ searchParams }: { searchParams: Promise<{ project?: string }> }) {
  const { project: projectSlugParam } = await searchParams;
  const project = mockProjects.find((p) => p.slug === projectSlugParam) ?? mockProjects[0];
  const files = project ? await listFiles(`clients/${project.slug}/`) : [];

  return (
    <main className="mx-auto max-w-[1000px] px-6 py-10 lg:px-10">
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">Central de mídia</p>
        <h1 className="mt-1 font-display text-3xl">Uploads</h1>
        <p className="mt-2 max-w-lg text-sm text-muted-foreground">
          Envia arquivos pro <code>StorageProvider</code> mock — fica em memória do servidor, não é Cloudflare R2 de
          verdade ainda.
        </p>
      </header>

      {mockProjects.length === 0 || !project ? (
        <p className="rounded-lg border border-border/60 bg-card/40 px-5 py-10 text-center text-sm text-muted-foreground">
          Nenhum projeto disponível ainda.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">Projeto</span>
            <ProjectSelect projects={mockProjects} selectedSlug={project.slug} />
          </div>

          <UploadForm projectSlug={project.slug} />

          <div>
            <h2 className="mb-4 font-display text-xl">Arquivos de {project.name}</h2>
            {files.length === 0 ? (
              <p className="rounded-lg border border-border/60 bg-card/40 px-5 py-10 text-center text-sm text-muted-foreground">
                Nenhum arquivo enviado ainda pra este projeto.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {files.map((file) => {
                  const [, , category, ...nameParts] = file.key.split("/");
                  const name = nameParts.join("/");
                  return (
                    <li
                      key={file.key}
                      className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/40 px-4 py-3"
                    >
                      <FileIcon className="size-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm">{name}</p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {CATEGORY_LABELS[category] ?? category} · {formatBytes(file.size)} · enviado em{" "}
                          {formatDateTime(file.lastModified)}
                        </p>
                      </div>
                      <form action={deleteFileAction.bind(null, file.key)}>
                        <button
                          type="submit"
                          title="Remover"
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </form>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
