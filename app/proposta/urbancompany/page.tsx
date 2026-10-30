import type { Metadata } from "next";
import { UrbanProposal } from "@/components/proposal-urbancompany/urban-proposal";

/**
 * `/proposta/urbancompany` — Proposta Audiovisual da Procreating Co. para a Urban Company.
 * Página one-off construída à mão (fora do sistema de propostas do ERP), fiel ao PDF de 30/10/2026.
 * Não indexável — é um material comercial enviado diretamente ao cliente.
 */
export const metadata: Metadata = {
  title: "Proposta Audiovisual · Urban Company | Procreating Co.",
  description: "Proposta audiovisual da Procreating Co. para a Urban Company.",
  robots: { index: false, follow: false },
};

export default function UrbanCompanyProposalPage() {
  return <UrbanProposal />;
}
