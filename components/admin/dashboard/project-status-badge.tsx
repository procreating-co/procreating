import type { ProjectStatus } from "@/lib/admin/projects/types";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<ProjectStatus, string> = {
  creating: "Criando",
  draft: "Rascunho",
  ready_for_preview: "Pronto p/ Preview",
  published: "Publicado",
  archived: "Arquivado",
};

const STATUS_CLASSES: Record<ProjectStatus, string> = {
  creating: "border-border bg-foreground/5 text-muted-foreground animate-pulse",
  draft: "border-border bg-foreground/5 text-muted-foreground",
  ready_for_preview: "border-sky-500/20 bg-sky-500/10 text-sky-400",
  published: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  archived: "border-border bg-foreground/5 text-muted-foreground/70",
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-xs", STATUS_CLASSES[status])}>
      {STATUS_LABEL[status]}
    </span>
  );
}
