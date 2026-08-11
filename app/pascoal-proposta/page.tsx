import type { Metadata } from "next";
import { pascoalProposal } from "@/content/clients/pascoal/proposal";
import { ProposalPascoalHero } from "@/components/proposal-pascoal/proposal-pascoal-hero";
import { ProposalPascoalPillars } from "@/components/proposal-pascoal/proposal-pascoal-pillars";
import { ProposalPascoalMethodology } from "@/components/proposal-pascoal/proposal-pascoal-methodology";
import { ProposalPascoalConfigurator } from "@/components/proposal-pascoal/proposal-pascoal-configurator";
import { ProposalPascoalClosing } from "@/components/proposal-pascoal/proposal-pascoal-closing";

/**
 * Proposta de Continuidade — Pascoal Bombas.
 *
 * URL pública: `/clients/pascoal/public/proposta` (ver rewrite `beforeFiles` em
 * `next.config.mjs`). Rota, componentes (`components/proposal-pascoal/**`) e tipos
 * (`lib/pascoal-proposal/types.ts`) totalmente próprios — zero import de código usado pela
 * Elenita (`components/proposal/**`, `lib/clients/proposal-types.ts`).
 *
 * Estrutura (atualização cirúrgica — "Operação de conteúdo" e "Estratégia de aquisição" foram
 * removidas e substituídas pelos 3 blocos de metodologia):
 * Hero → Nossos serviços (pilares) → Metodologia (Assessoria/Posicionamento/Aquisição) →
 * Configurador → Closing.
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
      <ProposalPascoalPillars intro={pascoalProposal.pillarsIntro} pillars={pascoalProposal.pillars} accent={accent} />
      <ProposalPascoalMethodology blocks={pascoalProposal.methodology} accent={accent} />
      <ProposalPascoalConfigurator content={pascoalProposal.configurator} accent={accent} />
      <ProposalPascoalClosing content={pascoalProposal.closing} brandName={pascoalProposal.brandName} />
    </main>
  );
}
