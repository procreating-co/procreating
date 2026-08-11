"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;

export type PaginationProps = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
};

/** Janela de páginas a mostrar — primeira, última, atual ±1, com "…" nos buracos. */
function pageWindow(page: number, pageCount: number): (number | "gap")[] {
  const items = new Set<number>([1, pageCount, page, page - 1, page + 1]);
  const sorted = [...items].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);

  const result: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - (sorted[i - 1] as number) > 1) result.push("gap");
    result.push(p);
  });
  return result;
}

/**
 * Paginação genérica — Oficinas é a primeira a usar (306 registros de uma vez era demais numa
 * página só), mas serve qualquer lista grande da Central.
 */
export function Pagination({ page, pageCount, onPageChange, totalItems, pageSize, onPageSizeChange }: PaginationProps) {
  if (totalItems === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-1 pt-3">
      <div className="flex items-center gap-3 text-xs text-white/40">
        <span>
          {start}–{end} de {totalItems}
        </span>
        <label className="flex items-center gap-1.5">
          <span className="hidden sm:inline">Por página</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            aria-label="Oficinas por página"
            className="h-7 rounded-md border border-white/15 bg-white/[0.03] px-2 text-xs text-white outline-none focus-visible:border-[var(--client-accent)]"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size} className="bg-[#0a0a0a]">
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            aria-label="Página anterior"
            className="flex size-7 items-center justify-center rounded-md border border-white/15 text-white/60 transition-colors hover:border-white/30 hover:text-white disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft className="size-4" />
          </button>

          {pageWindow(page, pageCount).map((item, i) =>
            item === "gap" ? (
              <span key={`gap-${i}`} className="px-1 text-xs text-white/30">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                aria-current={item === page}
                className={cn(
                  "flex size-7 items-center justify-center rounded-md font-mono text-xs transition-colors",
                  item === page ? "bg-[var(--client-accent)] text-black" : "text-white/60 hover:bg-white/10 hover:text-white",
                )}
              >
                {item}
              </button>
            ),
          )}

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page === pageCount}
            aria-label="Próxima página"
            className="flex size-7 items-center justify-center rounded-md border border-white/15 text-white/60 transition-colors hover:border-white/30 hover:text-white disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
