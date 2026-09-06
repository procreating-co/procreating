import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicProposalAction } from "@/lib/comercial/public-proposal-actions";
import { ProposalPublicView } from "@/components/proposal-public/proposal-public-view";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const proposal = await getPublicProposalAction(slug, "prospecting");
  if (!proposal) return {};
  return { title: proposal.title, robots: { index: false, follow: false } };
}

/**
 * Experiences (brief "Procreating Experiences") — rota pública do tipo "Prospecting", irmã de
 * `/propostas/[slug]` (que continua sendo a rota de "presentation", decisão §6 do brief: um slug
 * já real e aberto 28 vezes não troca de URL só por padronização de nome). Mesma página fina,
 * mesmo renderer (`ProposalPublicView`) — só passa `"prospecting"` como tipo esperado pro
 * `get_public_proposal` recusar (404) um slug que na verdade é de outro tipo, mesmo que
 * tecnicamente exista (slug é único globalmente, mas o PREFIXO da URL importa).
 *
 * Nota — "Prospecção" já é usado com outro significado em 2 lugares do código
 * (`components/prospeccao/prospeccao-experience.tsx`, a Central de Prospecção do Client Hub; e
 * `components/comercial/prospeccao-view.tsx`, uma view do CRM) — nenhum dos dois tem relação com
 * esta rota. "Prospecting" aqui é só o tipo de Experience (`ProposalType`), nunca renderiza nem
 * importa nada desses dois componentes.
 */
export default async function PublicProspectingPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const proposal = await getPublicProposalAction(slug, "prospecting");
  if (!proposal) notFound();

  return <ProposalPublicView slug={slug} proposal={proposal} />;
}
