import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/admin/format";
import type { AdminClient } from "@/lib/admin/clients/types";

export function ClientCard({ client, projectCount }: { client: AdminClient; projectCount: number }) {
  return (
    <a href={`/admin/clientes/${client.id}`} className="block">
      <Card className="gap-3 border-border/60 bg-card/40 p-5 transition-colors hover:border-border">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg">{client.name}</h3>
          <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          {projectCount} {projectCount === 1 ? "projeto" : "projetos"}
        </p>
        <p className="font-mono text-xs text-muted-foreground">Cliente desde {formatDateTime(client.createdAt)}</p>
      </Card>
    </a>
  );
}
