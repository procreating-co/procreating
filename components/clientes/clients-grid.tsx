"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ClientCard } from "@/components/clientes/client-card";
import { ClientDetailDrawer } from "@/components/clientes/client-detail-drawer";
import { cn } from "@/lib/utils";
import type { ClientCardData } from "@/lib/clientes/queries";

type StatusFilter = "all" | "ativo" | "recorrente" | "atencao";
type SortKey = "recent" | "oldest" | "most_projects" | "name";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "ativo", label: "Ativos" },
  { value: "recorrente", label: "Recorrentes" },
  { value: "atencao", label: "Em atenção" },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recent", label: "Mais recentes" },
  { value: "oldest", label: "Mais antigos" },
  { value: "most_projects", label: "Mais projetos" },
  { value: "name", label: "Nome A–Z" },
];

/**
 * Grid + busca + filtros + ordenação + drawer — a Central de Clientes em si. Tudo client-side
 * sobre o array já carregado pela página (`rows`, `ClientsOverview.rows`) — pedido explícito
 * ("não fazer busca server-side ainda"), e cabe folgado: é a lista de clientes da empresa, não
 * um dataset que justifique paginação/busca no banco por enquanto.
 *
 * `rows` já chega filtrada (só ativos/recorrentes — pedido explícito, `listClientsOverview` em
 * `lib/clientes/queries.ts`), então não existe mais chip "Churn" aqui — seria sempre vazio por
 * definição. "Em atenção" continua útil: um cliente recorrente pode estar nesse status sem sair
 * do recorte ativo/recorrente (é justamente quem precisa de olho). "Arquivados" do pedido
 * original não tem status próprio no domínio real — a ação "Arquivar" no drawer marca
 * `status='churn'`, que some daqui automaticamente (mesmo filtro da query).
 */
export function ClientsGrid({ rows }: { rows: ClientCardData[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortKey>("recent");
  const [selected, setSelected] = useState<ClientCardData | null>(null);

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const filtered = rows.filter((row) => {
      const matchesQuery =
        !normalized ||
        row.client.name.toLowerCase().includes(normalized) ||
        row.client.slug.toLowerCase().includes(normalized) ||
        (row.client.segment ?? "").toLowerCase().includes(normalized);
      const matchesStatus =
        status === "all" ||
        (status === "recorrente" ? row.categories.includes("recorrente_ativo") : row.client.status === status);
      return matchesQuery && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      switch (sort) {
        case "recent":
          return new Date(b.client.created_at).getTime() - new Date(a.client.created_at).getTime();
        case "oldest":
          return new Date(a.client.created_at).getTime() - new Date(b.client.created_at).getTime();
        case "most_projects":
          return b.contractCount - a.contractCount;
        case "name":
          return a.client.name.localeCompare(b.client.name, "pt-BR");
        default:
          return 0;
      }
    });
  }, [rows, query, status, sort]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar cliente, projeto ou segmento..." className="pl-9" />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="h-9 w-fit rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-1 overflow-x-auto rounded-md border border-border/60 p-0.5 text-xs">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setStatus(filter.value)}
            className={cn("shrink-0 rounded px-2.5 py-1.5 transition-colors", status === filter.value ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-card/20 px-6 py-16 text-center text-muted-foreground">
          {rows.length === 0 ? "Nenhum cliente cadastrado ainda." : "Nenhum cliente encontrado."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((row) => (
            <ClientCard key={row.client.id} data={row} onOpen={() => setSelected(row)} />
          ))}
        </div>
      )}

      <ClientDetailDrawer
        data={selected}
        onOpenChange={(open) => !open && setSelected(null)}
        onArchived={() => setSelected(null)}
      />
    </div>
  );
}
