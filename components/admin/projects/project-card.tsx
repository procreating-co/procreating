import { Eye, Download, SquarePen, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ProjectStatusBadge } from "@/components/admin/dashboard/project-status-badge";
import { formatDateTime, formatNumber } from "@/lib/admin/format";
import type { AdminProject } from "@/lib/admin/projects/types";

/**
 * "Abrir" já é um link real pro site público do cliente (`/p/<slug>`) — a rota já existe pra
 * clientes registrados de verdade (ex.: Pascoal). Pra clientes só mockados (ainda não
 * registrados em `lib/clients/registry.ts`), o link existe mas a página de destino dá 404 —
 * comportamento honesto, não uma simulação escondida. "Editar" fica desabilitado até o fluxo
 * de edição existir (fora do escopo desta etapa).
 */
export function ProjectCard({ project }: { project: AdminProject }) {
  return (
    <Card className="justify-between gap-4 border-border/60 bg-card/40 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-lg">{project.name}</h3>
          <p className="truncate text-xs text-muted-foreground">{project.clientName}</p>
        </div>
        <ProjectStatusBadge status={project.status} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Eye className="size-4" />
          <span className="tabular-nums text-foreground">{formatNumber(project.views)}</span>
          <span className="text-xs">acessos</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Download className="size-4" />
          <span className="tabular-nums text-foreground">{formatNumber(project.downloads)}</span>
          <span className="text-xs">downloads</span>
        </div>
      </div>

      <p className="font-mono text-xs text-muted-foreground">Atualizado em {formatDateTime(project.updatedAt)}</p>

      <div className="flex gap-2 border-t border-border/60 pt-4">
        <a
          href={`/p/${project.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-border/60 px-3 py-2 text-sm transition-colors hover:bg-foreground/5"
        >
          <ExternalLink className="size-4" />
          Abrir
        </a>
        <button
          type="button"
          disabled
          title="Em breve"
          className="inline-flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-md border border-border/60 px-3 py-2 text-sm text-muted-foreground/50"
        >
          <SquarePen className="size-4" />
          Editar
        </button>
      </div>
    </Card>
  );
}
