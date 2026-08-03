import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import type { LauncherClient } from "@/lib/clients/launcher-mock-data";

const STATUS_CLASSES: Record<LauncherClient["status"], string> = {
  Published: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  Draft: "border-border bg-foreground/5 text-muted-foreground",
  Archived: "border-border bg-foreground/5 text-muted-foreground/70",
};

/** Cabeçalho do Workspace — nome do cliente, status, e as duas ações que fazem sentido hoje. */
export function WorkspaceHeader({ client }: { client: LauncherClient }) {
  return (
    <div className="pb-6 pt-10">
      <Link
        href="/clients"
        className="mb-4 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3" />
        Client Hub
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-3xl text-foreground">{client.name}</h1>
          <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide ${STATUS_CLASSES[client.status]}`}>
            {client.status}
          </span>
        </div>

        <Link
          href={`/clients/${client.slug}/public`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md border border-border/60 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
        >
          <ExternalLink className="size-4" />
          Open public site
        </Link>
      </div>
    </div>
  );
}
