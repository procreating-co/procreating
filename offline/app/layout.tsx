import type { ReactNode } from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/app/globals.css";

/**
 * Layout raiz da apresentação offline. Igual a `app/layout.tsx` do app online, com duas trocas:
 * - fontes: mesmas famílias (Instrument Sans / JetBrains Mono, variáveis `--font-instrument` e
 *   `--font-jetbrains` lidas por `app/globals.css`), mas de arquivos em `offline/fonts/` via
 *   `next/font/local` — o build e a apresentação nunca dependem do Google Fonts;
 * - sem `<Analytics />` da Vercel (faria request pra `/_vercel/insights`, inexistente localmente).
 * Geist/Geist Mono não entram: só são usados no painel interno (`.os-shell`), nunca na apresentação.
 */
const instrumentSans = localFont({
  src: "../fonts/InstrumentSans-latin.woff2",
  weight: "400 700",
  style: "normal",
  display: "swap",
  variable: "--font-instrument",
});

const jetbrainsMono = localFont({
  src: "../fonts/JetBrainsMono-latin.woff2",
  weight: "100 800",
  style: "normal",
  display: "swap",
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "Pascoal Bombas | Projeto Inicial",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pt-BR" className={`bg-background ${instrumentSans.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
