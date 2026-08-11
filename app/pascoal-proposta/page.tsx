import type { Metadata } from "next";
import { pascoalProposal } from "@/content/clients/pascoal/proposal";
import { ProposalPascoalHero } from "@/components/proposal-pascoal/proposal-pascoal-hero";
import { ProposalPascoalServicePillars } from "@/components/proposal-pascoal/proposal-pascoal-service-pillars";
import { ProposalPascoalConfigurator } from "@/components/proposal-pascoal/proposal-pascoal-configurator";

/**
 * Proposta de Continuidade — Pascoal Bombas.
 *
 * URL pública: `/clients/pascoal/public/proposta` (ver rewrite `beforeFiles` em
 * `next.config.mjs`). Rota, componentes (`components/proposal-pascoal/**`) e tipos
 * (`lib/pascoal-proposal/types.ts`) totalmente próprios — zero import de código usado pela
 * Elenita ou de qualquer coisa da Prospecção (`/clients/pascoal/public/prospeccao`, intocada).
 *
 * Estrutura (evolução premium — pedido explícito): Hero → 3 pilares de serviço → Configurador de
 * plano (que já inclui resumo dinâmico + CTA de WhatsApp). O antigo bloco de closing textual
 * ("O próximo passo é agora.") foi removido sem substituto — a página termina concentrada no
 * configurador.
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
      <ProposalPascoalServicePillars intro={pascoalProposal.pillarsIntro} pillars={pascoalProposal.servicePillars} accent={accent} />
      <ProposalPascoalConfigurator content={pascoalProposal} accent={accent} />
    </main>
  );
}
