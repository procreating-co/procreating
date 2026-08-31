import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { getSession, ADMIN_LOGIN_PATH } from "@/lib/admin/auth";
import { listAllProposals, listProposalTemplates } from "@/lib/comercial/proposal-queries";
import { NewProposalPanelForm } from "@/components/comercial/proposal-panel/new-proposal-panel-form";
import { StatusDot, type StatusTone } from "@/components/dashboard/status-dot";
import type { ProposalStatus } from "@/lib/supabase/types/database";

export const metadata: Metadata = { title: "Propostas — Procreating OS", robots: { index: false, follow: false } };

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

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

/**
 * Painel `/propostas` (staff) — hub geral de Propostas, fora do drawer do Lead. Rota-irmã de
 * `app/propostas/[slug]/page.tsx` (pública, sem auth) na mesma pasta — literais e dinâmicos
 * coexistem sem conflito, e como não há um `layout.tsx` compartilhado aqui (só existiria um se
 * este index e o `[slug]` público estivessem sob o MESMO grupo protegido, o que quebraria o
 * `[slug]`), o gate de sessão é feito aqui dentro, igual a `app/(internal)/layout.tsx` — mais o
 * check rápido de cookie em `proxy.ts` (entrada literal `/propostas`, sem `:path*`, pra nunca
 * alcançar `/propostas/[slug]`).
 *
 * Cria uma proposta avulsa (sem lead/cliente) a partir do único Template hoje existente e manda
 * pro editor completo — o resto (as 7 seções) é preenchido lá, nunca aqui.
 */
export default async function ProposalsPanelPage() {
  const session = await getSession();
  if (!session) redirect(ADMIN_LOGIN_PATH);

  const [templates, proposals] = await Promise.all([listProposalTemplates(), listAllProposals()]);
  const template = templates[0];

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-16">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-3xl">Propostas</h1>
        <p className="text-sm text-muted-foreground">Crie uma proposta comercial a partir do template padrão e acompanhe as existentes.</p>
      </div>

      {template ? (
        <NewProposalPanelForm template={template} />
      ) : (
        <p className="text-sm text-destructive">Nenhum template de proposta encontrado — contate o suporte técnico.</p>
      )}

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Existentes</p>
        {proposals.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma proposta criada ainda.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {proposals.map((proposal) => (
              <div key={proposal.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 px-4 py-3 text-sm">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{proposal.title}</span>
                  <span className="text-xs text-muted-foreground">Atualizada em {dateFormatter.format(new Date(proposal.updated_at))}</span>
                </div>
                <div className="flex items-center gap-3">
                  <StatusDot tone={STATUS_TONE[proposal.status]} label={STATUS_LABEL[proposal.status]} />
                  <Link href={`/comercial/propostas/${proposal.id}`} className="text-foreground underline-offset-2 hover:underline">
                    Editar
                  </Link>
                  {proposal.status !== "draft" && (
                    <a href={`/propostas/${proposal.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-foreground underline-offset-2 hover:underline">
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
