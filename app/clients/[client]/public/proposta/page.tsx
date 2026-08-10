import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getClientProposal } from "@/lib/clients/proposal-registry";
import { ProposalHero } from "@/components/proposal/proposal-hero";
import { ProposalGrowthAnimation } from "@/components/proposal/proposal-growth-animation";
import { ProposalPillars } from "@/components/proposal/proposal-pillars";
import { ProposalTvProgram } from "@/components/proposal/proposal-tv-program";
import { ProposalConfigurator } from "@/components/proposal/proposal-configurator";
import { ProposalWhyContinuity } from "@/components/proposal/proposal-why-continuity";
import { ProposalClosing } from "@/components/proposal/proposal-closing";

/**
 * Proposta de Continuidade — rota nova e isolada, irmã de `galeria/` e `prospeccao/` dentro de
 * `/clients/[client]/public/**`. Não depende de `page.tsx` (a Home) nem de
 * `posicionamento-pro-template.tsx` — árvore de componentes própria em `components/proposal/**`,
 * conteúdo próprio em `content/clients/<slug>/proposal.ts`. Hoje só a Elenita tem uma proposta
 * cadastrada; qualquer outro slug cai em notFound(), sem afetar nenhuma rota existente.
 *
 * Pensada pra apresentação AO VIVO — por isso não tem CTA comercial em lugar nenhum; o
 * configurador é a própria ferramenta de apresentação, ajustado na hora.
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

  return (
    <main className="min-h-screen bg-black">
      <ProposalHero content={proposal.hero} accent={accent} />
      <ProposalGrowthAnimation content={proposal.growthAnimation} accent={accent} />
      <ProposalPillars intro={proposal.pillarsIntro} pillars={proposal.pillars} accent={accent} />
      <ProposalTvProgram content={proposal.tvProgram} accent={accent} />
      <ProposalConfigurator content={proposal.configurator} accent={accent} />
      <ProposalWhyContinuity content={proposal.whyContinuity} accent={accent} />
      <ProposalClosing content={proposal.closing} brandName={proposal.brandName} />
    </main>
  );
}
