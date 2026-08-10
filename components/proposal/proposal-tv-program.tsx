"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ProposalSectionHeader } from "@/components/proposal/proposal-section-header";
import type { ProposalContent } from "@/lib/clients/proposal-types";

/**
 * Programa de TV integrado à operação como um fluxo, não como uma "quarta frente" separada —
 * pedido explícito. Passos entram em sequência conforme rolam pra tela.
 */
export function ProposalTvProgram({ content, accent }: { content: ProposalContent["tvProgram"]; accent: string }) {
  return (
    <section className="border-t border-white/10 bg-black px-6 py-24 text-white lg:px-12 lg:py-32">
      <div className="mx-auto max-w-4xl">
        <ProposalSectionHeader eyebrow={content.eyebrow} heading={content.heading} accent={accent} />
        <p className="mx-auto mt-6 max-w-lg text-balance text-center text-base leading-relaxed text-white/55">{content.description}</p>
      </div>

      <div className="mx-auto mt-14 flex max-w-5xl flex-col items-center gap-3 lg:flex-row lg:justify-center lg:gap-0">
        {content.steps.map((step, index) => (
          <div key={step} className="flex items-center gap-3 lg:gap-0">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.5, delay: index * 0.12, ease: "easeOut" }}
              className="flex flex-col items-center gap-3 px-5 py-4 text-center lg:w-[170px]"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border font-mono text-xs" style={{ borderColor: accent, color: accent }}>
                {index + 1}
              </span>
              <span className="text-sm text-white/75">{step}</span>
            </motion.div>
            {index < content.steps.length - 1 && <ArrowRight className="hidden size-4 shrink-0 text-white/20 lg:block" />}
          </div>
        ))}
      </div>
    </section>
  );
}
