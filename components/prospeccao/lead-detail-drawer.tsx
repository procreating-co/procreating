"use client";

import { SideDrawer, SideDrawerContent } from "@/components/prospeccao/side-drawer";
import { useLeadFicha, LeadFichaBody } from "@/components/prospeccao/lead-ficha";
import { useOficinas } from "@/components/prospeccao/oficinas-store";

export type LeadDetailDrawerProps = {
  oficinaId: string | null;
  onOpenChange: (open: boolean) => void;
};

/**
 * Ficha de CRM em drawer lateral — usada pelo Kanban de Gestão, onde faz sentido continuar
 * vendo as colunas atrás. Lê e escreve no MESMO registro via `useOficinas()`; a versão em
 * página inteira (`lead-detail-modal.tsx`, usada em Oficinas) mostra o mesmo conteúdo
 * (`LeadFichaBody`), só a moldura muda.
 */
export function LeadDetailDrawer({ oficinaId, onOpenChange }: LeadDetailDrawerProps) {
  const { oficinas } = useOficinas();
  const oficina = oficinas.find((o) => o.id === oficinaId) ?? null;
  const ficha = useLeadFicha(oficina);

  if (!oficina) return null;

  return (
    <SideDrawer open={oficina !== null} onOpenChange={onOpenChange}>
      <SideDrawerContent>
        <LeadFichaBody oficina={oficina} ficha={ficha} onDeleted={() => onOpenChange(false)} />
      </SideDrawerContent>
    </SideDrawer>
  );
}
