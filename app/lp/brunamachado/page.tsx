import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { BrunaLp } from "@/components/lp-brunamachado/bruna-lp";

/**
 * `/lp/brunamachado` — Landing page da advogada trabalhista Bruna Montenegro. O hero reproduz o
 * design entregue pela equipe (HTML/CSS próprios), portado para o projeto. Fontes DM Sans (corpo)
 * e Playfair Display (marca/títulos) carregadas aqui (next/font) e expostas como `--lp-sans` /
 * `--lp-serif`. Não indexável — material de cliente.
 */
const sans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--lp-sans", display: "swap" });
const serif = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--lp-serif", display: "swap" });

export const metadata: Metadata = {
  title: "Bruna Montenegro | Advocacia Trabalhista",
  description: "Bruna Montenegro — Advocacia Trabalhista. Orientação jurídica em conflitos de trabalho.",
  robots: { index: false, follow: false },
};

export default function BrunaMachadoLpPage() {
  return (
    <div className={`${sans.variable} ${serif.variable}`}>
      <BrunaLp />
    </div>
  );
}
