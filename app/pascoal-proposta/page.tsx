import type { Metadata } from "next";
import { pascoalProposal } from "@/content/clients/pascoal/proposal";
import { ProposalPascoalHero } from "@/components/proposal-pascoal/proposal-pascoal-hero";
import { ProposalPascoalOperationSystem } from "@/components/proposal-pascoal/proposal-pascoal-operation-system";
import { ProposalPascoalPositioning } from "@/components/proposal-pascoal/proposal-pascoal-positioning";
import { ProposalPascoalScope } from "@/components/proposal-pascoal/proposal-pascoal-scope";
import { ProposalPascoalFormat } from "@/components/proposal-pascoal/proposal-pascoal-format";
import { ProposalPascoalInvestment } from "@/components/proposal-pascoal/proposal-pascoal-investment";

/**
 * Proposta de Continuidade — Pascoal Bombas.
 *
 * URL pública: `/clients/pascoal/public/proposta` (ver rewrite `beforeFiles` em
 * `next.config.mjs`). Rota, componentes (`components/proposal-pascoal/**`) e tipos
 * (`lib/pascoal-proposal/types.ts`) totalmente próprios — zero import de código usado pela
 * Elenita ou de qualquer coisa da Prospecção (`/clients/pascoal/public/prospeccao`, intocada).
 *
 * VERSÃO FINAL — dirigida à Júlia, já alinhada numa reunião anterior. Hero intocado. Estrutura:
 * Hero → Como projetamos sua operação (+ animação de 3 perfis conectados) → Posicionamento →
 * O que a proposta contempla → Formato: teste e continuidade → Investimento (preço estático,
 * sem configurador — o criador conversacional da versão anterior foi substituído por completo).
 */
export const metadata: Metadata = {
  title: pascoalProposal.metaTitle,
  description: pascoalProposal.metaDescription,
  robots: { index: false, follow: false },
};

export default function PascoalPropostaPage() {
  const { accentColor: accent } = pascoalProposal;

  return (
    <main className="min-h-screen bg-black">
      <ProposalPascoalHero content={pascoalProposal.hero} accent={accent} />
      <ProposalPascoalOperationSystem content={pascoalProposal.operationSystem} accent={accent} />
      <ProposalPascoalPositioning content={pascoalProposal.positioning} accent={accent} />
      <ProposalPascoalScope content={pascoalProposal.scope} accent={accent} />
      <ProposalPascoalFormat content={pascoalProposal.format} accent={accent} />
      <ProposalPascoalInvestment content={pascoalProposal} accent={accent} />
    </main>
  );
}
