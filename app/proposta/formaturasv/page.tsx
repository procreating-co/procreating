import type { Metadata } from "next";
import { FormaturaProposal } from "@/components/proposal-formaturasv/formatura-proposal";

/**
 * `/proposta/formaturasv` — Proposta de Cobertura Audiovisual da Procreating Co. para uma
 * formatura em Florianópolis/SC. Página one-off (mesma arquitetura da `urbancompany`), fiel à
 * linguagem visual da referência. Não indexável — é material comercial enviado ao cliente.
 */
export const metadata: Metadata = {
  title: "Proposta de Cobertura Audiovisual · Formatura Florianópolis/SC | Procreating Co.",
  description: "Proposta de cobertura audiovisual da Procreating Co. para formatura em Florianópolis/SC.",
  robots: { index: false, follow: false },
};

export default function FormaturaSvProposalPage() {
  return <FormaturaProposal />;
}
