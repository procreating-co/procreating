"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OficinaFormDialog } from "@/components/prospeccao/oficina-form-dialog";
import { OficinaImportDialog } from "@/components/prospeccao/oficina-import-dialog";
import { OficinaTable, type OficinaSortKey, type SortDir } from "@/components/prospeccao/oficina-table";
import { LeadDetailModal } from "@/components/prospeccao/lead-detail-modal";
import { Pagination } from "@/components/prospeccao/pagination";
import { useOficinas } from "@/components/prospeccao/oficinas-store";
import { STAGE_OPTIONS, STAGE_ORDER } from "@/lib/prospeccao/stages";
import { ICP_OPTIONS } from "@/lib/prospeccao/icp";
import type { AderenciaIcp, Oficina, OficinaStage } from "@/lib/prospeccao/types";

const DEFAULT_PAGE_SIZE = 50;

/** "" (não informado) sempre por último, em qualquer direção — não faz sentido intercalar com A-Z. */
function compareStrings(a: string, b: string, dir: SortDir) {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return dir === "asc" ? a.localeCompare(b) : b.localeCompare(a);
}

function compareByOrder(a: string, b: string, order: string[], dir: SortDir) {
  const diff = order.indexOf(a) - order.indexOf(b);
  return dir === "asc" ? diff : -diff;
}

function compareOficinas(a: Oficina, b: Oficina, key: OficinaSortKey, dir: SortDir) {
  switch (key) {
    case "nome":
      return compareStrings(a.nome, b.nome, dir);
    case "cidade":
      return compareStrings(a.cidade, b.cidade, dir);
    case "whatsapp":
      return compareStrings(a.whatsapp, b.whatsapp, dir);
    case "responsavel":
      return compareStrings(a.responsavel, b.responsavel, dir);
    case "instagram": {
      // Quem tem Instagram vem primeiro (ordem "asc") — é o que a equipe quer pra priorizar
      // contato visual antes do WhatsApp frio. "desc" inverte, útil pra achar quem falta.
      const aHas = Boolean(a.instagram);
      const bHas = Boolean(b.instagram);
      if (aHas !== bHas) {
        const hasFirst = aHas ? -1 : 1;
        return dir === "asc" ? hasFirst : -hasFirst;
      }
      return compareStrings(a.instagram, b.instagram, dir);
    }
    case "status":
      return compareByOrder(a.status, b.status, STAGE_ORDER, dir);
    default:
      return 0;
  }
}

export function OficinasView() {
  const { oficinas, addOficina } = useOficinas();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OficinaStage | "todos">("todos");
  const [icpFilter, setIcpFilter] = useState<AderenciaIcp | "todos">("todos");
  const [sortKey, setSortKey] = useState<OficinaSortKey>("nome");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [creating, setCreating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [openLeadId, setOpenLeadId] = useState<string | null>(null);

  const filteredOficinas = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = oficinas.filter((oficina) => {
      const matchesQuery =
        !normalizedQuery ||
        oficina.nome.toLowerCase().includes(normalizedQuery) ||
        oficina.whatsapp.toLowerCase().includes(normalizedQuery) ||
        oficina.responsavel.toLowerCase().includes(normalizedQuery) ||
        oficina.cidade.toLowerCase().includes(normalizedQuery) ||
        oficina.instagram.toLowerCase().includes(normalizedQuery);
      const matchesStatus = statusFilter === "todos" || oficina.status === statusFilter;
      const matchesIcp = icpFilter === "todos" || oficina.aderenciaIcp === icpFilter;
      return matchesQuery && matchesStatus && matchesIcp;
    });

    return [...filtered].sort((a, b) => compareOficinas(a, b, sortKey, sortDir));
  }, [oficinas, query, statusFilter, icpFilter, sortKey, sortDir]);

  // Filtro, busca ou reordenação muda o resultado — sempre volta pra página 1 pra não ficar
  // preso numa página que não existe mais.
  useEffect(() => {
    setPage(1);
  }, [query, statusFilter, icpFilter, sortKey, sortDir, pageSize]);

  const pageCount = Math.max(1, Math.ceil(filteredOficinas.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleOficinas = filteredOficinas.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function handleSort(key: OficinaSortKey) {
    if (key === sortKey) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

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

      <OficinaTable oficinas={visibleOficinas} onOpenLead={setOpenLeadId} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />

      <Pagination
        page={currentPage}
        pageCount={pageCount}
        onPageChange={setPage}
        totalItems={filteredOficinas.length}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
      />

      <OficinaFormDialog open={creating} onOpenChange={setCreating} onSubmit={addOficina} />
      <OficinaImportDialog open={importing} onOpenChange={setImporting} />
      <LeadDetailModal oficinaId={openLeadId} onOpenChange={(open) => !open && setOpenLeadId(null)} />
    </div>
  );
}
