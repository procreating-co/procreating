import { FolderKanban } from "lucide-react";
import type { WorkspaceProject } from "@/lib/clients/workspace-registry";

/** Card "Projeto" do Overview — ficha resumida da entrega, separada da ficha de cliente acima. */
export function WorkspaceProjectCard({ project, accent }: { project: WorkspaceProject; accent: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/40 p-5">
      <div className="mb-3 flex items-center gap-2 text-muted-foreground">
        <FolderKanban className="size-4" />
        <p className="font-mono text-xs uppercase tracking-wide">Projeto</p>
      </div>
      <p className="mb-5 font-display text-lg text-foreground">{project.name}</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <p className="mb-1 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">Status</p>
          <p className="text-sm text-foreground">{project.status}</p>
        </div>
        <div>
          <p className="mb-1 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">Tipo</p>
          <p className="text-sm text-foreground">{project.type}</p>
        </div>
        <div>
          <p className="mb-1 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">Entrega</p>
          <p className="text-sm text-foreground">{project.deliverable}</p>
        </div>
      </div>

      <div className="mt-4 h-0.5 w-8 rounded-full" style={{ backgroundColor: accent }} aria-hidden="true" />
    </div>
  );
}
