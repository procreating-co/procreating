"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
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

/** Prioridade de status pro sort padrão — "ver antes os ativos" (pedido explícito). Ativo primeiro,
 *  depois quem ainda precisa de atenção, depois quem tá em formação, churn por último (é o que
 *  menos importa olhar de cara todo dia). Não é ordem alfabética nem a ordem do enum do banco —
 *  é uma prioridade de negócio, só usada pra o sort "Status". */
const STATUS_PRIORITY: Record<ClientStatus, number> = { ativo: 0, atencao: 1, risco: 2, onboarding: 3, lead: 4, churn: 5 };

type SortColumn = "name" | "status" | "segment";
type SortDirection = "asc" | "desc";

function SortableHead({ label, column, sort, onSort }: { label: string; column: SortColumn; sort: { column: SortColumn; direction: SortDirection }; onSort: (column: SortColumn) => void }) {
  const active = sort.column === column;
  return (
    <TableHead>
      <button type="button" onClick={() => onSort(column)} className="flex items-center gap-1 text-left transition-colors hover:text-foreground">
        {label}
        {active ? sort.direction === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" /> : <ArrowUpDown className="size-3 text-muted-foreground/40" />}
      </button>
    </TableHead>
  );
}

export function ClientsTable({ clients }: { clients: ClientWithCategories[] }) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ContractCategory | "all">("all");
  // Padrão: Status ascendente = ordem de prioridade de negócio (ativo primeiro) — não alfabética.
  const [sort, setSort] = useState<{ column: SortColumn; direction: SortDirection }>({ column: "status", direction: "asc" });

  function handleSort(column: SortColumn) {
    setSort((current) => (current.column === column ? { column, direction: current.direction === "asc" ? "desc" : "asc" } : { column, direction: "asc" }));
  }

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const filtered = clients.filter(({ client, categories }) => {
      const matchesQuery = !normalized || client.name.toLowerCase().includes(normalized) || client.slug.toLowerCase().includes(normalized);
      const matchesCategory = categoryFilter === "all" || categories.includes(categoryFilter);
      return matchesQuery && matchesCategory;
    });

    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      if (sort.column === "name") comparison = a.client.name.localeCompare(b.client.name, "pt-BR");
      else if (sort.column === "status") comparison = STATUS_PRIORITY[a.client.status] - STATUS_PRIORITY[b.client.status];
      else comparison = (a.client.segment ?? "").localeCompare(b.client.segment ?? "", "pt-BR");
      return sort.direction === "asc" ? comparison : -comparison;
    });
    return sorted;
  }, [clients, query, categoryFilter, sort]);

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
                <SortableHead label="Cliente" column="name" sort={sort} onSort={handleSort} />
                <SortableHead label="Status" column="status" sort={sort} onSort={handleSort} />
                <TableHead>Categoria (contratos)</TableHead>
                <SortableHead label="Segmento" column="segment" sort={sort} onSort={handleSort} />
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
