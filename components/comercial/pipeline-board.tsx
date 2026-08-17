"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { deleteLeadAction, moveLeadStageAction } from "@/lib/comercial/actions";
import { stageColorClasses } from "@/lib/comercial/stage-colors";
import { LeadDetailDrawer } from "@/components/comercial/lead-detail-drawer";
import { OnboardingModal } from "@/components/onboarding/onboarding-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { todayISO } from "@/lib/date";
import type { LeadWithRelations, PipelineStage } from "@/lib/comercial/types";
import type { User } from "@/lib/supabase/types/database";
import { cn } from "@/lib/utils";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

/** "Próxima ação" do card — só aparece se `next_contact_at` existir de verdade (nunca inventado).
 *  Atrasado = tom `danger` (chama atenção sem precisar ler a data), hoje/futuro = neutro.
 *
 *  Automação §72 regra 2 ("lead sem contato há N dias → marcar como atrasado") — a condição
 *  explícita é "lead não está em estágio terminal" (`is_won`/`is_lost`); sem isso, um negócio já
 *  Fechado ou Perdido com `next_contact_at` antigo mostrava "Atrasado" igual a um lead ativo —
 *  sinalização errada, corrigida aqui (terminal nunca mostra "próxima ação", faz sentido: não há
 *  mais ação nenhuma a fazer). Preferi computar isto ao vivo (sempre no estado real) a uma
 *  "rotina diária" armazenada — não existe infra de cron neste projeto ainda, e um flag
 *  recalculado a cada carregamento nunca fica desatualizado por até 24h como um batch ficaria. */
function nextActionLabel(nextContactAt: string | null, isTerminalStage: boolean): { label: string; overdue: boolean } | null {
  if (!nextContactAt || isTerminalStage) return null;
  const dateOnly = nextContactAt.slice(0, 10);
  const today = todayISO();
  if (dateOnly < today) return { label: "Atrasado", overdue: true };
  if (dateOnly === today) return { label: "Hoje", overdue: false };
  return { label: new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date(`${dateOnly}T00:00:00`)), overdue: false };
}

function OwnerChip({ owner }: { owner: User | undefined }) {
  if (!owner) return null;
  return (
    <span
      title={owner.name}
      className="flex size-5 shrink-0 items-center justify-center rounded-full bg-foreground/10 font-mono text-[9px] uppercase text-muted-foreground"
    >
      {owner.name.slice(0, 2)}
    </span>
  );
}

/** Card compacto — só Empresa / Valor / Responsável / Próxima ação (o resto — contato, estratégia
 *  — mora no drawer de detalhe ou já está implícito no filtro ativo). Antes tinha 4 linhas
 *  (empresa/contato/valor+estratégia), difícil escanear uma coluna inteira de relance.
 *
 *  Era um `<button>` só — virou `<div draggable>` com um `<button>` de conteúdo (abre o drawer)
 *  e um `<button>` de × separado (exclui) porque HTML não permite botão dentro de botão; o ×
 *  chama `stopPropagation` pra não também abrir o drawer de leve. */
function LeadCard({ lead, owner, dragging, onOpen, onRequestDelete }: { lead: LeadWithRelations; owner: User | undefined; dragging: boolean; onOpen: () => void; onRequestDelete: () => void }) {
  const nextAction = nextActionLabel(lead.next_contact_at, lead.stage.is_won || lead.stage.is_lost);
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", lead.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      className={cn(
        "group relative flex w-full flex-col gap-2 rounded-lg border border-border/60 bg-kanban-card p-3 transition-all hover:border-border hover:bg-kanban-card-hover active:cursor-grabbing",
        dragging && "opacity-30",
      )}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRequestDelete();
        }}
        aria-label={`Excluir ${lead.company_name}`}
        className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded text-muted-foreground/50 opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
      >
        <X className="size-3.5" />
      </button>
      <button type="button" onClick={onOpen} className="flex flex-col gap-2 pr-4 text-left">
        <p className="truncate text-sm font-medium">{lead.company_name}</p>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">{lead.potential_value != null ? currencyFormatter.format(lead.potential_value) : "—"}</span>
          <OwnerChip owner={owner} />
        </div>
        {nextAction && <span className={cn("text-[11px]", nextAction.overdue ? "text-danger" : "text-muted-foreground")}>{nextAction.label}</span>}
      </button>
    </div>
  );
}

export function PipelineBoard({ leads, stages, users }: { leads: LeadWithRelations[]; stages: PipelineStage[]; users: User[] }) {
  const router = useRouter();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverStageId, setDragOverStageId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [onboardingLeadId, setOnboardingLeadId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const userById = useMemo(() => new Map(users.map((user) => [user.id, user])), [users]);

  const byStage = useMemo(() => {
    const map = new Map<string, LeadWithRelations[]>();
    for (const stage of stages) map.set(stage.id, []);
    for (const lead of leads) map.get(lead.stage_id)?.push(lead);
    return map;
  }, [leads, stages]);

  const selected = leads.find((lead) => lead.id === selectedId) ?? null;
  const onboardingLead = leads.find((lead) => lead.id === onboardingLeadId) ?? null;
  const deletingLead = leads.find((lead) => lead.id === deletingId) ?? null;

  // Auditoria de estados de erro (hardening) — os dois abaixo eram "dispara e esquece": se a
  // Server Action falhasse (rede, RLS), o card só voltava sozinho no refresh sem explicar por
  // quê — pior ainda no drag-and-drop, onde o usuário acabou de arrastar fisicamente o card.
  function handleDelete() {
    if (!deletingId) return;
    setError(null);
    startDeleteTransition(async () => {
      const result = await deleteLeadAction(deletingId);
      if (!result.ok) setError(result.error);
      setDeletingId(null);
      router.refresh();
    });
  }

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

    setError(null);
    startTransition(async () => {
      const result = await moveLeadStageAction(leadId, stage.id);
      if (!result.ok) setError(result.error);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* `scrollbar-hide` (app/globals.css) — rolagem horizontal continua funcionando via
       *  trackpad/wheel, só a barra visual nativa some (era "uma barra enorme e desagradável"
       *  com 8+ estágios). `snap-x`/`snap-mandatory` + `snap-start` por coluna deixam a rolagem
       *  presa em cada coluna, em vez de parar em qualquer ponto intermediário. */}
      <div className="scrollbar-hide -mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto bg-kanban-board px-6 py-3 lg:-mx-10 lg:px-10">
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
                "flex w-[240px] shrink-0 snap-start flex-col gap-3 rounded-xl border border-border/60 bg-kanban-column p-3 transition-colors",
                isDragOver && "border-foreground/40 bg-kanban-card-hover",
              )}
            >
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className={cn("size-2 rounded-full", colors.dot)} />
                  {stage.is_won ? (
                    // Minimalismo (auditoria de texto) — "soltar aqui abre o onboarding" era uma
                    // frase permanente no topo da página inteira; virou tooltip só no estágio a
                    // que ela se refere de fato, some quando não precisa dela.
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground underline decoration-dotted underline-offset-4">
                          {stage.label}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>Soltar um card aqui abre o onboarding do cliente.</TooltipContent>
                    </Tooltip>
                  ) : (
                    <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">{stage.label}</span>
                  )}
                </div>
                <span className="font-mono text-xs text-muted-foreground/60">{columnLeads.length}</span>
              </div>

              <div className="flex min-h-[80px] flex-col gap-2">
                {columnLeads.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border/60 px-3 py-6 text-center text-xs text-muted-foreground/50">Nenhum lead aqui</div>
                ) : (
                  columnLeads.map((lead) => (
                    <div key={lead.id} onDragStart={() => setDraggingId(lead.id)} onDragEnd={() => setDraggingId(null)}>
                      <LeadCard
                        lead={lead}
                        owner={lead.owner_id ? userById.get(lead.owner_id) : undefined}
                        dragging={draggingId === lead.id}
                        onOpen={() => setSelectedId(lead.id)}
                        onRequestDelete={() => setDeletingId(lead.id)}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isPending && <p className="text-xs text-muted-foreground">Movendo...</p>}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <LeadDetailDrawer lead={selected} users={users} stages={stages} onOpenChange={(open) => !open && setSelectedId(null)} />

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

      <ConfirmDialog
        open={deletingId !== null}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Excluir lead?"
        description={deletingLead ? `"${deletingLead.company_name}" some do Pipeline — não dá pra desfazer.` : undefined}
        isPending={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
