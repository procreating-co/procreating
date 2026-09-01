import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { StatusDot } from "@/components/dashboard/status-dot";
import { CLIENT_STATUS_LABEL, CLIENT_STATUS_TONE } from "@/components/clientes/client-card";
import type { Client } from "@/lib/supabase/types/database";
import type { UpcomingDelivery } from "@/lib/operacao/queries";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });
const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

/** Header do Client Hub — nome, "Cliente recorrente", status real do cadastro, próxima entrega
 *  (mesmo dado de `listClientUpcomingDeliveries`, sem duplicar query) e última atualização. */
export function ClientHubHeader({ client, nextDelivery, lastUpdatedAt }: { client: Client; nextDelivery: UpcomingDelivery | null; lastUpdatedAt: string | null }) {
  return (
    <div className="flex flex-col gap-4">
      <Link href={`/clientes/${client.id}`} className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-3.5" />
        {client.name}
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl">{client.name}</h1>
            <StatusDot tone={CLIENT_STATUS_TONE[client.status]} label={CLIENT_STATUS_LABEL[client.status]} />
          </div>
          <p className="text-sm text-muted-foreground">Central do Cliente · Cliente recorrente</p>
        </div>

        <a
          href={`/clients/${client.slug}/public`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-900 transition-colors hover:bg-neutral-200"
        >
          Projeto inicial
          <ArrowUpRight className="size-3" />
        </a>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
        <span>Próxima entrega: {nextDelivery ? `${nextDelivery.name} · ${dateFormatter.format(new Date(`${nextDelivery.deadline}T00:00:00`))}` : "nenhuma com prazo definido"}</span>
        <span>Última atualização: {lastUpdatedAt ? dateTimeFormatter.format(new Date(lastUpdatedAt)) : "—"}</span>
      </div>
    </div>
  );
}
