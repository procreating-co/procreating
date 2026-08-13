"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { moveLeadStageAction } from "@/lib/comercial/actions";
import { stageColorClasses } from "@/lib/comercial/stage-colors";
import { LeadDetailDialog } from "@/components/comercial/lead-detail-dialog";
import { OnboardingModal } from "@/components/onboarding/onboarding-modal";
import type { LeadWithRelations, PipelineStage } from "@/lib/comercial/types";
import type { User } from "@/lib/supabase/types/database";
import { cn } from "@/lib/utils";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

function LeadCard({ lead, dragging, onOpen }: { lead: LeadWithRelations; dragging: boolean; onOpen: () => void }) {
  return (
    <button
      type="button"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", lead.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={onOpen}
      className={cn(
        "flex w-full flex-col gap-1.5 rounded-lg border border-border/60 bg-card/60 p-3 text-left transition-all hover:border-border hover:bg-card active:cursor-grabbing",
        dragging && "opacity-30",
      )}
    >
      <p className="truncate text-sm font-medium">{lead.company_name}</p>
      <p className="truncate text-xs text-muted-foreground">{lead.contact_name || "Sem contato definido"}</p>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{lead.potential_value != null ? currencyFormatter.format(lead.potential_value) : "—"}</span>
        {lead.strategy && <span className="truncate">{lead.strategy.name}</span>}
      </div>
    </button>
  );
}

export function PipelineBoard({ leads, stages, users }: { leads: LeadWithRelations[]; stages: PipelineStage[]; users: User[] }) {
  const router = useRouter();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverStageId, setDragOverStageId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [onboardingLeadId, setOnboardingLeadId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const byStage = useMemo(() => {
    const map = new Map<string, LeadWithRelations[]>();
    for (const stage of stages) map.set(stage.id, []);
    for (const lead of leads) map.get(lead.stage_id)?.push(lead);
    return map;
  }, [leads, stages]);

  const selected = leads.find((lead) => lead.id === selectedId) ?? null;
  const onboardingLead = leads.find((lead) => lead.id === onboardingLeadId) ?? null;

  function handleDrop(stage: PipelineStage) {
    const leadId = draggingId;
    setDraggingId(null);
    setDragOverStageId(null);
    if (!leadId) return;

    const lead = leads.find((item) => item.id === leadId);
    if (!lead || lead.stage_id === stage.id) return;

    if (stage.is_won) {
      // Fechar negócio precisa dos dados do cliente — abre o modal em vez de mover o card
      // direto (ver lib/comercial/actions.ts, moveLeadStageAction). O estágio só muda de
      // verdade quando o modal é confirmado; cancelar não altera nada, o card volta sozinho.
      setOnboardingLeadId(lead.id);
      return;
    }

    startTransition(async () => {
      await moveLeadStageAction(leadId, stage.id);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="-mx-6 flex gap-3 overflow-x-auto px-6 pb-4 lg:-mx-10 lg:px-10">
        {stages.map((stage) => {
          const columnLeads = byStage.get(stage.id) ?? [];
          const colors = stageColorClasses(stage.color);
          const isDragOver = dragOverStageId === stage.id;

          return (
            <div
              key={stage.id}
              data-stage-key={stage.key}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverStageId(stage.id);
              }}
              onDragLeave={() => setDragOverStageId((current) => (current === stage.id ? null : current))}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(stage);
              }}
              className={cn(
                "flex w-[280px] shrink-0 flex-col gap-3 rounded-xl border border-border/60 bg-card/10 p-3 transition-colors",
                isDragOver && "border-foreground/40 bg-card/30",
              )}
            >
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className={cn("size-2 rounded-full", colors.dot)} />
                  <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">{stage.label}</span>
                </div>
                <span className="font-mono text-xs text-muted-foreground/60">{columnLeads.length}</span>
              </div>

              <div className="flex min-h-[80px] flex-col gap-2">
                {columnLeads.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border/60 px-3 py-6 text-center text-xs text-muted-foreground/50">Nenhum lead aqui</div>
                ) : (
                  columnLeads.map((lead) => (
                    <div key={lead.id} onDragStart={() => setDraggingId(lead.id)} onDragEnd={() => setDraggingId(null)}>
                      <LeadCard lead={lead} dragging={draggingId === lead.id} onOpen={() => setSelectedId(lead.id)} />
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isPending && <p className="text-xs text-muted-foreground">Movendo...</p>}

      <LeadDetailDialog lead={selected} users={users} onOpenChange={(open) => !open && setSelectedId(null)} />

      {onboardingLead && (
        <OnboardingModal
          lead={onboardingLead}
          open={onboardingLeadId !== null}
          onOpenChange={(open) => !open && setOnboardingLeadId(null)}
          onSuccess={(clientId) => {
            setOnboardingLeadId(null);
            router.push(`/clientes/${clientId}`);
          }}
        />
      )}
    </div>
  );
}
