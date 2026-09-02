import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cormorantGaramond, italiana, mulish } from "./fonts";
import "./apresentacao.css";
import { ScrollRevealObserver } from "@/components/apresentacao-cara-a-cara/scroll-reveal-observer";
import { CapaSection } from "@/components/apresentacao-cara-a-cara/capa-section";
import { ApresentadoraSection } from "@/components/apresentacao-cara-a-cara/apresentadora-section";
import { PropostaSection } from "@/components/apresentacao-cara-a-cara/proposta-section";
import { ObjetivosSection } from "@/components/apresentacao-cara-a-cara/objetivos-section";
import { TemasSection } from "@/components/apresentacao-cara-a-cara/temas-section";
import { AlcanceSection } from "@/components/apresentacao-cara-a-cara/alcance-section";
import { GaleriaSection } from "@/components/apresentacao-cara-a-cara/galeria-section";
import { FooterSection } from "@/components/apresentacao-cara-a-cara/footer-section";

/**
 * Mídia Kit "Cara a Cara com a Beleza" — reprodução fiel de
 * https://rsplay.com.br/cara_a_cara_com_a_beleza.html, servida em `/clients/elenita/public/apresentacao`.
 *
 * Rota isolada, irmã de `galeria/`/`proposta/`/`prospeccao/` dentro de `/clients/[client]/public/**`
 * (mesmo padrão de `proposta/page.tsx`: própria árvore de componentes, própria fonte de dados —
 * aqui hardcoded, já que é uma reprodução 1:1 de uma página externa específica, não um template
 * reutilizável). Só responde pra `client === "elenita"`; qualquer outro slug cai em notFound(),
 * sem afetar nenhuma outra rota. Estilos/fontes isolados nesta pasta (`apresentacao.css`,
 * `fonts.ts`, prefixo de classe `cc-`) — zero alteração em `app/globals.css` ou no layout raiz.
 *
 * ÚNICA alteração de conteúdo vs. a referência: a seção "Comercial" (Oportunidades & Cotas de
 * Parceria — os 3 cards, botões "Solicitar Proposta/Aprovação" e o bloco "Entre em Contato") foi
 * removida por pedido explícito. A faixa final de marca/copyright (que na referência mora dentro
 * do mesmo slide) virou `FooterSection`, conectando direto depois da Galeria.
 */
export const metadata: Metadata = {
  title: "Mídia Kit Oficial — Cara a Cara com a Beleza",
  description: "Mídia Kit Oficial • by Dra. Elenita Luzardo • RS Play — Canal 524 da Claro.",
  robots: { index: false, follow: false },
};

export default async function ApresentacaoPage({ params }: { params: Promise<{ client: string }> }) {
  const { client } = await params;
  if (client !== "elenita") notFound();

  return (
    <div className={`cc-page ${cormorantGaramond.variable} ${italiana.variable} ${mulish.variable} cc-font-sans antialiased selection:bg-[#B08D4F] selection:text-white`}>
      <ScrollRevealObserver />
      <CapaSection />
      <ApresentadoraSection />
      <PropostaSection />
      <ObjetivosSection />
      <TemasSection />
      <AlcanceSection />
      <GaleriaSection />
      <FooterSection />
    </div>
  );
}
