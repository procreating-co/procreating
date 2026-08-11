"use client";

import { useMemo, useState } from "react";
import { Plus, Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OficinaFormDialog } from "@/components/prospeccao/oficina-form-dialog";
import { OficinaImportDialog } from "@/components/prospeccao/oficina-import-dialog";
import { OficinaTable } from "@/components/prospeccao/oficina-table";
import { LeadDetailDrawer } from "@/components/prospeccao/lead-detail-drawer";
import { useOficinas } from "@/components/prospeccao/oficinas-store";
import { STAGE_OPTIONS } from "@/lib/prospeccao/stages";
import { ICP_ORDER, ICP_OPTIONS } from "@/lib/prospeccao/icp";
import type { AderenciaIcp, OficinaStage } from "@/lib/prospeccao/types";

const SORT_OPTIONS = [
  { value: "recentes", label: "Atualizado recentemente" },
  { value: "nome", label: "Nome (A–Z)" },
  { value: "status", label: "Status" },
  { value: "aderencia", label: "Aderência ICP (Alta primeiro)" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export function OficinasView() {
  const { oficinas, addOficina } = useOficinas();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OficinaStage | "todos">("todos");
  const [icpFilter, setIcpFilter] = useState<AderenciaIcp | "todos">("todos");
  const [sort, setSort] = useState<SortValue>("recentes");
  const [creating, setCreating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [openLeadId, setOpenLeadId] = useState<string | null>(null);

  const visibleOficinas = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = oficinas.filter((oficina) => {
      const matchesQuery =
        !normalizedQuery ||
        oficina.nome.toLowerCase().includes(normalizedQuery) ||
        oficina.whatsapp.toLowerCase().includes(normalizedQuery) ||
        oficina.responsavel.toLowerCase().includes(normalizedQuery) ||
        oficina.cidade.toLowerCase().includes(normalizedQuery);
      const matchesStatus = statusFilter === "todos" || oficina.status === statusFilter;
      const matchesIcp = icpFilter === "todos" || oficina.aderenciaIcp === icpFilter;
      return matchesQuery && matchesStatus && matchesIcp;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "nome") return a.nome.localeCompare(b.nome);
      if (sort === "status") return a.status.localeCompare(b.status);
      if (sort === "aderencia") return ICP_ORDER.indexOf(a.aderenciaIcp) - ICP_ORDER.indexOf(b.aderenciaIcp);
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [oficinas, query, statusFilter, icpFilter, sort]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar oficina, cidade, celular ou responsável..."
            aria-label="Buscar oficina"
            className="border-white/15 bg-white/[0.03] pl-9 text-white placeholder:text-white/40"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OficinaStage | "todos")}
          aria-label="Filtrar por status"
          className="h-9 rounded-md border border-white/15 bg-white/[0.03] px-3 text-sm text-white outline-none focus-visible:border-[var(--client-accent)]"
        >
          <option value="todos">Todos os status</option>
          {STAGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value} className="bg-[#0a0a0a]">
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={icpFilter}
          onChange={(e) => setIcpFilter(e.target.value as AderenciaIcp | "todos")}
          aria-label="Filtrar por aderência ICP"
          className="h-9 rounded-md border border-white/15 bg-white/[0.03] px-3 text-sm text-white outline-none focus-visible:border-[var(--client-accent)]"
        >
          <option value="todos">Toda aderência ICP</option>
          {ICP_OPTIONS.map((option) => (
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

        <div className="ml-auto flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => setImporting(true)} className="gap-2 border-white/15 bg-transparent text-white hover:bg-white/10">
            <Upload className="size-4" />
            Importar oficinas
          </Button>
          <Button type="button" onClick={() => setCreating(true)} className="gap-2 bg-[var(--client-accent)] text-black hover:opacity-90">
            <Plus className="size-4" />
            Nova oficina
          </Button>
        </div>
      </div>

      <OficinaTable oficinas={visibleOficinas} onOpenLead={setOpenLeadId} />

      <OficinaFormDialog open={creating} onOpenChange={setCreating} onSubmit={addOficina} />
      <OficinaImportDialog open={importing} onOpenChange={setImporting} />
      <LeadDetailDrawer oficinaId={openLeadId} onOpenChange={(open) => !open && setOpenLeadId(null)} />
    </div>
  );
}
