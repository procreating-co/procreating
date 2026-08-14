"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { ProspectingList, Strategy, User } from "@/lib/supabase/types/database";

/**
 * Filtro de Responsável + Estratégia + Lista do CRM — mesmo padrão de `period-select.tsx`
 * (Link/`?param=` via `router.push`, sem estado duplicado). Como Pipeline e Lista já trocam de
 * view pela URL (`?view=`), filtrar pela URL também significa que alternar entre as duas — ou
 * voltar depois — preserva o filtro sozinho, sem precisar "lembrar" nada em memória. O filtro de
 * Lista é como um card de `ProspeccaoView` chega no CRM já filtrado (`?list=id`), sem precisar de
 * uma página própria de detalhe da lista.
 */
export function CrmFilters({
  owners,
  strategies,
  lists,
  ownerId,
  strategyId,
  listId,
}: {
  owners: User[];
  strategies: Strategy[];
  lists: ProspectingList[];
  ownerId: string;
  strategyId: string;
  listId: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "todos") params.delete(key);
    else params.set(key, value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex items-center gap-2">
      {lists.length > 0 && (
        <select
          value={listId}
          onChange={(e) => setParam("list", e.target.value)}
          aria-label="Filtrar por lista"
          className="h-8 rounded-md border border-input bg-transparent px-2 text-xs text-muted-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <option value="todos">Todas as listas</option>
          {lists.map((list) => (
            <option key={list.id} value={list.id}>
              {list.name}
            </option>
          ))}
        </select>
      )}
      <select
        value={ownerId}
        onChange={(e) => setParam("owner", e.target.value)}
        aria-label="Filtrar por responsável"
        className="h-8 rounded-md border border-input bg-transparent px-2 text-xs text-muted-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <option value="todos">Todos os responsáveis</option>
        {owners.map((owner) => (
          <option key={owner.id} value={owner.id}>
            {owner.name}
          </option>
        ))}
      </select>
      <select
        value={strategyId}
        onChange={(e) => setParam("strategy", e.target.value)}
        aria-label="Filtrar por estratégia"
        className="h-8 rounded-md border border-input bg-transparent px-2 text-xs text-muted-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <option value="todos">Todas as estratégias</option>
        {strategies.map((strategy) => (
          <option key={strategy.id} value={strategy.id}>
            {strategy.name}
          </option>
        ))}
      </select>
    </div>
  );
}
