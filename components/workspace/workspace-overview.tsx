import { Layers, Sparkles } from "lucide-react";
import type { ClientWorkspaceConfig } from "@/lib/clients/workspace-registry";
import { WorkspaceStatGrid } from "@/components/workspace/workspace-stat-grid";
import { WorkspaceProjectCard } from "@/components/workspace/workspace-project-card";
import { WorkspaceProgress } from "@/components/workspace/workspace-progress";
import { WorkspaceNextSteps } from "@/components/workspace/workspace-next-steps";
import { WorkspaceQuickActions } from "@/components/workspace/workspace-quick-actions";

/**
 * Conteúdo real da aba Overview — o resto das abas (Projetos/Conteúdos/Fotos/Vídeos/Entregas/
 * Configurações) ainda não tem dado nenhum por trás, então mostram `WorkspaceComingSoon` em vez
 * de fingir uma feature que não existe. Todo dado (`tagline`/`project`/`progress`/`nextSteps`/
 * `overview`) vem de `content/clients/<slug>/workspace.ts` — é o que faz cada workspace parecer
 * um painel de projeto de verdade, não só o mesmo componente repetido com um nome trocado.
 */
export function WorkspaceOverview({ client }: { client: ClientWorkspaceConfig }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Sparkles className="size-4" style={{ color: client.accentColor }} />
        <p className="text-sm text-foreground">{client.tagline}</p>
      </div>

      <WorkspaceStatGrid client={client} />

      <WorkspaceQuickActions slug={client.slug} />

      <WorkspaceProjectCard project={client.project} accent={client.accentColor} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <WorkspaceProgress steps={client.progress} accent={client.accentColor} />
        <WorkspaceNextSteps steps={client.nextSteps} accent={client.accentColor} />
      </div>

      <div className="rounded-xl border border-border/60 bg-card/40 p-5">
        <div className="mb-3 flex items-center gap-2 text-muted-foreground">
          <Layers className="size-4" />
          <p className="font-mono text-xs uppercase tracking-wide">Summary</p>
        </div>
        <p className="mb-4 text-sm text-foreground">{client.overview.summary}</p>
        <ul className="flex flex-col gap-2">
          {client.overview.highlights.map((highlight) => (
            <li key={highlight} className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="size-1 shrink-0 rounded-full" style={{ backgroundColor: client.accentColor }} />
              {highlight}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
