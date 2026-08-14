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
        {/* Badge — mesmo componente/medidas da referência (proposal-pascoal-badge.tsx): pill com
            pontinho na cor de destaque, border/15, px-4 py-1.5, tracking-[0.22em]. Só a cor muda. */}
        <span className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/15 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-white/70">
          <span className="size-1 shrink-0 rounded-full" style={{ backgroundColor: accent }} aria-hidden="true" />
          {content.eyebrow}
        </span>

        <ProposalTypingHeadline text={content.title} className="font-display text-6xl leading-[0.98] tracking-tight sm:text-7xl md:text-8xl" />

        <p className="mt-5 max-w-md text-balance text-lg leading-relaxed text-white/70 sm:text-xl">{content.subtitle}</p>
      </div>

      {/* Indicador de scroll — parte da interface, não um botão: sem borda/circulo, só o ícone flutuando devagar. */}
      <motion.a
        href="#operacao"
        aria-label="Rolar para a operação"
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-white/30 transition-colors duration-300 hover:text-white/60"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown className="size-4" />
      </motion.a>
    </section>
  );
}
