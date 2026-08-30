import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicProposalAction } from "@/lib/comercial/public-proposal-actions";
import { ProposalPublicView } from "@/components/proposal-public/proposal-public-view";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const proposal = await getPublicProposalAction(slug);
  if (!proposal) return {};
  return { title: proposal.title, robots: { index: false, follow: false } };
}

/**
 * Página pública de Proposta (`docs/proposal-system-architecture.md`, §11/§15) — rota nova, fora
 * de `/admin`, `/comercial` e `/clients/**` (namespace próprio, deliberado). Sem autenticação —
 * o lead não tem conta no ERP. Segurança é o filtro de `status` já embutido em
 * `get_public_proposal()` (nunca dois passos separados): uma Proposal em draft/archived/
 * cancelled nunca chega até aqui, sempre 404.
 */
export default async function PublicProposalPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const proposal = await getPublicProposalAction(slug);
  if (!proposal) notFound();

  return <ProposalPublicView slug={slug} proposal={proposal} />;
}
