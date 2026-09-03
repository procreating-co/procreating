"use client";

import { useEffect, useState, useTransition } from "react";
import { MotionConfig } from "framer-motion";
import { recordProposalViewAction, respondPublicProposalAction, type PublicProposal } from "@/lib/comercial/public-proposal-actions";
import { ProposalScrollProgress } from "@/components/proposal/proposal-scroll-progress";
import { ProposalHero } from "@/components/proposal/proposal-hero";
import { ProposalPillars } from "@/components/proposal/proposal-pillars";
import { ProposalRoadmap } from "@/components/proposal/proposal-roadmap";
import { ProposalTvProgram } from "@/components/proposal/proposal-tv-program";
import { ProposalAcquisition } from "@/components/proposal/proposal-acquisition";
import { ProposalBudget } from "@/components/proposal/proposal-budget";
import { ProposalPortfolio } from "@/components/proposal/proposal-portfolio";
import { ProposalClosing } from "@/components/proposal/proposal-closing";
import type {
  HeroContent,
  PillarsContent,
  RoadmapContent,
  TvProgramContent,
  AcquisitionContent,
  BudgetContent,
  PortfolioContent,
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
  const portfolio = content<PortfolioContent>("portfolio");
  const closing = content<ClosingContent>("closing");

  // Pedido explícito: só "Aceitar" — sem botão de recusar na página pública (recusar continua
  // possível pelo status manual no editor; `respondPublicProposalAction("rejected")` segue
  // existindo no backend, só não tem gatilho aqui). `whatsappOnAccept` (opcional, hoje só a
  // Priscilla preenche) abre o WhatsApp do visitante já endereçado à equipe com uma mensagem
  // pronta — o aceite continua sempre gravado no banco, isso é só um aviso adicional mais rápido.
  function acceptProposal() {
    startTransition(async () => {
      const ok = await respondPublicProposalAction(slug, "accepted");
      if (!ok) return;
      setStatus("accepted");
      if (closing?.whatsappOnAccept) {
        const { phone, message } = closing.whatsappOnAccept;
        const digits = phone.replace(/\D/g, "");
        window.open(`https://wa.me/${digits}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
      }
    });
  }

  // Ação junto do fechamento (pedido explícito: "junto do Vamos começar?", nunca um bloco à
  // parte embaixo) — botão só de aceitar, ou a confirmação depois de aceita/recusada. `null`
  // quando o status não é mais respondível e nunca foi aceito/recusado (ex.: draft — não deveria
  // chegar até aqui, `get_public_proposal` já filtra, mas defensivo mesmo assim).
  const closingAction =
    status === "accepted" ? (
      <p className="text-sm" style={{ color: accent }}>
        Proposta aceita. Em breve entraremos em contato.
      </p>
    ) : status === "rejected" ? (
      <p className="text-sm text-white/50">Proposta recusada.</p>
    ) : RESPONDABLE_STATUSES.has(status) ? (
      <button
        type="button"
        disabled={isPending}
        onClick={acceptProposal}
        className="rounded-full px-8 py-4 text-sm font-medium text-black transition-transform hover:scale-[1.02] active:scale-95 disabled:pointer-events-none disabled:opacity-60"
        style={{ backgroundColor: accent }}
      >
        {isPending ? "Enviando..." : "Aceitar proposta"}
      </button>
    ) : null;

  return (
    // Auditoria mobile: `MotionConfig reducedMotion="user"` respeita `prefers-reduced-motion` do
    // sistema pra TODA animação framer-motion da árvore de uma vez (headline, reveals de scroll,
    // atmosfera do Hero) — CSS `@media (prefers-reduced-motion)` sozinho não bastaria aqui, o
    // motor de animação do framer-motion não usa `transition:` do CSS. `overflow-x-hidden` é
    // rede de segurança contra overflow horizontal — nenhuma seção individual deveria vazar
    // largura, mas isso garante que, se algo vazar no futuro, a PÁGINA nunca ganha barra de
    // rolagem lateral (o elemento causador só fica cortado ali).
    <MotionConfig reducedMotion="user">
      <main className="min-h-screen overflow-x-hidden bg-black">
        <ProposalScrollProgress accent={accent} />
        {hero && <ProposalHero content={hero} accent={accent} />}
        {pillars && <ProposalPillars intro={pillars.intro} pillars={pillars.pillars} accent={accent} />}
        {roadmap && <ProposalRoadmap content={roadmap} accent={accent} />}
        {tvProgram && <ProposalTvProgram content={tvProgram} accent={accent} />}
        {acquisition && <ProposalAcquisition content={acquisition} accent={accent} />}
        {budget && <ProposalBudget content={budget} accent={accent} />}
        {portfolio && <ProposalPortfolio content={portfolio} accent={accent} />}
        {closing && <ProposalClosing content={closing} brandName={proposal.brandName} action={closingAction} />}
      </main>
    </MotionConfig>
  );
}
