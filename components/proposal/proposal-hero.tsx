"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { ProposalTypingHeadline } from "@/components/proposal/proposal-typing-headline";
import { ProposalHeroAtmosphere } from "@/components/proposal/proposal-hero-atmosphere";
import type { ProposalContent } from "@/lib/clients/proposal-types";

export function ProposalHero({ content, accent }: { content: ProposalContent["hero"]; accent: string }) {
  return (
    <section className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden bg-black px-6 text-center text-white lg:px-12">
      <ProposalHeroAtmosphere accent={accent} />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center">
        <span className="mb-10 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-1.5 font-mono text-[11px] uppercase tracking-wide text-white/60">
          {content.eyebrow}
        </span>

        <ProposalTypingHeadline text={content.title} className="font-display text-6xl leading-[0.98] tracking-tight sm:text-7xl md:text-8xl" />

        <p className="mt-10 max-w-md text-balance text-lg leading-relaxed tracking-wide text-white/70 sm:text-xl">{content.subtitle}</p>
      </div>

      {/* Indicador de scroll — parte da interface, não um botão: sem borda/circulo, só o ícone flutuando devagar. */}
      <motion.a
        href="#operacao"
        aria-label="Rolar para a operação"
        className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2 text-white/35 transition-colors duration-300 hover:text-white/70"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown className="size-5" />
      </motion.a>
    </section>
  );
}
