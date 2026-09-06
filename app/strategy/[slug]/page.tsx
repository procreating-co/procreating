import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicProposalAction } from "@/lib/comercial/public-proposal-actions";
import { ProposalPublicView } from "@/components/proposal-public/proposal-public-view";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const proposal = await getPublicProposalAction(slug, "strategy");
  if (!proposal) return {};
  return { title: proposal.title, robots: { index: false, follow: false } };
}

/**
 * Experiences (brief "Procreating Experiences") — rota pública do tipo "Strategy", irmã de
 * `/prospecting/[slug]` e `/propostas/[slug]` (presentation). Mesma página fina, mesmo renderer
 * (`ProposalPublicView`) — só passa `"strategy"` como tipo esperado.
 */
export default async function PublicStrategyPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const proposal = await getPublicProposalAction(slug, "strategy");
  if (!proposal) notFound();

  return <ProposalPublicView slug={slug} proposal={proposal} />;
}
