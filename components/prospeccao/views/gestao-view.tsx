"use client";

import { useMemo, useState } from "react";
import { useOficinas } from "@/components/prospeccao/oficinas-store";
import { LeadDetailDrawer } from "@/components/prospeccao/lead-detail-drawer";
import { IcpBadge } from "@/components/prospeccao/icp-badge";
import { STAGE_DESCRIPTION, STAGE_DOT_CLASSES, STAGE_LABEL, STAGE_ORDER } from "@/lib/prospeccao/stages";
import { ICP_ORDER, ICP_OPTIONS } from "@/lib/prospeccao/icp";
import type { AderenciaIcp, Oficina, OficinaStage } from "@/lib/prospeccao/types";
import { cn } from "@/lib/utils";

function KanbanCard({ oficina, dragging, onOpen }: { oficina: Oficina; dragging: boolean; onOpen: () => void }) {
  return (
    <button
      type="button"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", oficina.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={onOpen}
      className={cn(
        "flex w-full flex-col gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-left transition-all hover:border-white/25 hover:bg-white/[0.06] active:cursor-grabbing",
        dragging && "opacity-30",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="truncate text-sm font-medium text-white">{oficina.nome}</p>
        <IcpBadge value={oficina.aderenciaIcp} className="shrink-0 px-1.5 py-0 text-[10px]" />
      </div>
      <p className="truncate text-xs text-white/50">Responsável: {oficina.responsavel || "-"}</p>
      <p className="truncate text-xs text-white/50">Celular: {oficina.whatsapp || "-"}</p>
    </button>
  );
}

export function GestaoView() {
  const { oficinas, moveOficinaStage } = useOficinas();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<OficinaStage | null>(null);
  const [openLeadId, setOpenLeadId] = useState<string | null>(null);
  const [icpFilter, setIcpFilter] = useState<AderenciaIcp | "todos">("todos");

  const visibleOficinas = useMemo(() => {
    const filtered = icpFilter === "todos" ? oficinas : oficinas.filter((o) => o.aderenciaIcp === icpFilter);
    // Alta aderência primeiro em cada coluna, pra equipe priorizar quem abordar.
    return [...filtered].sort((a, b) => ICP_ORDER.indexOf(a.aderenciaIcp) - ICP_ORDER.indexOf(b.aderenciaIcp));
  }, [oficinas, icpFilter]);

  function handleDrop(stage: OficinaStage) {
    if (draggingId) moveOficinaStage(draggingId, stage);
    setDraggingId(null);
    setDragOverStage(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
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
      </div>

      <div className="-mx-6 flex gap-3 overflow-x-auto px-6 pb-4 lg:-mx-12 lg:px-12">
        {STAGE_ORDER.map((stage) => {
          const columnOficinas = visibleOficinas.filter((o) => o.status === stage);
          const isDragOver = dragOverStage === stage;

          return (
            <div
              key={stage}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverStage(stage);
              }}
              onDragLeave={() => setDragOverStage((current) => (current === stage ? null : current))}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(stage);
              }}
              className={cn(
                "flex w-[280px] shrink-0 flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.015] p-3 transition-colors",
                isDragOver && "border-[var(--client-accent)]/60 bg-[var(--client-accent)]/[0.06]",
              )}
            >
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className={cn("size-2 rounded-full", STAGE_DOT_CLASSES[stage])} />
                  <span className="font-mono text-xs uppercase tracking-wide text-white/70">{STAGE_LABEL[stage]}</span>
                </div>
                <span className="font-mono text-xs text-white/35">{columnOficinas.length}</span>
              </div>
              <p className="px-1 text-[11px] text-white/30">{STAGE_DESCRIPTION[stage]}</p>

              <div className="flex min-h-[80px] flex-col gap-2">
                {columnOficinas.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-white/10 px-3 py-6 text-center text-xs text-white/25">Nenhuma oficina aqui</div>
                ) : (
                  columnOficinas.map((oficina) => (
                    <div key={oficina.id} onDragStart={() => setDraggingId(oficina.id)} onDragEnd={() => setDraggingId(null)}>
                      <KanbanCard oficina={oficina} dragging={draggingId === oficina.id} onOpen={() => setOpenLeadId(oficina.id)} />
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <LeadDetailDrawer oficinaId={openLeadId} onOpenChange={(open) => !open && setOpenLeadId(null)} />
    </div>
  );
}
