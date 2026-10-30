import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import { BrunaLp } from "@/components/lp-brunamachado/bruna-lp";

/**
 * `/lp/brunamachado` — Landing page de advogada (Bruna Machado), construída no estilo/estrutura de
 * uma LP jurídica de conversão, com conteúdo próprio/placeholder (ver `components/lp-brunamachado`).
 * Fonte serifada carregada aqui (next/font, nível de módulo) e exposta como `--lp-serif` pro
 * componente. Não indexável — é um material de cliente, ainda em preenchimento.
 */
const serif = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--lp-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bruna Montenegro · Advocacia Trabalhista",
  description: "Seus direitos no trabalho merecem ser respeitados. Orientação jurídica trabalhista com atendimento humano e próximo.",
  robots: { index: false, follow: false },
};

export default function BrunaMachadoLpPage() {
  return (
    <div className={serif.variable}>
      <BrunaLp />
    </div>
  );
}
