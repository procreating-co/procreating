import type { Metadata } from "next";
import { pascoalProposal } from "@/content/clients/pascoal/proposal";
import { ProposalPascoalHero } from "@/components/proposal-pascoal/proposal-pascoal-hero";
import { ProposalPascoalGrowthAnimation } from "@/components/proposal-pascoal/proposal-pascoal-growth-animation";
import { ProposalPascoalPillars } from "@/components/proposal-pascoal/proposal-pascoal-pillars";
import { ProposalPascoalConfigurator } from "@/components/proposal-pascoal/proposal-pascoal-configurator";
import { ProposalPascoalWhyContinuity } from "@/components/proposal-pascoal/proposal-pascoal-why-continuity";
import { ProposalPascoalClosing } from "@/components/proposal-pascoal/proposal-pascoal-closing";

/**
 * Proposta de Continuidade — Pascoal Bombas.
 *
 * URL pública: `/clients/pascoal/public/proposta` (ver rewrite em `next.config.js`). O arquivo
 * físico mora fora de `app/clients/[client]/**` de propósito: aquela árvore é a rota dinâmica
 * compartilhada por todo cliente (inclui a Elenita) e, no momento em que esta página foi criada,
 * `app/clients/[client]/public/proposta/page.tsx` e `components/proposal/**` estavam em edição
 * simultânea por outro agente (import quebrado, tipos em transição). Pra Pascoal nunca depender
 * desse estado intermediário nem competir por escrita nos mesmos arquivos, a Proposta de
 * Continuidade da Pascoal ganhou rota, componentes (`components/proposal-pascoal/**`) e tipos
 * (`lib/pascoal-proposal/types.ts`) totalmente próprios — zero import de código usado pela
 * Elenita.
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
      <ProposalPascoalGrowthAnimation content={pascoalProposal.growthAnimation} accent={accent} />
      <ProposalPascoalPillars intro={pascoalProposal.pillarsIntro} pillars={pascoalProposal.pillars} accent={accent} />
      <ProposalPascoalConfigurator content={pascoalProposal.configurator} accent={accent} />
      <ProposalPascoalWhyContinuity content={pascoalProposal.whyContinuity} accent={accent} />
      <ProposalPascoalClosing content={pascoalProposal.closing} brandName={pascoalProposal.brandName} accent={accent} />
    </main>
  );
}
