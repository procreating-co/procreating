import type { Metadata } from "next";
import { pascoalProposal } from "@/content/clients/pascoal/proposal";
import { ProposalPascoalHero } from "@/components/proposal-pascoal/proposal-pascoal-hero";
import { ProposalPascoalPillars } from "@/components/proposal-pascoal/proposal-pascoal-pillars";
import { ProposalPascoalOperacao } from "@/components/proposal-pascoal/proposal-pascoal-operacao";
import { ProposalPascoalAcquisition } from "@/components/proposal-pascoal/proposal-pascoal-acquisition";
import { ProposalPascoalConfigurator } from "@/components/proposal-pascoal/proposal-pascoal-configurator";
import { ProposalPascoalClosing } from "@/components/proposal-pascoal/proposal-pascoal-closing";

/**
 * Proposta de Continuidade — Pascoal Bombas.
 *
 * URL pública: `/clients/pascoal/public/proposta` (ver rewrite `beforeFiles` em
 * `next.config.mjs`). O arquivo físico mora fora de `app/clients/[client]/**` de propósito:
 * aquela árvore é a rota dinâmica compartilhada com a Elenita, e sua árvore de componentes
 * (`components/proposal/**`) segue em evolução ativa por outro agente. A Pascoal tem rota,
 * componentes (`components/proposal-pascoal/**`) e tipos (`lib/pascoal-proposal/types.ts`)
 * totalmente próprios — mesma arquitetura conceitual da Elenita (Hero → O que propomos →
 * Operação → Aquisição → Configurador → Closing), zero import de código usado por ela.
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
      <ProposalPascoalOperacao content={pascoalProposal.operacao} accent={accent} />
      <ProposalPascoalAcquisition content={pascoalProposal.acquisition} accent={accent} />
      <ProposalPascoalConfigurator content={pascoalProposal.configurator} accent={accent} />
      <ProposalPascoalClosing content={pascoalProposal.closing} brandName={pascoalProposal.brandName} />
    </main>
  );
}
