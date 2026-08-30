"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusDot, type StatusTone } from "@/components/dashboard/status-dot";
import { NewProposalDialog } from "@/components/comercial/new-proposal-dialog";
import { duplicateProposalAction } from "@/lib/comercial/proposal-actions";
import type { Proposal, ProposalStatus } from "@/lib/supabase/types/database";

const STATUS_LABEL: Record<ProposalStatus, string> = {
  draft: "Rascunho",
  sent: "Enviada",
  negotiating: "Em negociação",
  revision_requested: "Revisão pedida",
  accepted: "Aceita",
  rejected: "Recusada",
  expired: "Expirada",
  archived: "Arquivada",
  cancelled: "Cancelada",
};

const STATUS_TONE: Record<ProposalStatus, StatusTone> = {
  draft: "neutral",
  sent: "pending",
  negotiating: "pending",
  revision_requested: "pending",
  accepted: "active",
  rejected: "danger",
  expired: "danger",
  archived: "neutral",
  cancelled: "danger",
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });

/** "Propostas" no drawer do lead (§16/§25 do plano) — convive com "Orçamentos" (`quotes`), não
 *  substitui (decisão explícita do usuário: manter os dois por enquanto). */
export function LeadProposalsSection({ leadId, ownerName, proposals }: { leadId: string; ownerName: string; proposals: Proposal[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [isPending, startTransition] = useTransition();

  function duplicate(proposalId: string) {
    startTransition(async () => {
      await duplicateProposalAction(proposalId);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3 border-t border-border/60 pt-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Propostas</p>
        <Button type="button" variant="outline" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={() => setCreating(true)}>
          <Plus className="size-3" />
          Nova
        </Button>
      </div>

      {proposals.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nenhuma proposta criada ainda.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {proposals.map((proposal) => (
            <div key={proposal.id} className="flex flex-col gap-2 rounded-lg border border-border/60 px-3 py-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{proposal.title}</span>
                <StatusDot tone={STATUS_TONE[proposal.status]} label={STATUS_LABEL[proposal.status]} />
              </div>
              <span className="text-muted-foreground">
                {proposal.status === "draft" ? "Ainda não enviada" : `${dateFormatter.format(new Date(proposal.updated_at))} · vista ${proposal.view_count}x`}
              </span>
              <div className="flex items-center gap-2">
                <Link href={`/comercial/propostas/${proposal.id}`} className="text-foreground underline-offset-2 hover:underline">
                  Abrir
                </Link>
                {proposal.status !== "draft" && (
                  <a href={`/propostas/${proposal.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-foreground underline-offset-2 hover:underline">
                    Pública <ExternalLink className="size-3" />
                  </a>
                )}
                <button type="button" disabled={isPending} onClick={() => duplicate(proposal.id)} className="text-muted-foreground hover:text-foreground">
                  Duplicar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <NewProposalDialog leadId={leadId} ownerName={ownerName} open={creating} onOpenChange={setCreating} />
    </div>
  );
}
