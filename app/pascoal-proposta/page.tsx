import type { Metadata } from "next";
import { pascoalProposal } from "@/content/clients/pascoal/proposal";
import { ProposalPascoalHero } from "@/components/proposal-pascoal/proposal-pascoal-hero";
import { ProposalPascoalServiceSteps } from "@/components/proposal-pascoal/proposal-pascoal-service-steps";
import { ProposalPascoalConfigurator } from "@/components/proposal-pascoal/proposal-pascoal-configurator";

/**
 * Proposta de Continuidade — Pascoal Bombas.
 *
 * URL pública: `/clients/pascoal/public/proposta` (ver rewrite `beforeFiles` em
 * `next.config.mjs`). Rota, componentes (`components/proposal-pascoal/**`) e tipos
 * (`lib/pascoal-proposal/types.ts`) totalmente próprios — zero import de código usado pela
 * Elenita ou de qualquer coisa da Prospecção (`/clients/pascoal/public/prospeccao`, intocada).
 *
 * Estrutura: Hero → "Como Construímos Sua Operação" (timeline de 3 etapas) → Configurador ("Seu
 * Orçamento", com matriz normal de até 2 perfis, Plano Completo como produto à parte, e CTA de
 * WhatsApp).
 */
export const metadata: Metadata = {
  title: pascoalProposal.metaTitle,
  description: pascoalProposal.metaDescription,
  robots: { index: false, follow: false },
};

export default function PascoalPropostaPage() {
  const { accentColor: accent } = pascoalProposal;

  return (
    <main className="min-h-screen bg-black">
      <ProposalPascoalHero content={pascoalProposal.hero} accent={accent} />
      <ProposalPascoalServiceSteps intro={pascoalProposal.servicesIntro} steps={pascoalProposal.serviceSteps} accent={accent} />
      <ProposalPascoalConfigurator content={pascoalProposal} accent={accent} />
    </main>
  );
}
