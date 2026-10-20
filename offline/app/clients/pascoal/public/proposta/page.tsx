import type { Metadata } from "next";
import PascoalPropostaPage, { metadata as onlineMetadata } from "@/app/pascoal-proposta/page";

/**
 * "Proposta de Continuidade" (item extra do menu, aparece após 10s). Online, essa URL é um rewrite
 * para `app/pascoal-proposta/page.tsx`; offline, a rota existe direto e renderiza a mesma página.
 */
export const metadata: Metadata = onlineMetadata;

export default PascoalPropostaPage;
