"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Handshake, ListChecks, Plus, Search, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatedRevealText } from "@/components/shared/animated-reveal-text";
import { OficinaFormDialog } from "@/components/prospeccao/oficina-form-dialog";
import { OficinaTable } from "@/components/prospeccao/oficina-table";
import { useOficinas } from "@/components/prospeccao/oficinas-store";
import { STATUS_OPTIONS } from "@/lib/prospeccao/mock-data";
import type { OficinaStatus } from "@/lib/prospeccao/types";

const SORT_OPTIONS = [
  { value: "recentes", label: "Atualizado recentemente" },
  { value: "nome", label: "Nome (A–Z)" },
  { value: "cidade", label: "Cidade (A–Z)" },
  { value: "status", label: "Status" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

function StatCard({ icon: Icon, label, value }: { icon: typeof ListChecks; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4">
      <div className="flex items-center gap-2 text-white/40">
        <Icon className="size-4" />
        <span className="font-mono text-[11px] uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 font-display text-3xl text-white">{value}</p>
    </div>
  );
}

export type ProspeccaoHubProps = {
  title: string;
  homeHref: string;
};

export function ProspeccaoHub({ title, homeHref }: ProspeccaoHubProps) {
  const { oficinas, addOficina } = useOficinas();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OficinaStatus | "todos">("todos");
  const [sort, setSort] = useState<SortValue>("recentes");
  const [creating, setCreating] = useState(false);

  const stats = useMemo(
    () => ({
      total: oficinas.length,
      contatados: oficinas.filter((o) => o.status !== "nao_iniciado").length,
      interessados: oficinas.filter((o) => o.status === "interessado").length,
      clientes: oficinas.filter((o) => o.status === "cliente").length,
    }),
    [oficinas],
  );

  const visibleOficinas = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = oficinas.filter((oficina) => {
      const matchesQuery =
        !normalizedQuery ||
        oficina.nome.toLowerCase().includes(normalizedQuery) ||
        oficina.cidade.toLowerCase().includes(normalizedQuery) ||
        oficina.responsavel.toLowerCase().includes(normalizedQuery);
      const matchesStatus = statusFilter === "todos" || oficina.status === statusFilter;
      return matchesQuery && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "nome") return a.nome.localeCompare(b.nome);
      if (sort === "cidade") return a.cidade.localeCompare(b.cidade);
      if (sort === "status") return a.status.localeCompare(b.status);
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [oficinas, query, statusFilter, sort]);

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 pb-16 pt-8 text-white lg:px-12 lg:pt-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center gap-4">
          <a
            href={homeHref}
            aria-label="Voltar para a página inicial"
            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] text-white/70 transition-colors hover:border-[var(--client-accent)] hover:text-[var(--client-accent)]"
          >
            <ArrowLeft className="size-5" />
          </a>
          <h1 className="text-balance font-display text-3xl leading-[0.95] tracking-tight sm:text-4xl">
            <AnimatedRevealText text={title} delayMs={18} />
          </h1>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={ListChecks} label="Total" value={stats.total} />
          <StatCard icon={Send} label="Contatados" value={stats.contatados} />
          <StatCard icon={Search} label="Interessados" value={stats.interessados} />
          <StatCard icon={Handshake} label="Clientes" value={stats.clientes} />
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar oficina, cidade ou responsável..."
              aria-label="Buscar oficina"
              className="border-white/15 bg-white/[0.03] pl-9 text-white placeholder:text-white/40"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OficinaStatus | "todos")}
            aria-label="Filtrar por status"
            className="h-9 rounded-md border border-white/15 bg-white/[0.03] px-3 text-sm text-white outline-none focus-visible:border-[var(--client-accent)]"
          >
            <option value="todos">Todos os status</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="bg-[#0a0a0a]">
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortValue)}
            aria-label="Ordenar lista"
            className="h-9 rounded-md border border-white/15 bg-white/[0.03] px-3 text-sm text-white outline-none focus-visible:border-[var(--client-accent)]"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="bg-[#0a0a0a]">
                {option.label}
              </option>
            ))}
          </select>

          <Button
            type="button"
            onClick={() => setCreating(true)}
            className="ml-auto gap-2 bg-[var(--client-accent)] text-black hover:opacity-90"
          >
            <Plus className="size-4" />
            Nova oficina
          </Button>
        </div>

        <OficinaTable oficinas={visibleOficinas} />
      </div>

      <OficinaFormDialog open={creating} onOpenChange={setCreating} onSubmit={addOficina} />
    </main>
  );
}
