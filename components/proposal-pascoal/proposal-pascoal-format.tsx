"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { PascoalProposalContent } from "@/lib/pascoal-proposal/types";

/** Sequência real no tempo (teste → continuidade) — aqui a numeração faz sentido, ao contrário das seções de serviço. */
export function ProposalPascoalFormat({ content, accent }: { content: PascoalProposalContent["format"]; accent: string }) {
  return (
    <section className="border-t border-white/10 bg-black px-6 py-24 text-white lg:px-12 lg:py-32">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-balance text-center font-display text-3xl leading-[1.05] tracking-tight text-white sm:text-4xl">{content.heading}</h2>

        <div className="mt-14 flex flex-col gap-4 sm:flex-row sm:items-stretch">
          {content.steps.map((step, index) => (
            <div key={step.number} className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-stretch">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: index * 0.12, ease: "easeOut" }}
                className="flex flex-1 flex-col border border-white/10 p-7 sm:p-8"
              >
                <span className="font-mono text-sm tabular-nums" style={{ color: accent }}>
                  {step.number}
                </span>
                <h3 className="mt-4 font-display text-xl text-white">{step.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-white/55">{step.description}</p>
              </motion.div>
              {index < content.steps.length - 1 && (
                <div className="flex items-center justify-center py-1 sm:py-0">
                  <ArrowRight className="size-4 shrink-0 rotate-90 text-white/15 sm:rotate-0" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
