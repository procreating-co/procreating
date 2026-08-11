"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { ProposalPascoalHeroAtmosphere } from "@/components/proposal-pascoal/proposal-pascoal-hero-atmosphere";
import { ProposalPascoalBadge } from "@/components/proposal-pascoal/proposal-pascoal-badge";
import type { PascoalProposalContent } from "@/lib/pascoal-proposal/types";

/**
 * Hero editorial premium da proposta da Pascoal — só eyebrow + H1, sem subtítulo (removido a
 * pedido). O H1 usa texto normal (não fatiado em `<span>` por letra) de propósito: um
 * `inline-block` por caractere quebra a regra de quebra de linha do navegador — ele passa a
 * poder inserir uma quebra entre QUALQUER par de caracteres, não só nos espaços. Texto normal +
 * `text-balance` deixa o navegador escolher a quebra certa entre PALAVRAS em qualquer largura de
 * tela, sem nunca partir uma no meio.
 */
export function ProposalPascoalHero({ content, accent }: { content: PascoalProposalContent["hero"]; accent: string }) {
  return (
    <section className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden bg-black px-6 py-24 text-center text-white sm:min-h-[95vh] lg:px-12">
      <ProposalPascoalHeroAtmosphere accent={accent} />

      <div className="relative z-10 mx-auto flex max-w-[1100px] flex-col items-center">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }} className="mb-9">
          <ProposalPascoalBadge label={content.eyebrow} accent={accent} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="text-balance font-display font-normal leading-[1.05] tracking-[-0.02em] text-white [text-wrap:balance]"
          style={{ fontSize: "clamp(2.75rem, 6vw, 6.5rem)" }}
        >
          {content.title}
        </motion.h1>
      </div>

      <motion.a
        href="#operacao"
        aria-label="Rolar para os serviços"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.75, ease: "easeOut" }}
        className="group absolute bottom-10 left-1/2 z-10 -translate-x-1/2"
      >
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="flex size-10 items-center justify-center rounded-full border border-white/15 text-white/40 transition-all duration-300 group-hover:scale-110 group-hover:border-white/30 group-hover:text-white/70"
        >
          <ChevronDown className="size-4" />
        </motion.span>
      </motion.a>
    </section>
  );
}
