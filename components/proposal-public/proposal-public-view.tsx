"use client";

import { useEffect, useState, useTransition } from "react";
import { recordProposalViewAction, respondPublicProposalAction, type PublicProposal } from "@/lib/comercial/public-proposal-actions";
import { ProposalScrollProgress } from "@/components/proposal/proposal-scroll-progress";
import { ProposalHero } from "@/components/proposal/proposal-hero";
import { ProposalPillars } from "@/components/proposal/proposal-pillars";
import { ProposalRoadmap } from "@/components/proposal/proposal-roadmap";
import { ProposalTvProgram } from "@/components/proposal/proposal-tv-program";
import { ProposalAcquisition } from "@/components/proposal/proposal-acquisition";
import { ProposalBudget } from "@/components/proposal/proposal-budget";
import { ProposalClosing } from "@/components/proposal/proposal-closing";
import type {
  HeroContent,
  PillarsContent,
  RoadmapContent,
  TvProgramContent,
  AcquisitionContent,
  BudgetContent,
  ClosingContent,
} from "@/lib/comercial/proposal-content-types";

const RESPONDABLE_STATUSES = new Set(["sent", "negotiating", "revision_requested"]);

/**
 * Página pública genérica de Proposta — usa os MESMOS componentes visuais da Proposta de
 * Continuidade da Elenita (`components/proposal/**`, intocados), não uma reimplementação.
 * A Elenita deixou de ser uma rota hardcoded e virou apenas a primeira Proposal usando este
 * template (`/propostas/elenita-luzardo`); qualquer outro slug renderiza a mesma árvore de
 * componentes com dados diferentes.
 *
 * `sectionContent` busca cada seção pelo `sectionType` no array vindo de `get_public_proposal` —
 * uma proposta sempre tem as 7 (o template as inclui no blueprint), mas o lookup é defensivo:
 * uma seção ausente/oculta simplesmente não renderiza, em vez de quebrar a página inteira.
 */
export function ProposalPublicView({ slug, proposal }: { slug: string; proposal: NonNullable<PublicProposal> }) {
  const [status, setStatus] = useState(proposal.status);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    recordProposalViewAction(slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function respond(response: "accepted" | "rejected") {
    startTransition(async () => {
      const ok = await respondPublicProposalAction(slug, response);
      if (ok) setStatus(response);
    });
  }

  const accent = proposal.accentColor || "#D4AF37";

  function content<T>(type: string): T | null {
    return (proposal.sections.find((s) => s.sectionType === type)?.content as T) ?? null;
  }

  const hero = content<HeroContent>("hero");
  const pillars = content<PillarsContent>("pillars");
  const roadmap = content<RoadmapContent>("roadmap");
  const tvProgram = content<TvProgramContent>("tv_program");
  const acquisition = content<AcquisitionContent>("acquisition");
  const budget = content<BudgetContent>("budget");
  const closing = content<ClosingContent>("closing");

  return (
    <main className="min-h-screen bg-black">
      <ProposalScrollProgress accent={accent} />
      {hero && <ProposalHero content={hero} accent={accent} />}
      {pillars && <ProposalPillars intro={pillars.intro} pillars={pillars.pillars} accent={accent} />}
      {roadmap && <ProposalRoadmap content={roadmap} accent={accent} />}
      {tvProgram && <ProposalTvProgram content={tvProgram} accent={accent} />}
      {acquisition && <ProposalAcquisition content={acquisition} accent={accent} />}
      {budget && <ProposalBudget content={budget} accent={accent} />}
      {closing && <ProposalClosing content={closing} brandName={proposal.brandName} />}

      {/* Resposta pública — aditivo, fora das 7 seções da Elenita (nunca dentro delas). Só
          aparece quando a proposta ainda pode ser respondida; depois de aceita/recusada, vira
          uma confirmação simples. */}
      {(status === "accepted" || status === "rejected" || RESPONDABLE_STATUSES.has(status)) && (
        <div className="border-t border-white/10 bg-black px-6 py-16 text-center text-white lg:px-12">
          {status === "accepted" ? (
            <p className="text-lg" style={{ color: accent }}>
              Proposta aceita — em breve entraremos em contato.
            </p>
          ) : status === "rejected" ? (
            <p className="text-lg text-white/60">Proposta recusada.</p>
          ) : (
            <div className="flex flex-wrap justify-center gap-4">
              <button
                type="button"
                disabled={isPending}
                onClick={() => respond("accepted")}
                className="rounded-full px-8 py-3 text-sm font-medium text-black transition-transform hover:scale-[1.02]"
                style={{ backgroundColor: accent }}
              >
                Aceitar proposta
              </button>
              <button type="button" disabled={isPending} onClick={() => respond("rejected")} className="rounded-full border border-white/20 px-8 py-3 text-sm text-white/70 hover:text-white">
                Recusar
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
