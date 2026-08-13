"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { StatusDot, type StatusTone } from "@/components/dashboard/status-dot";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Client, ClientStatus } from "@/lib/supabase/types/database";

const STATUS_TONE: Record<ClientStatus, StatusTone> = {
  lead: "neutral",
  onboarding: "pending",
  ativo: "active",
  atencao: "pending",
  risco: "danger",
  churn: "danger",
};

const STATUS_LABEL: Record<ClientStatus, string> = {
  lead: "Lead",
  onboarding: "Onboarding",
  ativo: "Ativo",
  atencao: "Atenção",
  risco: "Risco",
  churn: "Churn",
};

export function ClientsTable({ clients }: { clients: Client[] }) {
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return clients;
    return clients.filter((client) => client.name.toLowerCase().includes(normalized) || client.slug.toLowerCase().includes(normalized));
  }, [clients, query]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative min-w-[220px] max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar cliente..." className="pl-9" />
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-card/20 px-6 py-16 text-center text-muted-foreground">
          {clients.length === 0 ? "Nenhum cliente cadastrado ainda." : "Nenhum cliente encontrado."}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/60">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Segmento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((client) => (
                <TableRow key={client.id} className="border-border/60">
                  <TableCell className="font-medium">
                    <Link href={`/clientes/${client.id}`} className="hover:underline">
                      {client.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <StatusDot tone={STATUS_TONE[client.status]} label={STATUS_LABEL[client.status]} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{client.segment || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
