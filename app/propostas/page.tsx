import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { getSession, ADMIN_LOGIN_PATH } from "@/lib/admin/auth";
import { listAllProposals, listProposalTemplates } from "@/lib/comercial/proposal-queries";
import { listOpenLeads } from "@/lib/comercial/queries";
import { NewExperienceForm } from "@/components/comercial/proposal-panel/new-experience-form";
import { PageTabs, type PageTab } from "@/components/dashboard/page-tabs";
import { StatusDot, type StatusTone } from "@/components/dashboard/status-dot";
import type { ProposalStatus, ProposalType } from "@/lib/supabase/types/database";

export const metadata: Metadata = { title: "Projetos & Propostas — Procreating OS", robots: { index: false, follow: false } };

const STATUS_LABEL: Record<ProposalStatus, string> = {
  draft: "Rascunho",
  sent: "Enviada",
  negotiating: "Em negociação",
  revision_requested: "Revisão pedida",
  accepted: "Aceita",
  rejected: "Recusada",
  expired: "Expirada",
  archived: "Arquivada",
  cancelled: "Cancelada",
};
const STATUS_TONE: Record<ProposalStatus, StatusTone> = {
  draft: "neutral",
  sent: "pending",
  negotiating: "pending",
  revision_requested: "pending",
  accepted: "active",
  rejected: "danger",
  expired: "danger",
  archived: "neutral",
  cancelled: "danger",
};
const TYPE_LABEL: Record<ProposalType, string> = { prospecting: "Projeto", strategy: "Estratégia", presentation: "Proposta" };
const TYPE_TABS: PageTab[] = [
  { key: "all", label: "Todos" },
  { key: "prospecting", label: "Projetos" },
  { key: "presentation", label: "Propostas" },
];

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

/**
 * Hub de Projetos/Propostas (pedido explícito) — "Projetos são pages de prospecção, Propostas
 * são as propostas de venda", ambos criados aqui, ambos podendo vir de um lead do CRM
 * (`listOpenLeads`, mesmo dado que o funil comercial já usa). Filtro por tipo via `PageTabs`
 * (`?type=`, mesmo padrão do resto do ERP) — nenhuma rota nova, só esta página ganhou mais
 * conteúdo. Rota-irmã de `app/propostas/[slug]/page.tsx` (pública, sem auth) na mesma pasta —
 * gate de sessão feito aqui dentro, igual a `app/(internal)/layout.tsx`, mais o check de cookie
 * em `proxy.ts` (entrada literal `/propostas`, sem `:path*`, pra nunca alcançar `/propostas/[slug]`).
 *
 * `admin-shell` (app/globals.css) na raiz — sem `.os-shell` (só existe dentro de `(internal)`),
 * herdaria a serif de exibição do `:root`; `admin-shell` sobrescreve só `--font-family-display`
 * pra sans, nunca cor nenhuma — pedido explícito de nunca usar serif em área interna/admin.
 */
export default async function ProposalsPanelPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const session = await getSession();
  if (!session) redirect(ADMIN_LOGIN_PATH);

  const { type: typeParam } = await searchParams;
  const activeType = TYPE_TABS.some((t) => t.key === typeParam) ? typeParam! : "all";

  const [templates, proposals, leads] = await Promise.all([listProposalTemplates(), listAllProposals(), listOpenLeads()]);
  const filteredProposals = activeType === "all" ? proposals : proposals.filter((p) => p.type === activeType);

  return (
    <main className="admin-shell mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-16">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-3xl">Projetos &amp; Propostas</h1>
        <p className="text-sm text-muted-foreground">Crie uma página de prospecção (Projeto) ou uma proposta comercial (Proposta), vinculada a um lead do CRM ou avulsa.</p>
      </div>

      <NewExperienceForm templates={templates} leads={leads} />

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Existentes</p>
          <PageTabs tabs={TYPE_TABS} activeKey={activeType} paramKey="type" />
        </div>
        {filteredProposals.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nada criado ainda neste filtro.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredProposals.map((proposal) => (
              <div key={proposal.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 px-4 py-3 text-sm">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{proposal.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {TYPE_LABEL[proposal.type]} · Atualizada em {dateFormatter.format(new Date(proposal.updated_at))}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <StatusDot tone={STATUS_TONE[proposal.status]} label={STATUS_LABEL[proposal.status]} />
                  <Link href={`/comercial/propostas/${proposal.id}`} className="text-foreground underline-offset-2 hover:underline">
                    Editar
                  </Link>
                  {proposal.status !== "draft" && (
                    <a
                      href={`/${proposal.type === "prospecting" ? "prospecting" : proposal.type === "strategy" ? "strategy" : "propostas"}/${proposal.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-foreground underline-offset-2 hover:underline"
                    >
                      Pública <ArrowUpRight className="size-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
