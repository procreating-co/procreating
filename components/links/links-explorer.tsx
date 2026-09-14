"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, Copy, ExternalLink, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { cn } from "@/lib/utils";
import type { LinkCategory, LinkEntry, LinkGroup } from "@/lib/links/registry";

/**
 * `/links` — centralizador de todo link real do projeto (pedido explícito). Busca client-side
 * pura + filtro por categoria + copiar URL. Categorias abrem/fecham (pedido explícito, cabeçalho
 * grande e clicável — mesmo padrão de `TaskGroupSection` no Workspace) e cada link é uma LINHA de
 * lista, não um card (pedido explícito) — mais denso, mais rápido de escanear.
 */
export function LinksExplorer({ groups }: { groups: LinkGroup[] }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<LinkCategory | "Todos">("Todos");
  const [collapsed, setCollapsed] = useState<Partial<Record<LinkCategory, boolean>>>({});

  const totalCount = groups.reduce((sum, g) => sum + g.entries.length, 0);
  const hasQuery = query.trim().length > 0;

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return groups
      .filter((g) => activeCategory === "Todos" || g.category === activeCategory)
      .map((g) => ({
        ...g,
        entries: g.entries.filter((entry) => {
          if (!q) return true;
          return [entry.title, entry.description, entry.client, entry.type, entry.category].some((field) => field?.toLowerCase().includes(q));
        }),
      }))
      .filter((g) => g.entries.length > 0);
  }, [groups, query, activeCategory]);

  const visibleCount = filteredGroups.reduce((sum, g) => sum + g.entries.length, 0);
  const hasActiveFilters = hasQuery || activeCategory !== "Todos";

  function clearFilters() {
    setQuery("");
    setActiveCategory("Todos");
  }

  function toggleCategory(category: LinkCategory) {
    setCollapsed((prev) => ({ ...prev, [category]: !prev[category] }));
  }

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-8 px-6 pb-20 pt-10 lg:px-10">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-3xl">Links da Procreating</h1>
        <p className="text-sm text-muted-foreground">Todos os projetos, materiais e páginas em um só lugar.</p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome, cliente ou categoria..."
            aria-label="Buscar links"
            className="h-11 pl-10 text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <CategoryChip label="Todos" active={activeCategory === "Todos"} onClick={() => setActiveCategory("Todos")} />
          {groups.map((g) => (
            <CategoryChip key={g.category} label={`${g.category} (${g.entries.length})`} active={activeCategory === g.category} onClick={() => setActiveCategory(g.category)} />
          ))}
          {hasActiveFilters && (
            <button type="button" onClick={clearFilters} className="ml-1 flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground">
              <X className="size-3" />
              Limpar
            </button>
          )}
        </div>

        <p className="text-xs text-muted-foreground/70">
          {visibleCount} de {totalCount} links
        </p>
      </div>

      {filteredGroups.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Nenhum link encontrado"
          description={hasQuery ? `Nada bateu com "${query.trim()}".` : "Nenhum link nessa categoria."}
          fullBleed={false}
          action={
            <button type="button" onClick={clearFilters} className="text-sm text-foreground underline-offset-2 hover:underline">
              Limpar busca
            </button>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filteredGroups.map((group) => {
            // Busca ativa força o grupo aberto — nunca esconder um resultado atrás de uma seção
            // que o usuário tinha fechado antes de procurar.
            const isOpen = hasQuery || !collapsed[group.category];
            return (
              <section key={group.category} aria-label={group.category} className="flex flex-col">
                <button
                  type="button"
                  onClick={() => toggleCategory(group.category)}
                  aria-expanded={isOpen}
                  className="flex items-center gap-2.5 py-2 text-left"
                >
                  <ChevronRight className={cn("size-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-90")} />
                  <h2 className="font-display text-2xl leading-none tracking-tight text-foreground">{group.category}</h2>
                  <span className="text-sm text-muted-foreground/60">{group.entries.length}</span>
                </button>

                {isOpen && (
                  <ul className="ml-1 flex flex-col divide-y divide-border/60 rounded-xl border border-border/60 bg-card/40">
                    {group.entries.map((entry) => (
                      <LinkRow key={entry.id} entry={entry} />
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}

function CategoryChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-2.5 py-1 text-xs transition-colors",
        active ? "border-foreground/30 bg-foreground/[0.06] text-foreground" : "border-border/60 text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

function LinkRow({ entry }: { entry: LinkEntry }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const absoluteUrl = typeof window !== "undefined" ? `${window.location.origin}${entry.url}` : entry.url;
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard indisponível (permissão negada, contexto não seguro) — sem crash, só não copia.
    }
  }

  return (
    <li className="flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-center sm:gap-4">
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex flex-wrap items-center gap-1.5">
          {entry.client && (
            <Badge variant="outline" className="shrink-0">
              {entry.client}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground/70">{entry.type}</span>
          {entry.status && <Badge className="shrink-0">{entry.status}</Badge>}
        </div>
        <p className="truncate text-sm font-medium text-foreground">{entry.title}</p>
        <p className="truncate text-xs text-muted-foreground">{entry.description}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:w-[15rem]">
        <code className="min-w-0 flex-1 truncate text-[11px] text-muted-foreground/60">{entry.url}</code>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={`Copiar link de ${entry.title}`}
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
        </button>
        <Link
          href={entry.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Abrir ${entry.title}`}
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ExternalLink className="size-3.5" />
        </Link>
      </div>
    </li>
  );
}
