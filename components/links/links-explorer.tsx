"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { cn } from "@/lib/utils";
import type { LinkCategory, LinkEntry, LinkGroup } from "@/lib/links/registry";

/**
 * `/links` — centralizador de todo link real do projeto (pedido explícito). Busca client-side
 * pura (o volume de links não justifica backend nenhum) + filtro por categoria + copiar URL.
 * Design deliberadamente enxuto — "deve parecer uma ferramenta interna", não a experiência
 * cinematográfica de `/pros`: mesmos tokens de tema do resto do ERP (`bg-background`,
 * `text-foreground`, `border-border`), sem vídeo/animação de scroll.
 */
export function LinksExplorer({ groups }: { groups: LinkGroup[] }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<LinkCategory | "Todos">("Todos");

  const totalCount = groups.reduce((sum, g) => sum + g.entries.length, 0);

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
  const hasActiveFilters = query.trim().length > 0 || activeCategory !== "Todos";

  function clearFilters() {
    setQuery("");
    setActiveCategory("Todos");
  }

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 pb-20 pt-10 lg:px-10">
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
          description={query.trim() ? `Nada bateu com "${query.trim()}".` : "Nenhum link nessa categoria."}
          fullBleed={false}
          action={
            <button type="button" onClick={clearFilters} className="text-sm text-foreground underline-offset-2 hover:underline">
              Limpar busca
            </button>
          }
        />
      ) : (
        <div className="flex flex-col gap-10">
          {filteredGroups.map((group) => (
            <section key={group.category} aria-label={group.category} className="flex flex-col gap-4">
              <div className="flex items-baseline gap-2">
                <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{group.category}</h2>
                <span className="text-xs text-muted-foreground/60">{group.entries.length}</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {group.entries.map((entry) => (
                  <LinkCard key={entry.id} entry={entry} />
                ))}
              </div>
            </section>
          ))}
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

function LinkCard({ entry }: { entry: LinkEntry }) {
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
    <article className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/40 p-4">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {entry.client && (
            <Badge variant="outline" className="shrink-0">
              {entry.client}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground/70">{entry.type}</span>
          {entry.status && (
            <Badge variant="default" className="ml-auto shrink-0">
              {entry.status}
            </Badge>
          )}
        </div>
        <h3 className="text-sm font-medium leading-snug text-foreground">{entry.title}</h3>
        <p className="text-xs leading-relaxed text-muted-foreground">{entry.description}</p>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/60 pt-3">
        <code className="min-w-0 flex-1 truncate text-[11px] text-muted-foreground/60">{entry.url}</code>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            aria-label={`Copiar link de ${entry.title}`}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
          </button>
          <Link
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Abrir ${entry.title}`}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ExternalLink className="size-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
