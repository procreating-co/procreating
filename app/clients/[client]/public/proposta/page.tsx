import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getClientProposal } from "@/lib/clients/proposal-registry";
import { ProposalScrollProgress } from "@/components/proposal/proposal-scroll-progress";
import { ProposalHero } from "@/components/proposal/proposal-hero";
import { ProposalPillars } from "@/components/proposal/proposal-pillars";
import { ProposalRoadmap } from "@/components/proposal/proposal-roadmap";
import { ProposalTvProgram } from "@/components/proposal/proposal-tv-program";
import { ProposalAcquisition } from "@/components/proposal/proposal-acquisition";
import { ProposalBudget } from "@/components/proposal/proposal-budget";
import { ProposalClosing } from "@/components/proposal/proposal-closing";

/**
 * Proposta de Continuidade — rota nova e isolada, irmã de `galeria/` e `prospeccao/` dentro de
 * `/clients/[client]/public/**`. Não depende de `page.tsx` (a Home) nem de
 * `posicionamento-pro-template.tsx` — árvore de componentes própria em `components/proposal/**`,
 * conteúdo próprio em `content/clients/<slug>/proposal.ts`. Hoje só a Elenita tem uma proposta
 * cadastrada; qualquer outro slug cai em notFound(), sem afetar nenhuma rota existente.
 *
 * Pensada pra apresentação AO VIVO — por isso não tem CTA comercial em lugar nenhum. Preço único
 * (ProposalBudget) — a seção de upsell com total variável foi removida a pedido do cliente.
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
      <ProposalScrollProgress accent={accent} />
      <ProposalHero content={proposal.hero} accent={accent} />
      <ProposalPillars intro={proposal.pillarsIntro} pillars={proposal.pillars} accent={accent} />
      <ProposalRoadmap content={proposal.roadmap} accent={accent} />
      <ProposalTvProgram content={proposal.tvProgram} accent={accent} />
      <ProposalAcquisition content={proposal.acquisition} accent={accent} />
      <ProposalBudget content={proposal.budget} accent={accent} />
      <ProposalClosing content={proposal.closing} brandName={proposal.brandName} />
    </main>
  );
}
