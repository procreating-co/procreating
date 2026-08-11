"use client";

import { ArrowLeft } from "lucide-react";
import { FullPageModal, FullPageModalContent } from "@/components/prospeccao/full-page-modal";
import { useLeadFicha, LeadFichaBody } from "@/components/prospeccao/lead-ficha";
import { useOficinas } from "@/components/prospeccao/oficinas-store";

export type LeadDetailModalProps = {
  oficinaId: string | null;
  onOpenChange: (open: boolean) => void;
};

/**
 * Ficha de CRM em página inteira — usada em Oficinas (clicar no nome abre isto, não um
 * drawer lateral). Mesmo conteúdo do drawer de Gestão (`LeadFichaBody`), só a moldura muda.
 */
export function LeadDetailModal({ oficinaId, onOpenChange }: LeadDetailModalProps) {
  const { oficinas } = useOficinas();
  const oficina = oficinas.find((o) => o.id === oficinaId) ?? null;
  const ficha = useLeadFicha(oficina);

  if (!oficina) return null;

  return (
    <FullPageModal open={oficina !== null} onOpenChange={onOpenChange}>
      <FullPageModalContent>
        <div className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-8 lg:px-0">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Voltar para a lista de oficinas"
            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] text-white/70 transition-colors hover:border-[var(--client-accent)] hover:text-[var(--client-accent)]"
          >
            <ArrowLeft className="size-5" />
          </button>

          <LeadFichaBody oficina={oficina} ficha={ficha} onDeleted={() => onOpenChange(false)} />
        </div>
      </FullPageModalContent>
    </FullPageModal>
  );
}
