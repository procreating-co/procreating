"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const SORT_OPTIONS = [
  { value: "name-asc", label: "Nome (A–Z)" },
  { value: "name-desc", label: "Nome (Z–A)" },
  { value: "created-desc", label: "Mais recentes" },
  { value: "created-asc", label: "Mais antigos" },
  { value: "projects-desc", label: "Mais projetos" },
] as const;

/**
 * Busca (debounced) + ordenação de `/admin/clientes`, ambas refletidas na URL (`?q=`/`?sort=`)
 * — a filtragem/ordenação de verdade acontece no Server Component da página (lê
 * `searchParams`), este componente só edita a URL. Isso mantém a lista de clientes como dado
 * server-rendered (sem embarcar `mockClients` inteiro no bundle do client).
 */
export function ClientesToolbar({ defaultQuery, defaultSort }: { defaultQuery: string; defaultSort: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(defaultQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function pushParams(next: { q?: string; sort?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    const merged = { q: query, sort: defaultSort, ...next };
    if (merged.q) params.set("q", merged.q);
    else params.delete("q");
    if (merged.sort && merged.sort !== "name-asc") params.set("sort", merged.sort);
    else params.delete("sort");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => pushParams({ q: value }), 300);
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Buscar cliente..."
          className="pl-9"
          aria-label="Buscar cliente"
        />
      </div>

      <select
        value={defaultSort}
        onChange={(e) => pushParams({ sort: e.target.value })}
        aria-label="Ordenar clientes"
        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
