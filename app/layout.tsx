import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono, Instrument_Sans, Instrument_Serif, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: '--font-instrument'
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: '--font-instrument-serif'
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: '--font-jetbrains'
});

// Geist/Geist Mono — só usados dentro do shell interno (`.os-shell`, ver app/globals.css), que
// redefine --font-sans/--font-mono/--font-display pra apontar pra estes vars. Carregados aqui
// (junto dos fonts existentes, sem removê-los) porque next/font/google precisa da chamada no
// nível do módulo — /admin e /clients continuam 100% em Instrument Sans/Serif, intocados.
const geistSans = Geist({
  subsets: ["latin"],
  variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: '--font-geist-mono',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Procreating — Plataforma de Projetos',
  description: 'Entrega de projetos de posicionamento digital da Procreating.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // As classes de variável do next/font (`--font-instrument` etc.) precisam estar em <html>,
    // não só em <body>: app/globals.css lê essas variáveis a partir de `:root`
    // (--font-family-sans: var(--font-instrument), ...) — custom property só enxerga outra
    // custom property definida em elemento ancestral ou nele mesmo, nunca num descendente. Com a
    // classe só em <body>, `:root` não via `--font-instrument` e a fonte caía no fallback padrão
    // do Tailwind (bug encontrado no redesign monocromático/Geist).
    <html
      lang="pt-BR"
      className={`bg-background ${instrumentSans.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} ${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
