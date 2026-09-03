import { Cormorant_Garamond, Italiana, Mulish } from "next/font/google";

/**
 * Fontes exclusivas desta página — a referência (rsplay.com.br/cara_a_cara_com_a_beleza.html)
 * carrega Cormorant Garamond/Italiana/Mulish via `<link>` do Google Fonts direto no `<head>`.
 * Aqui usamos `next/font/google` (auto-hospedado, sem requisição externa em runtime) com as
 * mesmas famílias/pesos/estilos — resultado visual idêntico, carregamento melhor. Isolado nesta
 * pasta: não mexe nas fontes globais do `app/layout.tsx` (Instrument Sans/Geist), que continuam
 * intocadas pro resto do site.
 */
export const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--cc-font-serif",
  display: "swap",
});

export const italiana = Italiana({
  subsets: ["latin"],
  weight: "400",
  variable: "--cc-font-editorial",
  display: "swap",
});

export const mulish = Mulish({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "900"],
  variable: "--cc-font-sans",
  display: "swap",
});
