"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OnboardingModal } from "@/components/onboarding/onboarding-modal";
import { getAcceptedProposalPayloadAction, getLeadForProposalAction, markLeadConvertedFromProposalAction } from "@/lib/comercial/proposal-actions";
import type { LeadWithRelations } from "@/lib/comercial/types";
import type { ProposalAcceptedPayload } from "@/lib/comercial/proposal-actions";

/**
 * "Converter em cliente" (§10.2 do plano) — só aparece quando `status = accepted`. Busca o lead
 * + o payload da seção Investimento da VERSÃO ACEITA, e abre o `OnboardingModal` já existente
 * (`components/onboarding/onboarding-modal.tsx`, intocado) pré-preenchido — reaproveita
 * `close_lead_and_create_client` (RPC) exatamente como o fluxo normal de "Fechar negócio" no
 * Kanban, nunca duplica a lógica de conversão.
 */
export function ConvertProposalDialog({ proposalId, leadId, open, onOpenChange }: { proposalId: string; leadId: string | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [lead, setLead] = useState<LeadWithRelations | null>(null);
  const [payload, setPayload] = useState<ProposalAcceptedPayload | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !leadId) return;
    setLoading(true);
    Promise.all([getLeadForProposalAction(leadId), getAcceptedProposalPayloadAction(proposalId)]).then(([leadResult, payloadResult]) => {
      setLead(leadResult);
      setPayload(payloadResult);
      setLoading(false);
    });
  }, [open, leadId, proposalId]);

  if (!leadId) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Sem lead vinculado</DialogTitle>
            <DialogDescription>Esta proposta não tem um lead de origem — conversão manual pela tela de Clientes.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  if (loading || !lead) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Carregando...</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <OnboardingModal
      lead={lead}
      open={open}
      onOpenChange={onOpenChange}
      proposalOverrides={payload ?? undefined}
      onSuccess={(clientId) => {
        markLeadConvertedFromProposalAction(proposalId, clientId).then(() => {
          router.push(`/clientes/${clientId}`);
        });
      }}
    />
  );
}
