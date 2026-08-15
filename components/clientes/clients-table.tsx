"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { StatusDot, type StatusTone } from "@/components/dashboard/status-dot";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CONTRACT_CATEGORIES, CONTRACT_CATEGORY_LABEL, CONTRACT_CATEGORY_TONE } from "@/lib/financeiro/contract-category";
import { cn } from "@/lib/utils";
import type { ClientStatus, ContractCategory } from "@/lib/supabase/types/database";
import type { ClientWithCategories } from "@/lib/clientes/queries";

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

export function ClientsTable({ clients }: { clients: ClientWithCategories[] }) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ContractCategory | "all">("all");

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return clients.filter(({ client, categories }) => {
      const matchesQuery = !normalized || client.name.toLowerCase().includes(normalized) || client.slug.toLowerCase().includes(normalized);
      const matchesCategory = categoryFilter === "all" || categories.includes(categoryFilter);
      return matchesQuery && matchesCategory;
    });
  }, [clients, query, categoryFilter]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar cliente..." className="pl-9" />
        </div>

        {/* Categoria é por CONTRATO, não por cliente (um cliente pode ter fases diferentes ao
            longo do tempo — ex.: 2 contratos encerrados + 1 ativo) — o filtro mostra o cliente se
            QUALQUER um dos contratos dele bater com a categoria escolhida. */}
        <div className="flex flex-wrap items-center gap-1 rounded-md border border-border/60 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={cn("rounded px-2 py-1 transition-colors", categoryFilter === "all" ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            Todas
          </button>
          {CONTRACT_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setCategoryFilter(category)}
              className={cn("rounded px-2 py-1 transition-colors", categoryFilter === category ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              {CONTRACT_CATEGORY_LABEL[category]}
            </button>
          ))}
        </div>
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
                <TableHead>Categoria (contratos)</TableHead>
                <TableHead>Segmento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map(({ client, categories }) => (
                <TableRow key={client.id} className="border-border/60">
                  <TableCell className="font-medium">
                    <Link href={`/clientes/${client.id}`} className="hover:underline">
                      {client.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <StatusDot tone={STATUS_TONE[client.status]} label={STATUS_LABEL[client.status]} />
                  </TableCell>
                  <TableCell>
                    {categories.length === 0 ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {categories.map((category) => (
                          <StatusDot key={category} tone={CONTRACT_CATEGORY_TONE[category]} label={CONTRACT_CATEGORY_LABEL[category]} />
                        ))}
                      </div>
                    )}
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
