import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProposalForEditor, getProposalOwnerName, listProposalVersions } from "@/lib/comercial/proposal-queries";
import { computeProposalAnalytics } from "@/lib/comercial/proposal-analytics-queries";
import { ProposalEditor } from "@/components/comercial/proposal-editor/proposal-editor";

type Params = { id: string };
type SearchParams = { tab?: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  const proposal = await getProposalForEditor(id);
  return { title: proposal ? `${proposal.title} — Procreating` : "Proposta — Procreating", robots: { index: false, follow: false } };
}

/**
 * Editor de Proposta (`docs/proposal-system-architecture.md`, seção 24) — Admin UI, segue o
 * design do Procreating OS (não tenta imitar a página pública, separação explícita do plano).
 * Rota já protegida pelo gate existente (`proxy.ts` matcher `/comercial/:path*`), sem precisar
 * de nenhuma mudança de infraestrutura de auth.
 *
 * Aba "Analytics" (brief "Procreating Experiences", Fase 6) — `?tab=analytics`, mesmo padrão de
 * `PageTabs` do resto do ERP. Só busca `computeProposalAnalytics` quando essa aba está ativa
 * (nunca no carregamento padrão do Editor) — mesmo princípio de "Meta do mês" na Home: dado real
 * só é buscado quando a tela que o usa está de fato sendo renderizada.
 */
export default async function ProposalEditorPage({ params, searchParams }: { params: Promise<Params>; searchParams: Promise<SearchParams> }) {
  const { id } = await params;
  const { tab } = await searchParams;
  const activeTab = tab === "analytics" ? "analytics" : "editor";

  const [proposal, versions] = await Promise.all([getProposalForEditor(id), listProposalVersions(id)]);
  if (!proposal) notFound();

  const [ownerName, analytics] = await Promise.all([getProposalOwnerName(proposal), activeTab === "analytics" ? computeProposalAnalytics(id) : Promise.resolve(null)]);

  return (
    <main className="mx-auto flex max-w-[900px] flex-col gap-8 px-6 pt-8 pb-16 lg:px-10">
      <ProposalEditor proposal={proposal} ownerName={ownerName} versions={versions} activeTab={activeTab} analytics={analytics} />
    </main>
  );
}
