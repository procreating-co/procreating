import Link from "next/link";
import { ExternalLink, Globe, Layers, LayoutTemplate, Sparkles } from "lucide-react";
import type { ClientWorkspaceConfig } from "@/lib/clients/workspace-registry";

/**
 * Conteúdo real da aba Overview — o resto das abas (Projetos/Conteúdos/Fotos/Vídeos/Entregas/
 * Configurações) ainda não tem dado nenhum por trás, então mostram `WorkspaceComingSoon` em vez
 * de fingir uma feature que não existe. `tagline`/`summary`/`highlights` vêm de
 * `content/clients/<slug>/workspace.ts` — é o que faz cada workspace parecer um cliente de
 * verdade, não só o mesmo componente repetido com um nome trocado.
 */
export function WorkspaceOverview({ client }: { client: ClientWorkspaceConfig }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Sparkles className="size-4" style={{ color: client.accentColor }} />
        <p className="text-sm text-foreground">{client.tagline}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border/60 bg-card/40 p-5">
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <Globe className="size-4" />
            <p className="font-mono text-xs uppercase tracking-wide">Public site</p>
          </div>
          <p className="mb-3 font-mono text-sm text-foreground">/clients/{client.slug}/public</p>
          <Link
            href={`/clients/${client.slug}/public`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Open <ExternalLink className="size-3.5" />
          </Link>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/40 p-5">
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <LayoutTemplate className="size-4" />
            <p className="font-mono text-xs uppercase tracking-wide">Template</p>
          </div>
          <p className="text-sm text-foreground">{client.template}</p>
        </div>
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

      <div className="rounded-xl border border-dashed border-border/60 px-6 py-10 text-center text-sm text-muted-foreground">
        Projetos, conteúdos e entregas deste workspace aparecem aqui assim que houver dado real por
        trás — ver as abas acima.
      </div>
    </div>
  );
}
