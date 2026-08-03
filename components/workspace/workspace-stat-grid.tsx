import { Calendar, LayoutTemplate, UserRound } from "lucide-react";
import type { ClientWorkspaceConfig, ClientWorkspaceStatus } from "@/lib/clients/workspace-registry";

const STATUS_CLASSES: Record<ClientWorkspaceStatus, string> = {
  Published: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  Draft: "border-border bg-foreground/5 text-muted-foreground",
  Archived: "border-border bg-foreground/5 text-muted-foreground/70",
};

/** Grade de fatos rápidos do Overview — Cliente / Status / Template / Última atualização. */
export function WorkspaceStatGrid({ client }: { client: ClientWorkspaceConfig }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="rounded-xl border border-border/60 bg-card/40 p-4">
        <div className="mb-2 flex items-center gap-1.5 text-muted-foreground">
          <UserRound className="size-3.5" />
          <p className="font-mono text-[10px] uppercase tracking-wide">Cliente</p>
        </div>
        <p className="text-sm text-foreground">{client.name}</p>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/40 p-4">
        <div className="mb-2 flex items-center gap-1.5 text-muted-foreground">
          <span className="size-1.5 rounded-full bg-current" />
          <p className="font-mono text-[10px] uppercase tracking-wide">Status atual</p>
        </div>
        <span className={`inline-flex rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${STATUS_CLASSES[client.status]}`}>
          {client.status}
        </span>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/40 p-4">
        <div className="mb-2 flex items-center gap-1.5 text-muted-foreground">
          <LayoutTemplate className="size-3.5" />
          <p className="font-mono text-[10px] uppercase tracking-wide">Template</p>
        </div>
        <p className="text-sm text-foreground">{client.template}</p>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/40 p-4">
        <div className="mb-2 flex items-center gap-1.5 text-muted-foreground">
          <Calendar className="size-3.5" />
          <p className="font-mono text-[10px] uppercase tracking-wide">Última atualização</p>
        </div>
        <p className="text-sm text-foreground">{client.updatedAt}</p>
      </div>
    </div>
  );
}
