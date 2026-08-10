import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getClientProposal } from "@/lib/clients/proposal-registry";
import { ProposalHero } from "@/components/proposal/proposal-hero";
import { ProposalPositioning } from "@/components/proposal/proposal-positioning";
import { ProposalPillars } from "@/components/proposal/proposal-pillars";
import { ProposalConfigurator } from "@/components/proposal/proposal-configurator";
import { ProposalRecommendation } from "@/components/proposal/proposal-recommendation";
import { ProposalInvestmentNote } from "@/components/proposal/proposal-investment-note";
import { ProposalWhyContinuity } from "@/components/proposal/proposal-why-continuity";
import { ProposalClosing } from "@/components/proposal/proposal-closing";

/**
 * Proposta de Continuidade — rota nova e isolada, irmã de `galeria/` e `prospeccao/` dentro de
 * `/clients/[client]/public/**`. Não depende de `page.tsx` (a Home) nem de
 * `posicionamento-pro-template.tsx` — árvore de componentes própria em `components/proposal/**`,
 * conteúdo próprio em `content/clients/<slug>/proposal.ts`. Hoje só a Elenita tem uma proposta
 * cadastrada; qualquer outro slug cai em notFound(), sem afetar nenhuma rota existente.
 */
export async function generateMetadata({ params }: { params: Promise<{ client: string }> }): Promise<Metadata> {
  const { client } = await params;
  const proposal = getClientProposal(client);
  if (!proposal) return {};
  return {
    title: proposal.metaTitle,
    description: proposal.metaDescription,
    robots: { index: false, follow: false },
  };
}

export default async function ProposalPage({ params }: { params: Promise<{ client: string }> }) {
  const { client } = await params;
  const proposal = getClientProposal(client);
  if (!proposal) notFound();

  const accent = proposal.accentColor;
  const recommendedTier = proposal.configurator.videoTiers.find((tier) => tier.recommended) ?? proposal.configurator.videoTiers[0];

  return (
    <main className="min-h-screen bg-black">
      <ProposalHero content={proposal.hero} accent={accent} />
      <ProposalPositioning content={proposal.positioning} accent={accent} />
      <ProposalPillars pillars={proposal.pillars} accent={accent} />
      <ProposalConfigurator content={proposal.configurator} accent={accent} />
      <ProposalRecommendation
        content={proposal.recommendation}
        recommendedTier={{ count: recommendedTier.count, price: recommendedTier.price }}
        includedModuleLabel={proposal.configurator.includedModule.label}
        optionalModuleLabels={proposal.configurator.optionalModules.map((module) => module.label)}
        accent={accent}
      />
      <ProposalInvestmentNote content={proposal.investmentNote} accent={accent} />
      <ProposalWhyContinuity content={proposal.whyContinuity} accent={accent} />
      <ProposalClosing content={proposal.closing} brandName={proposal.brandName} accent={accent} />
    </main>
  );
}
